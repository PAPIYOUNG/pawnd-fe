import { Metadata } from 'next';
import { getCurrentUser } from '@/services/user.service';
import { ProfileSidebar } from '@/components/layout/ProfileSidebar';
import { DashboardMetrics } from '../../dashboard/_components/dashboard-metrics';
import { DashboardMyPosts } from '../../dashboard/_components/dashboard-my-posts';
import { DashboardAiMatches } from '../../dashboard/_components/dashboard-ai-matches';

export const metadata: Metadata = {
  title: 'แดชบอร์ด | PAWND',
  description: 'แดชบอร์ดจัดการสัตว์เลี้ยง ประกาศตามหา และผลลัพธ์ AI Smart Matching',
};

/**
 * ProfileDashboardPage (Server Component - RSC)
 * - แดชบอร์ดสรุปภาพรวมสำหรับ User Profile Route Group
 */
export default async function ProfileDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col md:flex-row">
      <ProfileSidebar user={user} />

      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            แดชบอร์ด
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            สวัสดี คุณ{user.firstName}! ยินดีต้อนรับสู่ระบบการจัดการสัตว์เลี้ยงของคุณ
          </p>
        </div>

        <DashboardMetrics
          totalPets={user.stats?.totalPets || 3}
          activePosts={user.stats?.totalLostPosts || 2}
          totalReunited={user.stats?.totalReunited || 5}
          unreadMessages={12}
          dogCount={2}
          catCount={1}
        />

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
