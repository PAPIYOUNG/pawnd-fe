'use client';

import { useState, useRef, useSyncExternalStore } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { PetCard } from '@/components/common/PetCard';
import { LatestPostItem } from '@/types/post';
import { cn } from '@/lib/utils';

interface LatestPostsSectionProps {
  posts: LatestPostItem[];
}

function getVisibleCount() {
  if (typeof window === 'undefined') return 4;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 4;
}

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

export function LatestPostsSection({ posts }: LatestPostsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = useSyncExternalStore(subscribe, getVisibleCount, () => 4);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = posts.length;

  // Navigation handlers with infinite loop
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Duplicate items for seamless continuous rendering
  const extendedPosts = [...posts, ...posts, ...posts];
  const offsetIndex = total + currentIndex;

  const itemWidthPercentage = 100 / visibleCount;

  return (
    <section className="relative w-full py-10 sm:py-14 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
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
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="เลื่อนไปก่อนหน้า"
            className="absolute -left-2 sm:-left-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white/95 text-foreground shadow-md backdrop-blur-xs transition-all hover:scale-110 hover:bg-white hover:text-primary active:scale-95 sm:size-11"
          >
            <ChevronLeft className="size-5 sm:size-6" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="เลื่อนไปถัดไป"
            className="absolute -right-2 sm:-right-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white/95 text-foreground shadow-md backdrop-blur-xs transition-all hover:scale-110 hover:bg-white hover:text-primary active:scale-95 sm:size-11"
          >
            <ChevronRight className="size-5 sm:size-6" />
          </button>

          {/* Slider Viewport */}
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
                  <PetCard post={post} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots Pagination Indicators */}
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
