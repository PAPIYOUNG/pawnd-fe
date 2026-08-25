import { getCurrentUser } from '@/services/user.service';
import { ProfileSidebar } from '@/components/layout/ProfileSidebar';

export const metadata = {
  title: 'โปรไฟล์และจัดการสัตว์เลี้ยง | PAWND',
  description: 'จัดการข้อมูลโปรไฟล์ผู้ใช้งานและสัตว์เลี้ยงของคุณบนระบบ PAWND',
};

/**
 * ProfileLayout (Server Component - RSC)
 * - Layout ส่วนกลางสำหรับหน้า User Profile, Pet Profile, Dashboard และ Settings
 * - บน Desktop: แสดง Collapsible Sidebar ฝั่งซ้าย และเนื้อหาหลักฝั่งขวา
 * - บน Mobile: แสดง Mobile Tab Bar ด้านบน และเนื้อหาเรียงลงมาอย่างพอดี ไม่ล้นจอ
 */
export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col md:flex-row">
      {/* Sidebar เมนูด้านข้างที่ย่อ-ขยายได้ (พร้อม Mobile Tab Bar + Drawer) */}
      <ProfileSidebar user={user} />

      {/* พื้นที่แสดงเนื้อหาหลัก */}
      <div className="flex-1 overflow-x-hidden p-3.5 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
