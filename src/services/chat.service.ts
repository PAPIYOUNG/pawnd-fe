import { ApiError } from '@/lib/api/api-error';
import type {
  ChatMessageResponse,
  ChatMessagesResponse,
  ChatReadResponse,
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
  const response = await fetch(`/api/chat/${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
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
): Promise<ChatMessageResponse> {
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
