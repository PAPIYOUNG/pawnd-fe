'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HERO_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=1200&auto=format&fit=crop',
    alt: 'สุนัขและแมวเพื่อนรักที่ได้อยู่บ้านอย่างปลอดภัยและอบอุ่น',
  },
  {
    src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
    alt: 'สุนัขสองตัววิ่งเล่นอย่างมีความสุขบนสนามหญ้า',
  },
  {
    src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1200&auto=format&fit=crop',
    alt: 'แมวไทยน่ารักตาใสในบ้านที่อบอุ่น',
  },
  {
    src: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1200&auto=format&fit=crop',
    alt: 'ลูกสุนัขและลูกแมวนอนกอดกันในบ้าน',
  },
];

export function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate images every 6 seconds with crossfade animation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-[#ECF5EE] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Heading, Description & Action Buttons */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#164E36] sm:text-4xl lg:text-5xl lg:leading-[1.2]">
              ช่วยสัตว์เลี้ยงกลับบ้านอย่างปลอดภัย
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[#2D5A47] sm:text-lg">
              แพลตฟอร์มศูนย์รวมการตามหาสัตว์เลี้ยงหายและช่วยสัตว์พลัดหลง พร้อมระบบค้นหาและจับคู่ภาพถ่ายด้วย AI อัจฉริยะ ช่วยให้การค้นหาและคืนสัตว์เลี้ยงของคุณมีโอกาสสำเร็จสูงสุด
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              {/* Primary CTA */}
              <Link
                href="/posts/create?type=LOST"
                className={cn(
                  buttonVariants({ variant: 'default', size: 'lg' }),
                  'h-13 min-w-[200px] justify-center rounded-2xl border-2 border-transparent bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90'
                )}
              >
                <Plus className="size-5 stroke-[2.5]" />
                <span>แจ้งสัตว์เลี้ยงหาย</span>
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/posts"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'h-13 min-w-[200px] justify-center rounded-2xl border-2 border-primary/30 bg-white/80 px-6 text-base font-semibold text-primary shadow-2xs hover:border-primary hover:bg-white'
                )}
              >
                <Search className="size-5" />
                <span>ค้นหาสัตว์เลี้ยง</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Banner Image Slider with Cross-Fade Animation */}
          <div className="flex flex-col items-center justify-center lg:col-span-5">
            <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-3xl bg-muted shadow-lg ring-4 ring-white/60">
              {HERO_IMAGES.map((img, index) => {
                const isActive = currentImageIndex === index;

                return (
                  <div
                    key={img.src}
                    className={cn(
                      'absolute inset-0 transition-all duration-1000 ease-in-out',
                      isActive
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 pointer-events-none z-0'
                    )}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                );
              })}

              {/* Slider Dots Overlay Indicator */}
              <div className="absolute bottom-3.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-xs">
                {HERO_IMAGES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    aria-label={`ดูรูปภาพที่ ${idx + 1}`}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      currentImageIndex === idx
                        ? 'w-5 bg-white'
                        : 'w-2 bg-white/50 hover:bg-white/80'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
