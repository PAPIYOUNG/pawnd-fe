import { Metadata } from 'next';

import { auth } from '@/auth';
import { getNotifications } from '@/services/notification.service';
import { NotificationsList } from './_components/notifications-list';

export const metadata: Metadata = {
  title: 'การแจ้งเตือน | PAWND',
  description: 'ศูนย์รวมการแจ้งเตือน AI Matching เบาะแสสัตว์เลี้ยง และข้อความ',
};

/**
 * NotificationsPage (Server Component - RSC)
 * - หน้าศูนย์การแจ้งเตือนทั้งหมดของระบบ (Notifications Center)
 * - ดึงรายการแจ้งเตือนจริงจาก Backend (GET /notifications) แล้วส่งเป็น initial props
 *   ให้ NotificationsList (Client Component) ไปจัดการ mark-as-read/ลบ แบบ Interactive ต่อ
 * - ส่ง accessToken + socketUrl ลงไปด้วย เพื่อให้ Client Component ต่อ Socket.IO
 *   (namespace /notifications) รับการแจ้งเตือนใหม่แบบ real-time ได้เอง
 *   (แพทเทิร์นเดียวกับที่ ChatPage ส่งให้ ChatClient)
 */
export default async function NotificationsPage() {
  const [session, { notifications, unreadCount }] = await Promise.all([
    auth(),
    getNotifications({ limit: 50 }),
  ]);

  const socketUrl = process.env.API_URL || 'http://localhost:8000';

  return (
    <NotificationsList
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
      accessToken={session?.accessToken ?? ''}
      socketUrl={socketUrl}
    />
  );
}
