import { Metadata } from 'next';
import { getCurrentUser } from '@/services/user.service';
import { getMyPets } from '@/services/pet.service';
import { getMyPosts } from '@/services/post.service';
import { getMyChatRooms } from '@/services/chat.service';
import { ProfileSidebar } from '@/components/layout/ProfileSidebar';
import { DashboardMetrics } from '../../dashboard/_components/dashboard-metrics';
import {
  DashboardMyPosts,
  MyPostDashboardItem,
} from '../../dashboard/_components/dashboard-my-posts';

export const metadata: Metadata = {
  title: 'แดชบอร์ด | PAWND',
  description:
    'แดชบอร์ดจัดการสัตว์เลี้ยง ประกาศตามหา และผลลัพธ์ AI Smart Matching',
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
 * ProfileDashboardPage (Server Component - RSC)
 * - แดชบอร์ดสรุปภาพรวมสำหรับ User Profile Route Group
 * - ดึงข้อมูลสดจาก Backend เพื่อคำนวณสถิติและแสดงผลการ์ดตามหาของฉัน
 */
export default async function ProfileDashboardPage() {
  const [user, myPets, myPosts, myChatRooms] = await Promise.all([
    getCurrentUser(),
    getMyPets(),
    getMyPosts(),
    getMyChatRooms(),
  ]);

  const totalPets = myPets.length;
  const activeLostPosts = myPosts.filter(
    (p) => p.status === 'ACTIVE' && p.type === 'LOST',
  ).length;
  const activeFoundPosts = myPosts.filter(
    (p) => p.status === 'ACTIVE' && p.type === 'FOUND',
  ).length;
  const unreadMessages = myChatRooms.reduce(
    (sum, room) => sum + (room.unreadCount || 0),
    0,
  );

  /**
   * Helper function สำหรับทำความสะอาดข้อความ ป้องกัน 'Unknown' หรือ '????'
   */
  const cleanText = (val?: string | null, fallback = ''): string => {
    if (!val) return fallback;
    const trimmed = val.trim();
    if (
      trimmed === '' ||
      trimmed.toLowerCase() === 'unknown' ||
      /^[\s?？]+$/.test(trimmed)
    ) {
      return fallback;
    }
    return trimmed;
  };

  const dashboardPosts: MyPostDashboardItem[] = myPosts.map((post) => {
    const isFound = post.type === 'FOUND';
    const defaultPetName = isFound
      ? 'ไม่ทราบชื่อ'
      : 'สัตว์เลี้ยง (ไม่ระบุชื่อ)';
    const petName = cleanText(post.petName || post.pet?.name, defaultPetName);

    const cleanDistrict = cleanText(post.district, '');
    const cleanProvince = cleanText(post.province, '');
    const cleanDesc = cleanText(post.locationDescription, '');

    // แสดง เขต/อำเภอ คู่กับ จังหวัด
    let location = cleanDesc;
    if (!location) {
      if (cleanDistrict && cleanProvince) {
        location = `${cleanDistrict}, ${cleanProvince}`;
      } else if (cleanProvince) {
        location = cleanProvince;
      } else if (cleanDistrict) {
        location = cleanDistrict;
      } else {
        location = 'ไม่ระบุสถานที่';
      }
    }

    return {
      id: post.id,
      type: post.type,
      status: post.status as MyPostDashboardItem['status'],
      petName,
      petType:
        post.petType === 'CAT'
          ? 'แมว'
          : post.petType === 'DOG'
            ? 'สุนัข'
            : 'สัตว์เลี้ยง',
      breed: cleanText(post.breed || post.pet?.breed, 'ไม่ระบุสายพันธุ์'),
      age: post.pet?.age ? `อายุ ${post.pet.age} ปี` : 'ไม่ระบุอายุ',
      location,
      lastUpdated: formatRelativeTime(post.updatedAt || post.createdAt),
      rewardAmount: post.rewardAmount
        ? post.rewardAmount.toLocaleString()
        : null,
      imageUrl:
        (post.images && post.images.length > 0
          ? post.images[0].imageUrl
          : post.pet?.profileImageUrl) ||
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop',
    };
  });

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col md:flex-row">
      <ProfileSidebar user={user} />

      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            แดชบอร์ด
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            สวัสดี คุณ{user.firstName}!
            ยินดีต้อนรับสู่ระบบการจัดการสัตว์เลี้ยงของคุณ
          </p>
        </div>

        <DashboardMetrics
          totalPets={totalPets}
          activeLostPosts={activeLostPosts}
          activeFoundPosts={activeFoundPosts}
          unreadMessages={unreadMessages}
        />

        <DashboardMyPosts initialPosts={dashboardPosts} />
      </main>
    </div>
  );
}
