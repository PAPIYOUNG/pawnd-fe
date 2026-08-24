import { Metadata } from 'next';
import { getCurrentUser } from '@/services/user.service';
import { UserProfileHeader } from './_components/user-profile-header';
import { UserStatsGrid } from './_components/user-stats-grid';
import { UserMyPetsGrid } from './_components/user-my-pets-grid';
import { UserPostHistoryTable } from './_components/user-post-history-table';

export const metadata: Metadata = {
  title: 'โปรไฟล์ของฉัน | PAWND',
  description: 'ภาพรวมบัญชีผู้ใช้ สัตว์เลี้ยง และประวัติการสร้างประกาศตามหา',
};

/**
 * ProfileOverviewPage (Server Component - RSC)
 * - หน้าภาพรวมโปรไฟล์ผู้ใช้งาน (User Profile Overview)
 * - แสดงข้อมูลผู้ใช้, สถิติ 3 กล่อง, รายการสัตว์เลี้ยงของฉัน และตารางประวัติประกาศตามหา
 */
export default async function ProfileOverviewPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-8">
      {/* 1. ส่วนการ์ดโปรไฟล์ผู้ใช้ด้านบน */}
      <UserProfileHeader user={user} />

      {/* 2. ส่วนสถิติ 3 กล่องข้อมูล */}
      <UserStatsGrid
        totalPets={user.stats?.totalPets}
        totalLostPosts={user.stats?.totalLostPosts}
        totalReunited={user.stats?.totalReunited}
      />

      {/* 3. ส่วนสัตว์เลี้ยงของฉัน */}
      <UserMyPetsGrid pets={user.pets} />

      {/* 4. ส่วนตารางประวัติการแจ้งประกาศตามหา */}
      <UserPostHistoryTable posts={user.postsHistory} />
    </div>
  );
}
