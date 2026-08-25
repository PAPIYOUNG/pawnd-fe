import { Metadata } from 'next';
import { getCurrentUser } from '@/services/user.service';
import { ProfileSidebar } from '@/components/layout/ProfileSidebar';
import { DashboardMetrics } from './_components/dashboard-metrics';
import { DashboardMyPosts } from './_components/dashboard-my-posts';
import { DashboardAiMatches } from './_components/dashboard-ai-matches';

export const metadata: Metadata = {
  title: 'แดชบอร์ด | PAWND',
  description: 'แดชบอร์ดจัดการสัตว์เลี้ยง ประกาศตามหา และผลลัพธ์ AI Smart Matching',
};

/**
 * DashboardMainPage (Server Component - RSC)
 * - หน้าแดชบอร์ดหลักของผู้ใช้ (User Dashboard) ตรงตามดีไซน์ UI ในภาพตัวอย่าง
 * - ฝั่งซ้าย: ProfileSidebar เมนูหลัก 4 รายการ (แดชบอร์ด, โปรไฟล์ผู้ใช้, โปรไฟล์สัตว์เลี้ยง, ตั้งค่าระบบ)
 * - ฝั่งขวา:
 *   1. ส่วนหัว: แดชบอร์ด + ข้อความต้อนรับ
 *   2. การ์ดสถิติ 4 ใบ (สัตว์เลี้ยงของฉัน, ประกาศที่ใช้งาน, กลับบ้านแล้ว, ข้อความที่ยังไม่อ่าน)
 *   3. คอลัมน์ซ้าย: ประกาศตามหาของฉัน (My Posts) พร้อมปุ่ม Action ดูใบปลิว, แก้ไข, ลบ
 *   4. คอลัมน์ขวา: สรุปผลการจับคู่ AI (AI Matching Summary)
 */
export default async function DashboardMainPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col md:flex-row">
      {/* 1. Sidebar เมนูนำทางด้านซ้าย */}
      <ProfileSidebar user={user} />

      {/* 2. เนื้อหาแดชบอร์ดหลักด้านขวา */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8">
        {/* ส่วนหัวแดชบอร์ด */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            แดชบอร์ด
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            สวัสดี คุณ{user.firstName}! ยินดีต้อนรับสู่ระบบการจัดการสัตว์เลี้ยงของคุณ
          </p>
        </div>

        {/* แถวที่ 1: การ์ดสถิติ 4 ใบ */}
        <DashboardMetrics
          totalPets={user.stats?.totalPets || 3}
          activePosts={user.stats?.totalLostPosts || 2}
          totalReunited={user.stats?.totalReunited || 5}
          unreadMessages={12}
          dogCount={2}
          catCount={1}
        />

        {/* แถวที่ 2: ประกาศตามหาของฉัน (7 Cols) และ สรุป AI Matching (5 Cols) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <DashboardMyPosts />
          </div>
          <div className="lg:col-span-5">
            <DashboardAiMatches />
          </div>
        </div>
      </main>
    </div>
  );
}
