'use client';

import { useState, useRef, useSyncExternalStore } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { PetCard } from '@/components/common/PetCard';
import { LatestPostItem } from '@/types/post';
import { cn } from '@/lib/utils';

interface LatestPostsSectionProps {
  posts: LatestPostItem[];
}

/**
 * คำนวณจำนวนการ์ดที่แสดงต่อหน้าจอตามความกว้างหน้าต่างเบราว์เซอร์
 * - Mobile (< 640px): 1 การ์ด
 * - Tablet (< 1024px): 2 การ์ด
 * - Desktop (>= 1024px): 4 การ์ด
 */
function getVisibleCount() {
  if (typeof window === 'undefined') return 4;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 4;
}

/**
 * ฟังก์ชัน Subscribe การเปลี่ยนขนาดหน้าจอ (Window Resize) สำหรับ useSyncExternalStore
 */
function subscribe(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

/**
 * LatestPostsSection Component (Client Component)
 * - สไลเดอร์แสดงรายการประกาศตามหาและพบสัตว์เลี้ยงล่าสุด
 * - ทำงานแบบ Infinite Loop Continuous Sliding (วนลูปไร้รอยต่อ)
 * - มีปุ่มลูกศรทรงกลมซ้าย-ขวาสำหรับกดเลื่อน
 * - มีจุดบอกตำแหน่ง (Dots Pagination Indicators) ด้านล่าง
 * - รองรับการปัดเลื่อนด้วยนิ้วบนสมาร์ทโฟน (Touch Swipe)
 */
export function LatestPostsSection({ posts }: LatestPostsSectionProps) {
  // State เก็บ Index ของการ์ดที่กำลังโฟกัส
  const [currentIndex, setCurrentIndex] = useState(0);

  // ดึงจำนวนการ์ดที่แสดงตามขนาดหน้าจอแบบ React 19 Concurrent-safe
  const visibleCount = useSyncExternalStore(subscribe, getVisibleCount, () => 4);

  // Ref สำหรับบันทึกพิกัดตำแหน่งเริ่มต้นและสิ้นสุดของการสัมผัสหน้าจอบนมือถือ
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = posts.length;

  // ฟังก์ชันเลื่อนการ์ดย้อนกลับไปรายการก่อนหน้า (Wrap Around วนลูป)
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // ฟังก์ชันเลื่อนการ์ดถัดไป (Wrap Around วนลูป)
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Event Handler เมื่อนิ้วเริ่มแตะหน้าจอบนมือถือ
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  // Event Handler เมื่อนิ้วกำลังลากบนหน้าจอ
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  // Event Handler เมื่อยกนิ้วขึ้น เพื่อคำนวณระยะการปัด (Swipe Threshold 50px)
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext(); // ปัดซ้าย -> เลื่อนไปถัดไป
    } else if (distance < -50) {
      handlePrev(); // ปัดขวา -> เลื่อนย้อนกลับ
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // จำลอง Array สัตว์เลี้ยง 3 ชุดซ้อนกัน ([posts, posts, posts]) เพื่อให้เลื่อนได้อย่างลื่นไหลไร้รอยต่อ (Infinite Carousel)
  const extendedPosts = [...posts, ...posts, ...posts];
  const offsetIndex = total + currentIndex;

  // คำนวณความกว้างเป็นเปอร์เซ็นต์ของการ์ดแต่ละใบตามจำนวน visibleCount
  const itemWidthPercentage = 100 / visibleCount;

  return (
    <section className="relative w-full py-10 sm:py-14 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* หัวข้อประจำ Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            ประกาศตามหาและพบสัตว์ล่าสุด
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            ร่วมสอดส่องดูแลและส่งต่อกำลังใจให้แก่เพื่อนร่วมโลก เพื่อเพิ่มโอกาสพาน้องกลับบ้านได้เร็วขึ้น
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative mt-8 px-2 sm:px-4">
          {/* ปุ่มลูกศรเลื่อนซ้าย (Previous Button) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="เลื่อนไปก่อนหน้า"
            className="absolute -left-2 sm:-left-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white/95 text-foreground shadow-md backdrop-blur-xs transition-all hover:scale-110 hover:bg-white hover:text-primary active:scale-95 sm:size-11 dark:bg-card/95 dark:hover:bg-card"
          >
            <ChevronLeft className="size-5 sm:size-6" />
          </button>

          {/* ปุ่มลูกศรเลื่อนขวา (Next Button) */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="เลื่อนไปถัดไป"
            className="absolute -right-2 sm:-right-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white/95 text-foreground shadow-md backdrop-blur-xs transition-all hover:scale-110 hover:bg-white hover:text-primary active:scale-95 sm:size-11 dark:bg-card/95 dark:hover:bg-card"
          >
            <ChevronRight className="size-5 sm:size-6" />
          </button>

          {/* พื้นที่แสดงผลสไลด์ (Viewport & Track) */}
          <div
            className="overflow-hidden py-3"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${offsetIndex * itemWidthPercentage}%)`,
              }}
            >
              {extendedPosts.map((post, idx) => (
                <div
                  key={`${post.id}-${idx}`}
                  className="shrink-0 px-2.5"
                  style={{ width: `${itemWidthPercentage}%` }}
                >
                  {/* คอมโพเนนต์การ์ดแสดงข้อมูลสัตว์เลี้ยง */}
                  <PetCard post={post} />
                </div>
              ))}
            </div>
          </div>

          {/* แถบจุดบอกตำแหน่งสไลด์ (Dots Pagination Indicators) */}
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {posts.map((_, dotIdx) => {
              const isActive = (currentIndex % total) === dotIdx;
              return (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`ไปที่รายการที่ ${dotIdx + 1}`}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    isActive
                      ? 'w-6 bg-primary'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
