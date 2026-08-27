/**
 * ประเภทของการแจ้งเตือน ตรงกับ enum NotificationType ใน Backend (Prisma schema)
 * AI_MATCH: AI จับคู่สัตว์เลี้ยงที่มีลักษณะตรงกัน
 * NEW_MESSAGE: มีข้อความแชทใหม่
 * NEW_CLUE: มีผู้แจ้งเบาะแสใหม่ในประกาศของผู้ใช้
 * PROFILE_VERIFICATION: สถานะการยืนยันตัวตน/โปรไฟล์เปลี่ยนแปลง
 * SYSTEM: การแจ้งเตือนทั่วไปจากระบบ
 */
export type NotificationType =
  'AI_MATCH' | 'NEW_MESSAGE' | 'NEW_CLUE' | 'PROFILE_VERIFICATION' | 'SYSTEM';

/** ข้อมูลการแจ้งเตือนหนึ่งรายการ ตรงตาม select fields ของ Backend GET /notifications */
export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedPostId: string | null;
  relatedMatchId: string | null;
  relatedChatRoomId: string | null;
  isRead: boolean;
  createdAt: string;
}

/** Response ของ GET /notifications */
export interface NotificationsListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

/** พารามิเตอร์สำหรับ query รายการแจ้งเตือน */
export interface NotificationQueryParams {
  isRead?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

/** Payload ของ event 'notification_count_update' จาก Socket.IO (namespace /notifications) */
export interface NotificationCountUpdatePayload {
  unreadCount: number;
}
