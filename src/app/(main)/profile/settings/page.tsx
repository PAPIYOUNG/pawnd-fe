import { Metadata } from 'next';
import { getCurrentUser } from '@/services/user.service';
import { SettingsForm } from './_components/settings-form';

export const metadata: Metadata = {
  title: 'ตั้งค่าระบบ | PAWND',
  description:
    'จัดการความเป็นส่วนตัว การแจ้งเตือน และความปลอดภัยของบัญชีผู้ใช้งาน',
};

/**
 * SettingsPage (Server Component - RSC)
 * - ดึงข้อมูลการตั้งค่าจริงของผู้ใช้งานจาก Backend (getCurrentUser)
 * - ส่งข้อมูล initialSettings + hasPassword เข้าสู่ SettingsForm (Client Component)
 */
export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <SettingsForm
      initialNotificationEnabled={user.notificationEnabled ?? true}
      initialTwoFactorEnabled={user.twoFactorEnabled ?? true}
      hasPassword={user.hasPassword}
    />
  );
}
