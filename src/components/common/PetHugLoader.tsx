'use client';

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
 * - ปรับตำแหน่งข้อความ: วางชื่อแบรนด์ "Pawnd" ตัวโตน่ารักไว้ด้านบนสุดตรงกลาง และดัดโค้งข้อความ "ช่วยน้อง กลับบ้านอย่างปลอดภัย" ครอบเหนือภาพ
 * - ขยายขนาดหลอดโหลด (Loading Bar) ให้ใหญ่ขึ้น หนาขึ้น ชัดเจนขึ้น 3-4 เท่า
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none dark:bg-primary/20" />

      {/* 2. กล่องรวมภาพและข้อความด้านบน */}
      <div className={`relative flex flex-col items-center justify-center ${cuteMaliFont.className}`}>
        {/* ชื่อแบรนด์ Pawnd เด่นๆ อยู่ด้านบนสุดตรงกลาง */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-wide text-[#164E36] drop-shadow-xs dark:text-[#34D399]">
          Pawnd
        </h1>

        {/* ข้อความดัดโค้งครอบภาพแอนิเมชัน (Curved Subtitle Text) */}
        <div className="relative z-10 -mt-1 -mb-6 flex justify-center">
          <svg
            viewBox="0 0 360 65"
            className="h-[55px] w-[290px] sm:h-[65px] sm:w-[340px] drop-shadow-xs"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* เส้นทางโค้งที่กว้างและสมดุล (Wider Balanced Arc) */}
            <path
              id="cuteArchPath"
              d="M 15 58 Q 180 8 345 58"
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

        {/* ภาพแอนิเมชัน Lottie Pet Hug (พื้นหลังโปร่งใส 100%) */}
        <div className="relative flex size-60 sm:size-72 items-center justify-center">
          <DotLottieReact
            src={lottieSrc}
            loop
            autoplay
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      {/* 3. หลอดโหลดด้านล่าง (Enlarged Loading Progress Bar - ขยายใหญ่ขึ้น 3-4 เท่า) */}
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
