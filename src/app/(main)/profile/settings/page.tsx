import { getCurrentUser } from '@/services/user.service';
import { SettingsForm } from './_components/settings-form';

/**
 * SettingsPage (Server Component)
 * - ดึงข้อมูลผู้ใช้ปัจจุบันเพื่อรู้ว่ามีรหัสผ่านหรือไม่ (บัญชี Google/LINE ล้วนจะไม่มีรหัสผ่าน)
 * - ส่งต่อให้ SettingsForm (Client Component) แสดงฟอร์มยืนยันลบบัญชีให้ตรงกับประเภทบัญชี
 */
export default async function SettingsPage() {
  const user = await getCurrentUser();

  return <SettingsForm hasPassword={user.hasPassword} />;
}
