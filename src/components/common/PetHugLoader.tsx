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
 * - หน้าจอโหลดแอนิเมชัน Signature ของ PAWND (Brand Signature Splash Screen)
 * - ล็อคธีมสีเอกลักษณ์ประจำแบรนด์ (Signature Sage Green #ECF5EE) โดยไม่เปลี่ยนตาม Dark Mode เพื่อรักษาความสวยงาม อบอุ่น และเป็นมิตรสูงสุดในทุกสภาวะ
 * - โลโก้ PAWND ขนาดใหญ่ ไร้กรอบ โปร่งใส 100%
 * - ข้อความ "ช่วยน้อง กลับบ้านอย่างปลอดภัย" ดัดโค้งครอบเหนือภาพแอนิเมชัน Pet Hug ลายเส้นคมชัด
 * - หลอดโหลด (Loading Bar) สีเขียวมรกต Gradient ขนาดใหญ่ นุ่มนวล ชัดเจน
 */
export function PetHugLoader({
  lottieSrc = '/animations/pet-hug.json',
}: PetHugLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#ECF5EE] px-4 select-none"
      aria-label="กำลังโหลดหน้าเว็บ PAWND"
    >
      {/* 1. วงแสงละมุนด้านหลัง (Soft Ambient Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-[#10B981]/10 blur-3xl pointer-events-none" />

      {/* 2. กล่องรวมโลโก้ ข้อความโค้ง และภาพแอนิเมชัน */}
      <div className={`relative flex flex-col items-center justify-center ${cuteMaliFont.className}`}>
        {/* โลโก้ PAWND ทางการแบบโปร่งใส ไร้กรอบ ขยายขนาดใหญ่โดดเด่น */}
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
            <text className="fill-[#164E36] font-bold text-[18px] sm:text-[20px] tracking-wide">
              <textPath href="#cuteArchPath" startOffset="50%" textAnchor="middle">
                ช่วยน้อง กลับบ้านอย่างปลอดภัย
              </textPath>
            </text>
          </svg>
        </div>

        {/* ภาพแอนิเมชัน Lottie Pet Hug ลายเส้นต้นฉบับคมชัด น่ารัก อบอุ่น มีชีวิตชีวา */}
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
        <div className="h-3 sm:h-3.5 w-64 sm:w-80 max-w-xs overflow-hidden rounded-full bg-[#164E36]/15 p-0.5 shadow-inner">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] shadow-xs animate-[loadingBar_2s_ease-in-out_infinite]" />
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
