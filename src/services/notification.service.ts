import { unstable_rethrow } from 'next/navigation';

import { authFetch } from '@/lib/api/auth-fetch';
import type {
  NotificationItem,
  NotificationQueryParams,
  NotificationsListResponse,
} from '@/types/notification';

/**
 * Notification Service — จัดการการแจ้งเตือนในระบบ (AI Match, ข้อความใหม่, เบาะแส, ระบบ)
 * ทุก endpoint ต้อง login เท่านั้น ใช้ authFetch ส่ง JWT token อัตโนมัติ
 */

/** สร้าง query string จาก object parameters กรองค่า undefined ออกก่อนสร้าง URL params */
function buildQueryString(params: Record<string, unknown>): string {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (filtered.length === 0) return '';
  return (
    '?' +
    new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString()
  );
}

/**
 * ดึงรายการการแจ้งเตือนของผู้ใช้ปัจจุบัน (GET /notifications)
 * Backend ส่งกลับ { notifications, unreadCount, meta } ในก้อนเดียว ไม่ใช่ paginated แบบ { data, meta } ปกติ
 * ถ้าเรียกไม่สำเร็จ (Backend ล่ม/network error) จะ fallback เป็นรายการว่าง ไม่ throw ออกไปให้หน้าเว็บพัง
 */
export async function getNotifications(
  params: NotificationQueryParams = {},
): Promise<NotificationsListResponse> {
  try {
    const qs = buildQueryString(params as Record<string, unknown>);
    return await authFetch<NotificationsListResponse>(`/notifications${qs}`);
  } catch (err) {
    unstable_rethrow(err);
    return {
      notifications: [],
      unreadCount: 0,
      meta: { page: 1, limit: params.limit ?? 20, total: 0 },
    };
  }
}

/**
 * ทำเครื่องหมายว่าอ่านแล้วสำหรับการแจ้งเตือนรายการเดียว (PATCH /notifications/:id/read)
 */
export async function markAsRead(
  id: string,
): Promise<{ notification: Pick<NotificationItem, 'id' | 'isRead'> }> {
  return authFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

/**
 * ทำเครื่องหมายว่าอ่านแล้วทั้งหมด (PATCH /notifications/read-all)
 */
export async function markAllAsRead(): Promise<{ message: string }> {
  return authFetch('/notifications/read-all', { method: 'PATCH' });
}
