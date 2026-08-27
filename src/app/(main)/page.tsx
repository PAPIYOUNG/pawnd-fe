import { Metadata } from 'next';

import { getHomePageData } from '@/services/home.service';
import { HeroSection } from './_components/hero-section';
import { StatsBar } from './_components/stats-bar';
import { LatestPostsSection } from './_components/latest-posts-section';
import { ReunitedStoriesSection } from './_components/reunited-stories-section';
import { MapTeaserSection } from './_components/map-teaser-section';

/**
 * Metadata ประจำหน้าแรก (SEO และ OpenGraph)
 */
export const metadata: Metadata = {
  title: 'หน้าแรก | PAWND ช่วยสัตว์เลี้ยงกลับบ้านอย่างปลอดภัย',
  description:
    'แพลตฟอร์มศูนย์รวมการตามหาสัตว์เลี้ยงหายและช่วยสัตว์พลัดหลง พร้อมระบบค้นหาและจับคู่ภาพถ่ายด้วย AI อัจฉริยะ',
};

/**
 * HomePage Component (React Server Component - RSC)
 * - ดึงข้อมูลหน้าแรกแบบ Asynchronous จาก Backend API (Stats, Latest Posts, Reunited Stories)
 * - เรนเดอร์ส่วนประกอบหลักของ Landing Page ครบทั้ง 5 ส่วน
 */
export default async function HomePage() {
  // ดึงข้อมูลสถิติ ประกาศล่าสุด และเรื่องราวความสำเร็จพร้อมกันแบบ Parallel
  const { stats, latestPosts, reunitedStories } = await getHomePageData();
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    'http://localhost:8000';

  return (
    <div className="flex flex-col">
      {/* 1. ส่วนแบนเนอร์หลักด้านบน (Hero Banner พร้อมภาพพื้นหลังสลับอัตโนมัติและปุ่ม CTA) */}
      <HeroSection />

      {/* 2. ส่วนแถบสถิติแบบ Realtime (Live Stats Bar พร้อมตัวเลขจริงและ WebSocket updates) */}
      <StatsBar stats={stats} socketUrl={socketUrl} />


      {/* 3. ส่วนประกาศตามหาและพบสัตว์ล่าสุด (Infinite Loop Carousel พร้อมปุ่มลูกศรเลื่อนซ้าย-ขวา) */}
      <LatestPostsSection posts={latestPosts} />

      {/* 4. ส่วนเรื่องราวความสำเร็จพาสัตว์เลี้ยงกลับบ้าน (Reunited Success Stories) */}
      <ReunitedStoriesSection stories={reunitedStories} />

      {/* 5. ส่วนจำลองแผนที่ค้นหาสัตว์เลี้ยงในพื้นที่ (Interactive Map Teaser) */}
      <MapTeaserSection />
    </div>
  );
}
