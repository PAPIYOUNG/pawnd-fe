import { Metadata } from 'next';
import { getCurrentUser } from '@/services/user.service';
import { SettingsForm } from './_components/settings-form';

export const metadata: Metadata = {
  title: 'ตั้งค่าระบบ | PAWND',
  description: 'จัดการความเป็นส่วนตัว การแจ้งเตือน และความปลอดภัยของบัญชีผู้ใช้งาน',
};

/**
 * SettingsPage (Server Component - RSC)
<<<<<<< HEAD
 * - หน้าตั้งค่าระบบและบัญชีผู้ใช้งาน (User & System Settings)
 * - ดึงค่าการตั้งค่าปัจจุบันจริงจาก Backend (GET /users/me) มาเป็นค่าเริ่มต้น
 *   แล้วส่งต่อให้ SettingsForm (Client Component) เพื่อจัดการ State และ Interaction ต่อ
=======
 * - ดึงข้อมูลการตั้งค่าจริงของผู้ใช้งานจาก Backend (getCurrentUser)
 * - ส่งข้อมูล initialSettings เข้าสู่ SettingsForm (Client Component)
 * - ค่า Toggle การแจ้งเตือนและ 2FA จะตรงกับฐานข้อมูลเสมอเมื่อรีเฟรชหน้า
>>>>>>> dev
 */
export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
<<<<<<< HEAD
    <div className="flex max-w-2xl flex-col gap-8">
      {/* ส่วนหัวหน้าตั้งค่า */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          ตั้งค่าระบบ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          จัดการความเป็นส่วนตัว การแจ้งเตือน และความปลอดภัยของบัญชีผู้ใช้งาน
        </p>
      </div>

      <SettingsForm
        initialNotificationEnabled={user.notificationEnabled}
        initialTwoFactorEnabled={user.twoFactorEnabled}
      />
    </div>
=======
    <SettingsForm
      initialNotificationEnabled={user.notificationEnabled ?? true}
      initialTwoFactorEnabled={user.twoFactorEnabled ?? true}
    />
>>>>>>> dev
  );
}

