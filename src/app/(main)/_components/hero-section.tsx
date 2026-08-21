'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HERO_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=1600&auto=format&fit=crop',
    alt: 'สุนัขและแมวเพื่อนรักที่ได้อยู่บ้านอย่างปลอดภัยและอบอุ่น',
  },
  {
    src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1600&auto=format&fit=crop',
    alt: 'สุนัขสองตัววิ่งเล่นอย่างมีความสุขบนสนามหญ้า',
  },
  {
    src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1600&auto=format&fit=crop',
    alt: 'แมวไทยน่ารักตาใสในบ้านที่อบอุ่น',
  },
  {
    src: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1600&auto=format&fit=crop',
    alt: 'ลูกสุนัขและลูกแมวนอนกอดกันในบ้าน',
  },
];

export function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate background images every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#ECF5EE] py-16 sm:py-20 lg:py-24">
      {/* 1. Full-width High-Visibility Background Layer with Cross-Fade */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {HERO_IMAGES.map((img, index) => {
          const isActive = currentImageIndex === index;

          return (
            <div
              key={img.src}
              className={cn(
                'absolute inset-0 transition-all duration-1000 ease-in-out',
                isActive
                  ? 'opacity-80 scale-100'
                  : 'opacity-0 scale-105'
              )}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          );
        })}

        {/* Subtle top & bottom edge gradients for seamless transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ECF5EE]/40 via-transparent to-[#ECF5EE]/60" />
      </div>

      {/* 2. Centered Frosted Glass Content Card */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/80 bg-white/80 p-8 text-center shadow-xl backdrop-blur-md sm:p-10 lg:p-12">
          {/* Main Headline */}
          <h1 className="text-3xl font-extrabold tracking-tight text-[#164E36] sm:text-4xl lg:text-5xl lg:leading-[1.25]">
            ช่วยสัตว์เลี้ยงกลับบ้านอย่างปลอดภัย
          </h1>

          {/* Subtitle / Description */}
          <p className="max-w-2xl text-base font-medium leading-relaxed text-[#1D3E2F] sm:text-lg">
            แพลตฟอร์มศูนย์รวมการตามหาสัตว์เลี้ยงหายและช่วยสัตว์พลัดหลง พร้อมระบบค้นหาและจับคู่ภาพถ่ายด้วย AI อัจฉริยะ ช่วยให้การค้นหาและคืนสัตว์เลี้ยงของคุณมีโอกาสสำเร็จสูงสุด
          </p>

          {/* Action Buttons (Centered & Equal Width) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {/* Primary CTA */}
            <Link
              href="/posts/create?type=LOST"
              className={cn(
                buttonVariants({ variant: 'default', size: 'lg' }),
                'h-13 min-w-[200px] justify-center rounded-2xl border-2 border-transparent bg-primary px-6 text-base font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 hover:bg-primary/90'
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
                'h-13 min-w-[200px] justify-center rounded-2xl border-2 border-primary/40 bg-white px-6 text-base font-semibold text-primary shadow-xs transition-transform hover:scale-105 hover:border-primary hover:bg-white'
              )}
            >
              <Search className="size-5" />
              <span>ค้นหาสัตว์เลี้ยง</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
