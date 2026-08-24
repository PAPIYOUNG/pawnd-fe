import { redirect } from 'next/navigation';

/**
 * SettingsPage - Route Alias สำหรับ /settings
 * นำทางไปยัง /profile/settings อัตโนมัติ เพื่อรองรับ URL ทั้ง 2 รูปแบบ
 */
export default function SettingsPage() {
  redirect('/profile/settings');
}
