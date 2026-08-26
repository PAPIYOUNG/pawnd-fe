import { unstable_rethrow } from 'next/navigation';

import { ApiError } from '@/lib/api/api-error';
import { authFetch } from '@/lib/api/auth-fetch';
import type {
  ChatMessageResponse,
  ChatMessagesResponse,
  ChatReadResponse,
  ChatRoom,
  ChatRoomResponse,
  ChatRoomsResponse,
} from '@/types/chat';

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

interface ApiErrorEnvelope {
  success?: false;
  message?: string | string[];
}

/** เรียก Chat BFF ภายใน Next.js และแกะ Backend response envelope */
async function chatFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`/api/chat/${path}`, {
    ...options,
    headers: {
      ...(options.body && !isFormData
        ? { 'content-type': 'application/json' }
        : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => null)) as ApiErrorEnvelope | null;
    const rawMessage = error?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : rawMessage || 'ไม่สามารถเชื่อมต่อระบบแชทได้';
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}

export function createOrGetChatRoom(postId: string): Promise<ChatRoomResponse> {
  return chatFetch<ChatRoomResponse>('rooms', {
    method: 'POST',
    body: JSON.stringify({ postId }),
  });
}

export function getChatRooms(): Promise<ChatRoomsResponse> {
  return chatFetch<ChatRoomsResponse>('rooms');
}

/**
 * ดึงรายการห้องแชท (GET /chat/rooms) สำหรับใช้ฝั่ง Server Component เช่นหน้า Dashboard
 * ต่างจาก getChatRooms() ด้านบนซึ่งยิงผ่าน /api/chat proxy ที่ใช้ได้เฉพาะฝั่ง Client Component
 * (relative URL ใช้งานไม่ได้ตอน fetch บน Server) จุดนี้เรียก Backend ตรงผ่าน authFetch แทน
 * แต่ละห้องมี unreadCount ให้รวมกันเป็นจำนวนข้อความที่ยังไม่อ่านทั้งหมดของผู้ใช้
 */
export async function getMyChatRooms(): Promise<ChatRoom[]> {
  try {
    const { rooms } = await authFetch<ChatRoomsResponse>('/chat/rooms');
    return rooms;
  } catch (err) {
    unstable_rethrow(err);
    return [];
  }
}

export function getChatRoom(roomId: string): Promise<ChatRoomResponse> {
  return chatFetch<ChatRoomResponse>(`rooms/${roomId}`);
}

export function getChatMessages(
  roomId: string,
  cursor?: string,
  limit = 30,
): Promise<ChatMessagesResponse> {
  const query = new URLSearchParams({ limit: String(limit) });
  if (cursor) query.set('cursor', cursor);
  return chatFetch<ChatMessagesResponse>(
    `rooms/${roomId}/messages?${query.toString()}`,
  );
}

export function sendChatMessage(
  roomId: string,
  content: string,
  clientMessageId: string,
  image?: File,
): Promise<ChatMessageResponse> {
  if (image) {
    const formData = new FormData();
    if (content) formData.set('content', content);
    formData.set('clientMessageId', clientMessageId);
    formData.set('image', image);

    return chatFetch<ChatMessageResponse>(`rooms/${roomId}/messages`, {
      method: 'POST',
      body: formData,
    });
  }

  return chatFetch<ChatMessageResponse>(`rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, clientMessageId }),
  });
}

export function markChatRoomRead(roomId: string): Promise<ChatReadResponse> {
  return chatFetch<ChatReadResponse>(`rooms/${roomId}/read`, {
    method: 'PATCH',
  });
}
