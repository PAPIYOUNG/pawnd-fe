import { Metadata } from 'next';

import { getHomePageData } from '@/services/home.service';
import { HeroSection } from './_components/hero-section';
import { StatsBar } from './_components/stats-bar';
import { LatestPostsSection } from './_components/latest-posts-section';
import { ReunitedStoriesSection } from './_components/reunited-stories-section';
import { MapTeaserSection } from './_components/map-teaser-section';

export const metadata: Metadata = {
  title: 'หน้าแรก | PAWND ช่วยสัตว์เลี้ยงกลับบ้านอย่างปลอดภัย',
  description:
    'แพลตฟอร์มศูนย์รวมการตามหาสัตว์เลี้ยงหายและช่วยสัตว์พลัดหลง พร้อมระบบค้นหาและจับคู่ภาพถ่ายด้วย AI อัจฉริยะ',
};

export default async function HomePage() {
  const { stats, latestPosts, reunitedStories } = await getHomePageData();

  return (
    <div className="flex flex-col">
      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 2. Live Stats Bar */}
      <StatsBar stats={stats} />

      {/* 3. Latest Lost & Found Posts Feed */}
      <LatestPostsSection posts={latestPosts} />

      {/* 4. Reunited Success Stories */}
      <ReunitedStoriesSection stories={reunitedStories} />

      {/* 5. Interactive Map Teaser */}
      <MapTeaserSection />
    </div>
  );
}
