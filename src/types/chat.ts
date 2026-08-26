import type { PetType, PostStatus, PostType } from '@/types/post';

/** ข้อมูลผู้ใช้แบบปลอดภัยที่ Backend อนุญาตให้แสดงในระบบแชท */
export interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

/** ข้อความแชทที่ persist แล้วตาม ChatMessage response contract */
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  clientMessageId: string | null;
  content: string;
  imageUrl: string | null;
  /** มีค่าใน response รายการข้อความ ใช้เป็น source of truth ของ read receipt */
  isRead?: boolean;
  createdAt: string;
  sender: ChatUser;
}

/** ข้อมูลประกาศแบบย่อที่แนบมากับห้องแชท */
export interface ChatPostSummary {
  id: string;
  type: PostType;
  status: PostStatus;
  petName: string;
  petType: PetType;
  breed: string | null;
  province: string | null;
  district: string | null;
  createdAt: string;
  coverImageUrl: string | null;
}

/** ห้องแชท 1:1 พร้อมคู่สนทนาและข้อความล่าสุด */
export interface ChatRoom {
  id: string;
  postId: string;
  createdById: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  post: ChatPostSummary;
  otherMember: ChatUser | null;
  latestMessage: ChatMessage | null;
  unreadCount?: number;
}

export interface ChatRoomsResponse {
  rooms: ChatRoom[];
}

export interface ChatRoomResponse {
  room: ChatRoom;
}

export interface ChatMessagesResponse {
  items: ChatMessage[];
  nextCursor: string | null;
}

export interface ChatMessageResponse {
  message: ChatMessage;
}

export interface ChatReadState {
  roomId: string;
  userId: string;
  lastReadAt: string;
}

export interface ChatReadResponse {
  readState: ChatReadState;
  lastReadMessageId: string | null;
}

/** Event ที่แจ้ง boundary ล่าสุดซึ่งสมาชิกอีกฝั่งอ่านแล้ว */
export interface ChatReadUpdatedPayload extends ChatReadState {
  lastReadMessageId: string | null;
}

/** รูปแบบ acknowledgement ของ Socket.IO ที่ Backend ส่งกลับทุก event */
export type ChatSocketAcknowledgement<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };
