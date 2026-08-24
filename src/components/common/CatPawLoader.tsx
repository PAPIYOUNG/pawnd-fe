'use client';

import Image from 'next/image';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface CatPawLoaderProps {
  text?: string;
  subtitle?: string;
  lottieSrc?: string;
}

/**
 * CatPawLoader Component (Client Component)
 * - แสดงแอนิเมชัน Lottie รอยเท้าแมว (Cat Paw Loading) ผ่าน @lottiefiles/dotlottie-react
 * - รองรับไฟล์ .lottie หรือ .json ในโฟลเดอร์ public/animations/cat-paw.json หรือ Lottie URL
 * - ปรับแต่งตามระบบ Theme และ Branding ของ PAWND
 */
export function CatPawLoader({
  text = 'กำลังเตรียมข้อมูลเพื่อนรัก...',
  subtitle = 'PAWND • ช่วยสัตว์เลี้ยงกลับบ้านอย่างปลอดภัย',
  lottieSrc = '/animations/cat-paw.json',
}: CatPawLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#ECF5EE] px-4 transition-colors duration-300 dark:bg-[#071E14]"
      aria-label="กำลังโหลดข้อมูลหน้าแรก"
    >
      {/* 1. วงแสงละมุนด้านหลัง (Ambient Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-primary/10 blur-3xl pointer-events-none dark:bg-primary/20" />

      {/* 2. กล่องแอนิเมชัน Lottie Cat Paw */}
      <div className="relative flex size-48 sm:size-56 items-center justify-center">
        <DotLottieReact
          src={lottieSrc}
          loop
          autoplay
          className="h-full w-full"
        />
      </div>

      {/* 3. ส่วนข้อความและแถบสถานะโหลด (Brand Typography & Progress Bar) */}
      <div className="mt-4 flex flex-col items-center gap-2.5 text-center">
        {/* โลโก้แบรนด์ Pawnd */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="PAWND Logo"
            width={24}
            height={24}
            className="size-6 rounded-full object-contain"
          />
          <span className="text-xl font-extrabold tracking-tight text-[#164E36] dark:text-[#6EE7B7]">
            Pawnd
          </span>
        </div>

        {/* ข้อความสถานะ */}
        <p className="text-base font-bold text-[#1D3E2F] sm:text-lg dark:text-[#D1FAE5]">
          {text}
        </p>

        {/* สโลแกน */}
        <p className="max-w-xs text-xs font-medium text-muted-foreground sm:text-sm dark:text-muted-foreground/90">
          {subtitle}
        </p>

        {/* แถบ Progress Bar */}
        <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-[#164E36]/15 dark:bg-white/15">
          <div className="h-full w-full rounded-full bg-primary animate-[pawProgress_2.2s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* 4. สไตล์ Keyframe สำหรับแถบสถานะ */}
      <style jsx>{`
        @keyframes pawProgress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
