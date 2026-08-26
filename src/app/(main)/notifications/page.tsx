import { Metadata } from 'next';

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
 *   ให้ NotificationsList (Client Component) ไปจัดการ mark-as-read แบบ Interactive ต่อ
 */
export default async function NotificationsPage() {
  const { notifications, unreadCount } = await getNotifications({
    limit: 50,
  });

  return (
    <NotificationsList
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    />
  );
}
