'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Send,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api/api-error';
import {
  getChatMessages,
  getChatRooms,
  markChatRoomRead,
  sendChatMessage,
} from '@/services/chat.service';
import type { SessionUser } from '@/types/auth';
import type {
  ChatMessage,
  ChatReadUpdatedPayload,
  ChatRoom,
  ChatSocketAcknowledgement,
} from '@/types/chat';

type DeliveryState = 'sending' | 'failed';
type DisplayMessage = ChatMessage & {
  deliveryState?: DeliveryState;
  /** เก็บไฟล์เฉพาะ optimistic message เพื่อให้กดลองส่งใหม่ได้ */
  attachmentFile?: File;
};

interface SelectedChatImage {
  file: File;
  previewUrl: string;
}

interface ChatClientProps {
  currentUser: SessionUser;
  accessToken: string;
  socketUrl: string;
  initialRoomId?: string;
}

const messageTimeFormatter = new Intl.DateTimeFormat('th-TH', {
  hour: '2-digit',
  minute: '2-digit',
});
const CHAT_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const CHAT_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

/** ห้องถือว่าเปิดอ่านอยู่เมื่อ tab มองเห็นและหน้าต่าง browser มี focus จริง */
function isDocumentActive(): boolean {
  return document.visibilityState === 'visible' && document.hasFocus();
}

/** แสดง error ที่คาดการณ์ได้โดยไม่เผยรายละเอียดภายในระบบ */
function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

/** รวมข้อความจริงกับ optimistic message โดยใช้ id/clientMessageId ป้องกันซ้ำ */
function upsertMessage(
  current: DisplayMessage[],
  incoming: ChatMessage,
): DisplayMessage[] {
  const existing = current.find(
    (message) =>
      message.id === incoming.id ||
      (incoming.clientMessageId &&
        message.clientMessageId === incoming.clientMessageId),
  );
  const filtered = current.filter(
    (message) =>
      message.id !== incoming.id &&
      (!incoming.clientMessageId ||
        message.clientMessageId !== incoming.clientMessageId),
  );
  const mergedMessage: DisplayMessage = {
    ...incoming,
    isRead: incoming.isRead ?? existing?.isRead ?? false,
  };
  return [...filtered, mergedMessage].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

/** อัปเดต preview ห้องทันทีจาก event เดียวกับข้อความ โดยไม่ต้องรอโหลด inbox รอบถัดไป */
function upsertRoomLatestMessage(
  current: ChatRoom[],
  incoming: ChatMessage,
  currentUserId: string,
  isActiveSelectedRoom: boolean,
): ChatRoom[] {
  const room = current.find((item) => item.id === incoming.roomId);
  if (!room) return current;

  const unreadCount =
    incoming.senderId === currentUserId || isActiveSelectedRoom
      ? 0
      : (room.unreadCount ?? 0) + 1;
  const updatedRoom: ChatRoom = {
    ...room,
    latestMessage: incoming,
    lastMessageAt: incoming.createdAt,
    updatedAt: incoming.createdAt,
    unreadCount,
  };

  // Backend เรียงห้องตาม lastMessageAt จึงย้ายห้องที่มีข้อความใหม่ขึ้นบนสุดทันที
  return [
    updatedRoom,
    ...current.filter((item) => item.id !== incoming.roomId),
  ];
}

/** Client Component เจ้าของ state ของ inbox, thread, pagination และ Socket.IO */
export function ChatClient({
  currentUser,
  accessToken,
  socketUrl,
  initialRoomId,
}: ChatClientProps) {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomIdsRef = useRef(new Set<string>());
  const selectedRoomIdRef = useRef<string | null>(initialRoomId ?? null);
  const messageLoadRequestRef = useRef(0);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlsRef = useRef(new Set<string>());
  const shouldScrollToBottomRef = useRef(false);

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    initialRoomId ?? null,
  );
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [composer, setComposer] = useState('');
  const [selectedImage, setSelectedImage] = useState<SelectedChatImage | null>(
    null,
  );
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(
    Boolean(initialRoomId),
  );
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  );

  /** คืนหน่วยความจำของ object URL เมื่อรูป preview ไม่ถูกใช้งานแล้ว */
  const releaseObjectUrl = useCallback((url: string | null) => {
    if (!url?.startsWith('blob:') || !objectUrlsRef.current.has(url)) return;
    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(url);
  }, []);

  /** Mark read เฉพาะห้องที่ผู้ใช้กำลังมองเห็นจริง และล้าง unread หลัง Backend ตอบสำเร็จ */
  const markRoomReadIfActive = useCallback(
    async (roomId: string) => {
      if (selectedRoomIdRef.current !== roomId || !isDocumentActive()) return;

      try {
        const socket = socketRef.current;
        if (socket?.connected) {
          await new Promise<void>((resolve, reject) => {
            const timeout = window.setTimeout(
              () => reject(new Error('Socket acknowledgement timeout')),
              10_000,
            );
            socket.emit(
              'mark_read',
              { roomId },
              (
                acknowledgement: ChatSocketAcknowledgement<ChatReadUpdatedPayload>,
              ) => {
                window.clearTimeout(timeout);
                if (acknowledgement.success) {
                  resolve();
                } else {
                  reject(new Error(acknowledgement.error.message));
                }
              },
            );
          });
        } else {
          await markChatRoomRead(roomId);
        }

        if (selectedRoomIdRef.current !== roomId || !isDocumentActive()) return;
        setRooms((current) =>
          current.map((room) =>
            room.id === roomId ? { ...room, unreadCount: 0 } : room,
          ),
        );
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) {
          router.replace('/login');
        }
      }
    },
    [router],
  );

  /** โหลด inbox ใหม่เพื่อให้ latest message, order และ unread count ตรงกับ Backend */
  const loadRooms = useCallback(async () => {
    try {
      const response = await getChatRooms();
      setRoomsError(null);
      setRooms(response.rooms);
      setSelectedRoomId((current) => {
        if (current && response.rooms.some((room) => room.id === current)) {
          return current;
        }
        if (
          initialRoomId &&
          response.rooms.some((room) => room.id === initialRoomId)
        ) {
          return initialRoomId;
        }
        return null;
      });
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        router.replace('/login');
      }
      setRoomsError(toErrorMessage(error, 'โหลดกล่องข้อความไม่สำเร็จ'));
    } finally {
      setIsRoomsLoading(false);
    }
  }, [initialRoomId, router]);

  /** โหลดหน้าข้อความล่าสุดและกลับลำดับจาก newest-first เป็น oldest-first สำหรับ UI */
  const loadMessages = useCallback(
    async (roomId: string, requestId = ++messageLoadRequestRef.current) => {
      try {
        const response = await getChatMessages(roomId);
        if (requestId !== messageLoadRequestRef.current) return;
        shouldScrollToBottomRef.current = true;
        setMessagesError(null);
        setMessages([...response.items].reverse());
        setNextCursor(response.nextCursor);
      } catch (error) {
        if (requestId !== messageLoadRequestRef.current) return;
        if (error instanceof ApiError && error.statusCode === 401) {
          router.replace('/login');
        }
        setMessagesError(toErrorMessage(error, 'โหลดข้อความไม่สำเร็จ'));
      } finally {
        if (requestId === messageLoadRequestRef.current) {
          setIsMessagesLoading(false);
        }
      }
    },
    [router],
  );

  /** ดึงข้อความล่าสุดแบบเบื้องหลังเมื่อ Socket.IO ใช้งานไม่ได้ */
  const pollLatestMessages = useCallback(async () => {
    const roomId = selectedRoomIdRef.current;
    if (!roomId) return;
    try {
      const response = await getChatMessages(roomId);
      if (roomId !== selectedRoomIdRef.current) return;
      setMessages((current) =>
        [...response.items]
          .reverse()
          .reduce<DisplayMessage[]>(upsertMessage, current),
      );
      await markRoomReadIfActive(roomId);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        router.replace('/login');
      }
    }
  }, [markRoomReadIfActive, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRooms(), 0);
    return () => window.clearTimeout(timer);
  }, [loadRooms]);

  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
    const requestId = ++messageLoadRequestRef.current;
    if (!selectedRoomId) return;
    const timer = window.setTimeout(
      () => void loadMessages(selectedRoomId, requestId),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [loadMessages, selectedRoomId]);

  /** เชื่อม Socket.IO เพียงหนึ่งครั้ง และรับ event ตาม Backend contract */
  useEffect(() => {
    const namespaceUrl = `${socketUrl.replace(/\/$/, '')}/chat`;
    const socket = io(namespaceUrl, { auth: { token: accessToken } });
    const joinedRoomIds = joinedRoomIdsRef.current;
    socketRef.current = socket;

    const handleConnect = () => {
      setIsSocketConnected(true);
      joinedRoomIds.clear();
      const roomId = selectedRoomIdRef.current;
      if (roomId) {
        socket.emit('join_room', { roomId });
        joinedRoomIds.add(roomId);
        void markRoomReadIfActive(roomId);
      }
    };
    const handleDisconnect = () => setIsSocketConnected(false);
    const handleNewMessage = (message: ChatMessage) => {
      if (message.roomId === selectedRoomIdRef.current) {
        const container = messagesContainerRef.current;
        const distanceFromBottom = container
          ? container.scrollHeight -
            container.scrollTop -
            container.clientHeight
          : 0;
        shouldScrollToBottomRef.current = distanceFromBottom < 120;
        setMessages((current) => upsertMessage(current, message));
        void markRoomReadIfActive(message.roomId);
      }
      setRooms((current) => {
        const isActiveSelectedRoom =
          message.roomId === selectedRoomIdRef.current && isDocumentActive();
        return upsertRoomLatestMessage(
          current,
          message,
          currentUser.id,
          isActiveSelectedRoom,
        );
      });
    };
    const handleReadUpdated = (readState: ChatReadUpdatedPayload) => {
      if (
        readState.roomId === selectedRoomIdRef.current &&
        readState.userId !== currentUser.id &&
        readState.lastReadMessageId
      ) {
        setMessages((current) => {
          const boundaryIndex = current.findIndex(
            (message) => message.id === readState.lastReadMessageId,
          );
          if (boundaryIndex < 0) return current;

          return current.map((message, index) =>
            index <= boundaryIndex &&
            message.senderId === currentUser.id &&
            !message.deliveryState
              ? { ...message, isRead: true }
              : message,
          );
        });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleDisconnect);
    socket.on('new_message', handleNewMessage);
    socket.on('read_updated', handleReadUpdated);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleDisconnect);
      socket.off('new_message', handleNewMessage);
      socket.off('read_updated', handleReadUpdated);
      socket.disconnect();
      joinedRoomIds.clear();
      socketRef.current = null;
    };
  }, [accessToken, currentUser.id, markRoomReadIfActive, socketUrl]);

  /** Join ทุกห้องของ inbox เพื่อให้ preview รับข้อความใหม่แม้ไม่ได้เปิดห้องนั้นอยู่ */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected || !isSocketConnected) return;

    for (const room of rooms) {
      if (joinedRoomIdsRef.current.has(room.id)) continue;
      socket.emit('join_room', { roomId: room.id });
      joinedRoomIdsRef.current.add(room.id);
    }
  }, [isSocketConnected, rooms]);

  /** HTTP fallback polling ใช้เฉพาะช่วงที่ realtime disconnected */
  useEffect(() => {
    if (isSocketConnected) return;
    const timer = window.setInterval(() => {
      void loadRooms();
      void pollLatestMessages();
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [isSocketConnected, loadRooms, pollLatestMessages]);

  /** ทุกห้องยังคง join เพื่อรับ preview; ห้องที่เลือกจะอ่านเมื่อหน้าต่าง active เท่านั้น */
  useEffect(() => {
    if (!selectedRoomId) return;
    const socket = socketRef.current;
    if (socket?.connected) {
      if (!joinedRoomIdsRef.current.has(selectedRoomId)) {
        socket.emit('join_room', { roomId: selectedRoomId });
        joinedRoomIdsRef.current.add(selectedRoomId);
      }
    }
    void markRoomReadIfActive(selectedRoomId);
  }, [markRoomReadIfActive, selectedRoomId]);

  /** เมื่อกลับมาเห็น tab หรือ focus หน้าต่าง ให้ mark ห้องที่เปิดอยู่ ณ ตอนนั้น */
  useEffect(() => {
    const handleActivityChange = () => {
      const roomId = selectedRoomIdRef.current;
      if (roomId && isDocumentActive()) void markRoomReadIfActive(roomId);
    };

    document.addEventListener('visibilitychange', handleActivityChange);
    window.addEventListener('focus', handleActivityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleActivityChange);
      window.removeEventListener('focus', handleActivityChange);
    };
  }, [markRoomReadIfActive]);

  /** เลื่อนเฉพาะกล่องข้อความ ไม่ใช้ scrollIntoView ที่อาจพา body ทั้งหน้าลงไปด้วย */
  useEffect(() => {
    if (!shouldScrollToBottomRef.current) return;
    const container = messagesContainerRef.current;
    if (!container) return;

    shouldScrollToBottomRef.current = false;
    const animationFrame = window.requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'auto',
      });
    });
    return () => window.cancelAnimationFrame(animationFrame);
  }, [messages.length, selectedRoomId]);

  /** โหลดข้อความที่เก่ากว่าด้วย cursor จาก Backend */
  async function handleLoadOlder() {
    if (!selectedRoomId || !nextCursor || isLoadingOlder) return;
    const roomId = selectedRoomId;
    const cursor = nextCursor;
    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight ?? 0;
    setIsLoadingOlder(true);
    try {
      const response = await getChatMessages(roomId, cursor);
      if (roomId !== selectedRoomIdRef.current) return;
      const older = [...response.items].reverse();
      setMessages((current) => {
        const knownIds = new Set(current.map((message) => message.id));
        return [
          ...older.filter((message) => !knownIds.has(message.id)),
          ...current,
        ];
      });
      setNextCursor(response.nextCursor);
      window.requestAnimationFrame(() => {
        if (!container || roomId !== selectedRoomIdRef.current) return;
        container.scrollTop += container.scrollHeight - previousScrollHeight;
      });
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        router.replace('/login');
      }
      setMessagesError(toErrorMessage(error, 'โหลดข้อความก่อนหน้าไม่สำเร็จ'));
    } finally {
      setIsLoadingOlder(false);
    }
  }

  /** ส่งข้อความ text ผ่าน realtime; รูปใช้ REST multipart แล้ว Backend broadcast event เดิม */
  async function deliverMessage(
    roomId: string,
    content: string,
    clientMessageId: string,
    temporaryId: string,
    image?: File,
    previewUrl?: string,
  ) {
    try {
      const socket = socketRef.current;
      let savedMessage: ChatMessage;

      if (socket?.connected && !image) {
        savedMessage = await new Promise<ChatMessage>((resolve, reject) => {
          const timeout = window.setTimeout(
            () => reject(new Error('Socket acknowledgement timeout')),
            10_000,
          );
          socket.emit(
            'send_message',
            { roomId, content, clientMessageId },
            (
              acknowledgement: ChatSocketAcknowledgement<{
                message: ChatMessage;
              }>,
            ) => {
              window.clearTimeout(timeout);
              if (acknowledgement.success) {
                resolve(acknowledgement.data.message);
              } else {
                reject(new Error(acknowledgement.error.message));
              }
            },
          );
        });
      } else {
        const response = await sendChatMessage(
          roomId,
          content,
          clientMessageId,
          image,
        );
        savedMessage = response.message;
      }

      setMessages((current) => upsertMessage(current, savedMessage));
      setRooms((current) =>
        upsertRoomLatestMessage(
          current,
          savedMessage,
          currentUser.id,
          roomId === selectedRoomIdRef.current,
        ),
      );
      releaseObjectUrl(previewUrl ?? null);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        router.replace('/login');
      }
      setMessages((current) =>
        current.map((message) =>
          message.id === temporaryId
            ? { ...message, deliveryState: 'failed' }
            : message,
        ),
      );
    }
  }

  /** สร้าง optimistic message โดย sender identity มาจาก session เท่านั้น */
  function handleSend() {
    const content = composer.trim();
    const image = selectedImage;
    if (!selectedRoomId || (!content && !image) || content.length > 4000) {
      return;
    }

    const clientMessageId = crypto.randomUUID();
    const temporaryId = `pending-${clientMessageId}`;
    const optimisticMessage: DisplayMessage = {
      id: temporaryId,
      roomId: selectedRoomId,
      senderId: currentUser.id,
      clientMessageId,
      content,
      imageUrl: image?.previewUrl ?? null,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatarUrl: currentUser.avatarUrl,
      },
      deliveryState: 'sending',
      attachmentFile: image?.file,
    };

    shouldScrollToBottomRef.current = true;
    setMessages((current) => [...current, optimisticMessage]);
    setRooms((current) =>
      upsertRoomLatestMessage(current, optimisticMessage, currentUser.id, true),
    );
    setComposer('');
    setSelectedImage(null);
    setAttachmentError(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    void deliverMessage(
      selectedRoomId,
      content,
      clientMessageId,
      temporaryId,
      image?.file,
      image?.previewUrl,
    );
  }

  /** Retry ใช้ clientMessageId เดิมเพื่อคง idempotency ของ Backend */
  function handleRetry(message: DisplayMessage) {
    if (!message.clientMessageId) return;
    setMessages((current) =>
      current.map((item) =>
        item.id === message.id ? { ...item, deliveryState: 'sending' } : item,
      ),
    );
    void deliverMessage(
      message.roomId,
      message.content,
      message.clientMessageId,
      message.id,
      message.attachmentFile,
      message.imageUrl ?? undefined,
    );
  }

  /** ตรวจชนิด/ขนาดไฟล์ก่อนสร้าง local preview เพื่อลด request ที่ Backend ต้องปฏิเสธ */
  function handleImageSelect(file: File | undefined) {
    if (!file) return;
    releaseObjectUrl(selectedImage?.previewUrl ?? null);
    setSelectedImage(null);

    if (!CHAT_IMAGE_ACCEPT.split(',').includes(file.type)) {
      setAttachmentError('รองรับเฉพาะรูป JPEG, PNG หรือ WEBP');
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }
    if (file.size > CHAT_IMAGE_MAX_SIZE_BYTES) {
      setAttachmentError('รูปภาพต้องมีขนาดไม่เกิน 5 MB');
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    objectUrlsRef.current.add(previewUrl);
    setSelectedImage({ file, previewUrl });
    setAttachmentError(null);
  }

  /** ยกเลิกรูปที่เลือกและคืน object URL ทันที */
  function handleRemoveSelectedImage() {
    releaseObjectUrl(selectedImage?.previewUrl ?? null);
    setSelectedImage(null);
    setAttachmentError(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  function handleSelectRoom(roomId: string) {
    shouldScrollToBottomRef.current = true;
    setIsMessagesLoading(true);
    setMessagesError(null);
    setMessages([]);
    setNextCursor(null);
    for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
    objectUrlsRef.current.clear();
    setSelectedImage(null);
    setAttachmentError(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    setRooms((current) =>
      current.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room,
      ),
    );
    setSelectedRoomId(roomId);
    router.replace(`/chat?room=${roomId}`, { scroll: false });
  }

  /** คืน preview URL ทั้งหมดเมื่อออกจากหน้า Chat */
  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    return () => {
      for (const url of objectUrls) URL.revokeObjectURL(url);
      objectUrls.clear();
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex h-[75vh] min-h-[34rem] overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg">
        {/* Inbox แสดงบน mobile เมื่อยังไม่เลือกห้อง และแสดงคงที่บน desktop */}
        <aside
          className={`${selectedRoomId ? 'hidden sm:flex' : 'flex'} w-full flex-col border-r border-border/60 bg-muted/20 sm:w-80`}
        >
          <div className="flex items-center justify-between border-b border-border/60 p-4">
            <h1 className="flex items-center gap-2 font-bold">
              <MessageCircle className="size-5 text-primary" /> กล่องข้อความ
            </h1>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {isSocketConnected ? (
                <Wifi className="size-3.5 text-primary" />
              ) : (
                <WifiOff className="size-3.5" />
              )}
              {isSocketConnected ? 'Realtime' : 'กำลังเชื่อมต่อ'}
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {isRoomsLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-2xl" />
              ))}
            {!isRoomsLoading && roomsError && (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                <p className="text-sm text-destructive" role="alert">
                  {roomsError}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadRooms()}
                >
                  <RefreshCw className="size-4" /> ลองใหม่
                </Button>
              </div>
            )}
            {!isRoomsLoading && !roomsError && rooms.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <MessageCircle className="size-12 text-muted-foreground/50" />
                <p className="font-semibold">ยังไม่มีข้อความ</p>
                <p className="text-xs text-muted-foreground">
                  เปิดรายละเอียดประกาศแล้วกดแชทเพื่อติดต่อเจ้าของ
                </p>
              </div>
            )}
            {rooms.map((room) => {
              const memberName = room.otherMember
                ? `${room.otherMember.firstName} ${room.otherMember.lastName}`
                : 'สมาชิก PAWND';
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleSelectRoom(room.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                    room.id === selectedRoomId
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-transparent hover:bg-muted'
                  }`}
                >
                  <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">
                    {room.otherMember?.avatarUrl ? (
                      <Image
                        src={room.otherMember.avatarUrl}
                        alt={memberName}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      memberName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-bold">
                        {memberName}
                      </span>
                      {room.lastMessageAt && (
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {messageTimeFormatter.format(
                            new Date(room.lastMessageAt),
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex-1 truncate text-xs text-muted-foreground">
                        {room.latestMessage
                          ? room.latestMessage.content ||
                            (room.latestMessage.imageUrl ? 'รูปภาพ' : 'ข้อความ')
                          : `เรื่อง ${room.post.petName ?? 'ประกาศสัตว์เลี้ยง'}`}
                      </span>
                      {!!room.unreadCount && room.unreadCount > 0 && (
                        <span className="flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                          {room.unreadCount > 99 ? '99+' : room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Thread แสดงเมื่อเลือกห้อง หรือเป็น empty selection บน desktop */}
        <section
          className={`${selectedRoomId ? 'flex' : 'hidden sm:flex'} min-h-0 min-w-0 flex-1 flex-col bg-card`}
        >
          {!selectedRoom ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              {isRoomsLoading ? (
                <LoaderCircle className="size-8 animate-spin text-primary" />
              ) : (
                <MessageCircle className="size-14 text-muted-foreground/40" />
              )}
              <p className="font-semibold">เลือกห้องเพื่อเริ่มสนทนา</p>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-border/60 p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  aria-label="กลับไปกล่องข้อความ"
                  onClick={() => {
                    setSelectedRoomId(null);
                    router.replace('/chat', { scroll: false });
                  }}
                >
                  <ArrowLeft className="size-5" />
                </Button>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-bold">
                    {selectedRoom.otherMember
                      ? `${selectedRoom.otherMember.firstName} ${selectedRoom.otherMember.lastName}`
                      : 'สมาชิก PAWND'}
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">
                    เรื่อง {selectedRoom.post.petName ?? 'ประกาศสัตว์เลี้ยง'}
                  </p>
                </div>
              </header>

              <div
                ref={messagesContainerRef}
                className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 overscroll-contain"
              >
                {nextCursor && !isMessagesLoading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mx-auto"
                    disabled={isLoadingOlder}
                    onClick={() => void handleLoadOlder()}
                  >
                    {isLoadingOlder && (
                      <LoaderCircle className="size-4 animate-spin" />
                    )}{' '}
                    โหลดข้อความก่อนหน้า
                  </Button>
                )}
                {isMessagesLoading && (
                  <div className="space-y-3">
                    <Skeleton className="h-14 w-2/3 rounded-2xl" />
                    <Skeleton className="ml-auto h-16 w-3/5 rounded-2xl" />
                    <Skeleton className="h-12 w-1/2 rounded-2xl" />
                  </div>
                )}
                {!isMessagesLoading && messagesError && (
                  <div className="m-auto flex flex-col items-center gap-3 text-center">
                    <p className="text-sm text-destructive" role="alert">
                      {messagesError}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsMessagesLoading(true);
                        void loadMessages(selectedRoom.id);
                      }}
                    >
                      <RefreshCw className="size-4" /> ลองใหม่
                    </Button>
                  </div>
                )}
                {!isMessagesLoading &&
                  !messagesError &&
                  messages.length === 0 && (
                    <div className="m-auto text-center">
                      <MessageCircle className="mx-auto size-10 text-muted-foreground/40" />
                      <p className="mt-2 font-semibold">เริ่มต้นบทสนทนา</p>
                      <p className="text-xs text-muted-foreground">
                        แนะนำตัวและแจ้งข้อมูลเกี่ยวกับประกาศนี้ได้เลย
                      </p>
                    </div>
                  )}
                {!isMessagesLoading &&
                  messages.map((message) => {
                    const isOwn = message.senderId === currentUser.id;
                    const isRead = isOwn && message.isRead === true;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-[85%] sm:max-w-md">
                          <div
                            className={`overflow-hidden rounded-2xl text-sm ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
                          >
                            {message.imageUrl && (
                              <div className="relative h-48 w-64 max-w-full bg-muted/40">
                                <Image
                                  src={message.imageUrl}
                                  alt="รูปภาพที่แนบในข้อความ"
                                  fill
                                  sizes="(max-width: 640px) 72vw, 256px"
                                  className="object-cover"
                                  unoptimized={message.imageUrl.startsWith(
                                    'blob:',
                                  )}
                                />
                              </div>
                            )}
                            {message.content && (
                              <p className="whitespace-pre-wrap break-words px-4 py-3">
                                {message.content}
                              </p>
                            )}
                          </div>
                          <div
                            className={`mt-1 flex items-center gap-1 text-[10px] text-muted-foreground ${isOwn ? 'justify-end' : ''}`}
                          >
                            <span>
                              {messageTimeFormatter.format(
                                new Date(message.createdAt),
                              )}
                            </span>
                            {isOwn && message.deliveryState === 'sending' && (
                              <LoaderCircle className="size-3 animate-spin" />
                            )}
                            {isOwn && message.deliveryState === 'failed' && (
                              <button
                                type="button"
                                className="font-semibold text-destructive hover:underline"
                                onClick={() => handleRetry(message)}
                              >
                                ส่งไม่สำเร็จ · ลองใหม่
                              </button>
                            )}
                            {isOwn &&
                              !message.deliveryState &&
                              (isRead ? (
                                <CheckCheck
                                  className="size-3.5 text-primary"
                                  aria-label="อ่านแล้ว"
                                />
                              ) : (
                                <Check
                                  className="size-3.5"
                                  aria-label="ส่งแล้ว"
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Composer รองรับข้อความและรูปหนึ่งรูปตาม Backend multipart contract */}
              <div className="border-t border-border/60 p-3">
                {selectedImage && (
                  <div className="mb-2 flex items-start gap-2 rounded-2xl border border-border bg-muted/30 p-2">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={selectedImage.previewUrl}
                        alt="ตัวอย่างรูปภาพก่อนส่ง"
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="truncate text-xs font-semibold">
                        {selectedImage.file.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {(selectedImage.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0"
                      aria-label="ยกเลิกรูปภาพที่เลือก"
                      onClick={handleRemoveSelectedImage}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
                {attachmentError && (
                  <p className="mb-2 text-xs text-destructive" role="alert">
                    {attachmentError}
                  </p>
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept={CHAT_IMAGE_ACCEPT}
                    className="sr-only"
                    aria-label="เลือกรูปภาพสำหรับส่ง"
                    onChange={(event) =>
                      handleImageSelect(event.currentTarget.files?.[0])
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-11 shrink-0 rounded-2xl"
                    aria-label="แนบรูปภาพ"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImagePlus className="size-4" />
                  </Button>
                  <textarea
                    value={composer}
                    maxLength={4000}
                    rows={1}
                    placeholder="พิมพ์ข้อความ..."
                    aria-label="ข้อความที่ต้องการส่ง"
                    className="min-h-11 flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    onChange={(event) => setComposer(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="size-11 rounded-2xl"
                    aria-label="ส่งข้อความ"
                    disabled={!composer.trim() && !selectedImage}
                    onClick={handleSend}
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
                <p className="mt-1 px-1 text-right text-[10px] text-muted-foreground">
                  {composer.length.toLocaleString('th-TH')}/4,000
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
