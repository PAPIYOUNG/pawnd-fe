'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * รายการรูปภาพสัตว์เลี้ยงสำหรับสลับเป็นภาพพื้นหลัง (Hero Background Image Carousel)
 */
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

/**
 * HeroSection Component
 * - ส่วนแบนเนอร์ด้านบนสุดของหน้าแรก (Landing Hero)
 * - มีระบบสลับภาพพื้นหลังอัตโนมัติ (Auto-rotating Cross-fade Background) ทุก 6 วินาที
 * - วางการ์ดกระจกฝ้าโปร่งแสง (Translucent Frosted Glass Card) อยู่ตรงกลางเพื่อให้มองเห็นภาพสัตว์เลี้ยงด้านหลังชัดเจน
 * - ปุ่ม Action CTA คู่ขนาดเท่ากัน: "แจ้งสัตว์เลี้ยงหาย" และ "ค้นหาสัตว์เลี้ยง"
 */
export function HeroSection() {
  // State เก็บ Index ของภาพพื้นหลังปัจจุบันที่กำลังแสดงผล
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ตั้งเวลาสลับภาพพื้นหลังอัตโนมัติทุกๆ 6 วินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#ECF5EE] py-16 transition-colors duration-300 sm:py-20 lg:py-24 dark:bg-[#071E14]">
      {/* 1. เลเยอร์ภาพพื้นหลังเต็มผืน พร้อมเอฟเฟกต์ Cross-Fade ซ้อนจางหายอย่างนุ่มนวล */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {HERO_IMAGES.map((img, index) => {
          const isActive = currentImageIndex === index;

          return (
            <div
              key={img.src}
              className={cn(
                'absolute inset-0 transition-all duration-1000 ease-in-out',
                isActive
                  ? 'opacity-85 scale-100 dark:opacity-50'
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

        {/* เลเยอร์เกรเดียนต์ขอบบน-ล่าง เพื่อให้กลืนกับ Header และ Section ถัดไปอย่างเนียนตา */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ECF5EE]/30 via-transparent to-[#ECF5EE]/50 dark:from-[#071E14]/70 dark:via-transparent dark:to-[#071E14]/90" />
      </div>

      {/* 2. การ์ดกระจกฝ้าโปร่งแสงจัดกึ่งกลาง (Centered Translucent Frosted Glass Card) */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/60 bg-white/55 p-8 text-center shadow-xl backdrop-blur-md transition-colors duration-300 sm:p-10 lg:p-12 dark:border-white/10 dark:bg-[#0E281C]/65 dark:shadow-2xl">
          {/* แอนิเมชัน Lottie 'No Search Results' ด้านบนหัวข้อหลักตามที่ระบุในตำแหน่งวงกลมสีแดง */}
          <div className="size-32 sm:size-40 -mb-4 flex items-center justify-center pointer-events-none select-none">
            <DotLottieReact
              src="/animations/No Search Results.json"
              loop
              autoplay
              className="size-full object-contain"
            />
          </div>

          {/* หัวข้อหลักประจำหน้าเว็บ */}
          <h1 className="text-3xl font-extrabold tracking-tight text-[#164E36] drop-shadow-xs sm:text-4xl lg:text-5xl lg:leading-[1.25] dark:text-[#6EE7B7]">
            ช่วยสัตว์เลี้ยงกลับบ้านอย่างปลอดภัย
          </h1>

          {/* ข้อความอธิบายบริการของแพลตฟอร์ม */}
          <p className="max-w-2xl text-base font-semibold leading-relaxed text-[#1D3E2F] drop-shadow-xs sm:text-lg dark:text-[#D1FAE5]">
            แพลตฟอร์มศูนย์รวมการตามหาสัตว์เลี้ยงหายและช่วยสัตว์พลัดหลง พร้อมระบบค้นหาและจับคู่ภาพถ่ายด้วย AI อัจฉริยะ ช่วยให้การค้นหาและคืนสัตว์เลี้ยงของคุณมีโอกาสสำเร็จสูงสุด
          </p>

          {/* กลุ่มปุ่ม Call-to-Action ขนาดเท่ากัน จัดกึ่งกลาง */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {/* ปุ่มหลัก: แจ้งสัตว์เลี้ยงหาย (ส่งไปหน้าสร้างประกาศโพสต์สัตว์หาย) */}
            <Link
              href="/posts/create?type=LOST"
              className={cn(
                buttonVariants({ variant: 'default', size: 'lg' }),
                'h-13 min-w-[200px] justify-center rounded-2xl border-2 border-transparent bg-primary px-6 text-base font-semibold text-primary-foreground shadow-md transition-all hover:scale-105 hover:bg-primary/90'
              )}
            >
              <Plus className="size-5 stroke-[2.5]" />
              <span>แจ้งสัตว์เลี้ยงหาย</span>
            </Link>

            {/* ปุ่มรอง: ค้นหาสัตว์เลี้ยง (ส่งไปหน้าหน้ารวมประกาศทั้งหมด) */}
            <Link
              href="/posts"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-13 min-w-[200px] justify-center rounded-2xl border-2 border-primary/50 bg-white/90 px-6 text-base font-semibold text-primary shadow-xs backdrop-blur-xs transition-all hover:scale-105 hover:border-primary hover:bg-white dark:border-border dark:bg-card/90 dark:text-foreground dark:hover:bg-card'
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
