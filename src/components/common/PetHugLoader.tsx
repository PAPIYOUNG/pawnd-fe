'use client';

import Image from 'next/image';
import { Mali } from 'next/font/google';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// โหลดฟอนต์ Mali สไตล์น่ารัก อบอุ่น โค้งมน
const cuteMaliFont = Mali({
  weight: ['600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

interface PetHugLoaderProps {
  lottieSrc?: string;
}

/**
 * PetHugLoader Component (Client Component)
 * - หน้าจอโหลดแอนิเมชัน Lottie ของแท้ "คนกอดน้องหมาน้องแมว (Pet Hug)" จาก LottieFiles
 * - ลบกรอบสี่เหลี่ยมรอบโลโก้ออก 100% ให้เหลือเฉพาะตัวโลโก้โปร่งใส (Transparent PAWND Logo)
 * - ขยายขนาดโลโก้ให้ใหญ่ขึ้นเด่นชัด (size-28 sm:size-36 หรือ 112px - 144px)
 * - ข้อความ "ช่วยน้อง กลับบ้านอย่างปลอดภัย" ดัดโค้งครอบเหนือภาพแอนิเมชันด้วยฟอนต์ Mali
 * - ขยายภาพแอนิเมชันและหลอดโหลด (Loading Bar) ให้สวยงาม สมดุล และลงตัว
 * - รองรับทั้ง Light Mode (พื้นหลังนวลตา #ECF5EE) และ Dark Mode (รัตติกาลลุ่มลึก #071E14)
 */
export function PetHugLoader({
  lottieSrc = '/animations/pet-hug.json',
}: PetHugLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#ECF5EE] px-4 transition-colors duration-300 dark:bg-[#071E14]"
      aria-label="กำลังโหลดหน้าเว็บ PAWND"
    >
      {/* 1. วงแสงละมุนด้านหลัง (Soft Ambient Halo) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none dark:bg-primary/20" />

      {/* 2. กล่องรวมโลโก้ ข้อความโค้ง และภาพแอนิเมชัน */}
      <div className={`relative flex flex-col items-center justify-center ${cuteMaliFont.className}`}>
        {/* โลโก้ PAWND แบบตัดกรอบออก โปร่งใส 100% พร้อมขยายขนาดใหญ่สะใจ (size-28 sm:size-36) */}
        <div className="relative mb-1 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="PAWND Logo"
            width={160}
            height={160}
            className="size-28 sm:size-36 object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
            priority
          />
        </div>

        {/* ข้อความดัดโค้งครอบภาพแอนิเมชัน (Curved Subtitle Text) */}
        <div className="relative z-10 -mt-1 -mb-6 flex justify-center">
          <svg
            viewBox="0 0 380 65"
            className="h-[55px] w-[300px] sm:h-[65px] sm:w-[360px] drop-shadow-xs"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* เส้นทางโค้งที่กว้างและสมดุล (Wider Balanced Arc) */}
            <path
              id="cuteArchPath"
              d="M 15 58 Q 190 8 365 58"
              fill="none"
            />
            {/* ข้อความวางตามแนวเส้นโค้ง */}
            <text className="fill-[#164E36] dark:fill-[#A7F3D0] font-bold text-[18px] sm:text-[20px] tracking-wide">
              <textPath href="#cuteArchPath" startOffset="50%" textAnchor="middle">
                ช่วยน้อง กลับบ้านอย่างปลอดภัย
              </textPath>
            </text>
          </svg>
        </div>

        {/* ภาพแอนิเมชัน Lottie Pet Hug (พื้นหลังโปร่งใส 100% ขยายใหญ่ขึ้น) */}
        <div className="relative flex size-64 sm:size-80 items-center justify-center">
          <DotLottieReact
            src={lottieSrc}
            loop
            autoplay
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      {/* 3. หลอดโหลดด้านล่าง (Enlarged Loading Progress Bar) */}
      <div className="mt-4 flex flex-col items-center">
        <div className="h-3 sm:h-3.5 w-64 sm:w-80 max-w-xs overflow-hidden rounded-full bg-[#164E36]/20 p-0.5 shadow-inner dark:bg-white/20">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] shadow-xs animate-[loadingBar_2s_ease-in-out_infinite] dark:from-[#34D399] dark:to-[#10B981]" />
        </div>
      </div>

      {/* 4. สไตล์ Keyframe สำหรับหลอดโหลด */}
      <style jsx>{`
        @keyframes loadingBar {
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
