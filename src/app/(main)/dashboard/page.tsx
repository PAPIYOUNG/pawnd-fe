import { Metadata } from 'next';
import { getCurrentUser } from '@/services/user.service';
import { getMyPets } from '@/services/pet.service';
import { getMyPosts } from '@/services/post.service';
import { ProfileSidebar } from '@/components/layout/ProfileSidebar';
import { DashboardMetrics } from './_components/dashboard-metrics';
import { DashboardMyPosts, MyPostDashboardItem } from './_components/dashboard-my-posts';

export const metadata: Metadata = {
  title: 'แดชบอร์ด | PAWND',
  description: 'แดชบอร์ดจัดการสัตว์เลี้ยง ประกาศตามหา และผลลัพธ์ AI Smart Matching',
};

/**
 * Helper function สำหรับแปลงเวลาแบบ relative
 */
function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'เมื่อไม่นานมานี้';
  const timestamp = new Date(dateStr).getTime();
  if (isNaN(timestamp)) return 'เมื่อไม่นานมานี้';
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `อัปเดตเมื่อ ${days} วันที่แล้ว`;
  if (hours > 0) return `อัปเดตเมื่อ ${hours} ชม. ที่แล้ว`;
  return 'อัปเดตเมื่อสักครู่';
}

/**
 * DashboardMainPage (Server Component - RSC)
 * - หน้าแดชบอร์ดหลักของผู้ใช้ (User Dashboard) ตรงตามดีไซน์ UI
 * - ดึงข้อมูลจริงจาก Backend:
 *   1. getCurrentUser() -> ข้อมูลผู้ใช้และโปรไฟล์
 *   2. getMyPets() -> รายการสัตว์เลี้ยงของผู้ใช้เพื่อคำนวณสถิติ
 *   3. getMyPosts() -> รายการประกาศตามหาของฉัน
 * - คำนวณ Metrics สดจากข้อมูลจริง และส่งต่อไปยัง Component ย่อย
 */
export default async function DashboardMainPage() {
  // ดึงข้อมูลพร้อมกันแบบ Parallel สำหรับ RSC
  const [user, myPets, myPosts] = await Promise.all([
    getCurrentUser(),
    getMyPets(),
    getMyPosts(),
  ]);

  // คำนวณสถิติจากข้อมูลจริง
  const totalPets = myPets.length;
  const dogCount = myPets.filter((p) => p.type === 'DOG').length;
  const catCount = myPets.filter((p) => p.type === 'CAT').length;
  const activePosts = myPosts.filter((p) => p.status === 'ACTIVE').length;
  const totalReunited = myPosts.filter((p) => p.status === 'REUNITED').length;

  // แปลงรายการ PostDetail จาก Backend -> MyPostDashboardItem สำหรับ Dashboard Grid
  const dashboardPosts: MyPostDashboardItem[] | undefined =
    myPosts.length > 0
      ? myPosts.map((post) => ({
          id: post.id,
          type: post.type,
          petName: post.petName || post.pet?.name || 'สัตว์เลี้ยง',
          petType: post.petType === 'CAT' ? 'แมว' : post.petType === 'DOG' ? 'สุนัข' : 'สัตว์เลี้ยง',
          breed: post.breed || post.pet?.breed || 'ไม่ระบุสายพันธุ์',
          age: post.pet?.age ? `อายุ ${post.pet.age} ปี` : 'ไม่ระบุอายุ',
          location: post.locationDescription || post.province || 'ไม่ระบุสถานที่',
          lastUpdated: formatRelativeTime(post.updatedAt || post.createdAt),
          rewardAmount: post.rewardAmount ? post.rewardAmount.toLocaleString() : null,
          imageUrl:
            (post.images && post.images.length > 0
              ? post.images[0].imageUrl
              : post.pet?.profileImageUrl) ||
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop',
        }))
      : undefined;

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

        {/* แถวที่ 1: การ์ดสถิติ 4 ใบ คำนวณจากข้อมูลจริง */}
        <DashboardMetrics
          totalPets={totalPets}
          activePosts={activePosts || (user.stats?.totalLostPosts ?? 0)}
          totalReunited={totalReunited || (user.stats?.totalReunited ?? 0)}
          unreadMessages={0}
          dogCount={dogCount}
          catCount={catCount}
        />

        {/* แถวที่ 2: ประกาศตามหาของฉัน */}
        <DashboardMyPosts initialPosts={dashboardPosts} />
      </main>
    </div>
  );
}
