'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface PetReunitedLoaderProps {
  onComplete?: () => void;
  minDuration?: number;
}

/**
 * PetReunitedLoader Component (Client Component)
 * - แอนิเมชันหน้าจอโหลด (Loading / Splash Screen) สื่ออารมณ์ความผูกพัน "ขวัญเอ๋ยขวัญมา พาน้องกลับบ้าน"
 * - ภาพมือมนุษย์ยื่นลงมาจากมุมซ้ายบน และอุ้งเท้าน้องสัตว์เลี้ยงยื่นขึ้นมาจากมุมขวาล่าง
 * - มีเอฟเฟกต์แสงเปล่งประกาย (Spark of Hope) ตรงจุดที่ปลายนิ้วและอุ้งเท้าสัมผัสกัน
 * - ธีมสีเขียวเข้มมรกตของ PAWND (#133E2B / #0A2318) ตัดกับโทนสีอบอุ่นของอุ้งเท้าและแสงทอง
 */
export function PetReunitedLoader({
  onComplete,
  minDuration = 3000,
}: PetReunitedLoaderProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!onComplete) return;

    // ตั้งเวลาให้แอนิเมชันเล่นครบตามระยะเวลาที่กำหนด แล้วค่อยๆ Fade Out
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const exitTimer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(exitTimer);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [onComplete, minDuration]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#092217] via-[#133E2B] to-[#081C13] text-white transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="กำลังโหลดหน้าเว็บ PAWND"
    >
      {/* 1. พื้นหลังละอองแสงอบอุ่น (Atmospheric Warm Glow Particles) */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[380px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[220px] rounded-full bg-amber-400/15 blur-2xl animate-pulse" />
      </div>

      {/* 2. พื้นที่แอนิเมชันภาพเวกเตอร์ มือคน & อุ้งเท้าน้องสัตว์เลี้ยงยื่นหากัน */}
      <div className="relative flex h-[340px] w-[340px] sm:h-[400px] sm:w-[400px] items-center justify-center">
        <svg
          viewBox="0 0 400 400"
          className="h-full w-full drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Defs สำหรับ Gradient & Shadows */}
          <defs>
            {/* Skin Tone Gradient (มือคน) */}
            <linearGradient id="skinGradient" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEE2E2" />
              <stop offset="60%" stopColor="#FDBA74" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>

            {/* Pet Fur Gradient (ขาน้องแมว/สุนัข ส้มแถบทอง) */}
            <linearGradient id="petFurGradient" x1="200" y1="200" x2="400" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Paw Pad Pink Gradient (อุ้งเท้าสีชมพูพีช) */}
            <linearGradient id="pawPadGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FECDD3" />
              <stop offset="100%" stopColor="#FDA4AF" />
            </linearGradient>

            {/* Spark Glow Gradient */}
            <radialGradient id="sparkGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="1" />
              <stop offset="40%" stopColor="#34D399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* แอนิเมชันมือคน (Human Hand) เลื่อนลงมาจากมุมซ้ายบน */}
          <g className="animate-[slideInHuman_1.4s_cubic-bezier(0.16,1,0.3,1)_forwards,floatHand_4s_ease-in-out_infinite_1.4s]">
            {/* แขนท่อนบน */}
            <path
              d="M-20 -20 L75 75 C100 100, 115 115, 125 130 L110 145 C95 130, 80 115, 55 90 L-40 40 Z"
              fill="url(#skinGradient)"
              opacity="0.95"
            />
            {/* ฝ่ามือและนิ้วมือ */}
            {/* นิ้วโป้ง */}
            <path
              d="M115 125 C125 135, 138 142, 148 145 C153 146, 155 142, 150 137 C142 130, 132 122, 120 115 Z"
              fill="#FDBA74"
            />
            {/* นิ้วชี้ (ยื่นไปแตะหาอุ้งเท้า) */}
            <path
              d="M128 135 C142 150, 162 172, 178 190 C182 194, 186 193, 185 188 C176 170, 154 140, 138 126 Z"
              fill="#FDBA74"
            />
            {/* นิ้วกลาง */}
            <path
              d="M120 142 C135 158, 156 180, 170 196 C173 199, 177 197, 175 192 C164 175, 144 148, 130 134 Z"
              fill="#FB923C"
            />
            {/* นิ้วนาง */}
            <path
              d="M110 148 C123 162, 142 182, 154 195 C157 198, 160 196, 158 191 C148 177, 131 155, 120 140 Z"
              fill="#FDBA74"
            />
            {/* นิ้วก้อย */}
            <path
              d="M102 153 C112 165, 128 180, 138 190 C140 192, 143 190, 141 186 C133 174, 119 156, 110 145 Z"
              fill="#FB923C"
            />
          </g>

          {/* แอนิเมชันอุ้งเท้าน้องสัตว์เลี้ยง (Pet Paw) เลื่อนขึ้นมาจากมุมขวาล่าง */}
          <g className="animate-[slideInPet_1.4s_cubic-bezier(0.16,1,0.3,1)_forwards,floatPaw_4s_ease-in-out_infinite_1.4s]">
            {/* ลำแขนน้องสัตว์เลี้ยง พร้อมลวดลาย Tabby Stripes */}
            <path
              d="M420 420 L300 300 C280 280, 260 260, 240 238 C232 230, 242 218, 252 225 C275 242, 298 265, 320 288 L440 380 Z"
              fill="url(#petFurGradient)"
            />
            {/* ลายพาดสีส้มเข้ม (Tabby Stripes) */}
            <path d="M330 330 L350 310 L365 325 Z" fill="#9A3412" opacity="0.6" />
            <path d="M290 290 L310 270 L325 285 Z" fill="#9A3412" opacity="0.6" />
            <path d="M255 255 L272 238 L285 250 Z" fill="#9A3412" opacity="0.6" />

            {/* อุ้งเท้ากลมนุ่ม (Main Paw Pad Base) */}
            <ellipse cx="230" cy="225" rx="26" ry="24" fill="#F59E0B" />

            {/* อุ้งเท้าใหญ่ตรงกลาง (Center Heart-shaped / Round Pad) */}
            <path
              d="M228 220 C220 212, 212 218, 214 228 C216 238, 230 244, 238 240 C246 236, 246 226, 240 220 C236 216, 232 216, 228 220 Z"
              fill="url(#pawPadGradient)"
            />

            {/* นิ้วเท้ากลมน้อย 4 นิ้ว (Toe Beans) */}
            {/* นิ้วที่ 1 */}
            <circle cx="206" cy="214" r="7" fill="url(#pawPadGradient)" />
            {/* นิ้วที่ 2 (ยื่นเข้าใกล้มือมนุษย์มากที่สุด) */}
            <circle cx="218" cy="202" r="7.5" fill="url(#pawPadGradient)" />
            {/* นิ้วที่ 3 */}
            <circle cx="234" cy="199" r="7.5" fill="url(#pawPadGradient)" />
            {/* นิ้วที่ 4 */}
            <circle cx="248" cy="208" r="6.5" fill="url(#pawPadGradient)" />
          </g>

          {/* จุดประกายแสงแห่งความหวังตรงกลางระหว่างปลายนิ้วและอุ้งเท้า (Spark of Hope) */}
          <g className="animate-[pulseSpark_2.5s_ease-in-out_infinite_1.2s]">
            <circle cx="200" cy="195" r="26" fill="url(#sparkGlow)" />
            {/* แสงแฉกดาวระยิบระยับ */}
            <path
              d="M200 178 L202 193 L217 195 L202 197 L200 212 L198 197 L183 195 L198 193 Z"
              fill="#FFFFFF"
              className="animate-[spin_6s_linear_infinite]"
              style={{ transformOrigin: '200px 195px' }}
            />
            <circle cx="200" cy="195" r="3.5" fill="#FEF08A" />
          </g>
        </svg>
      </div>

      {/* 3. ข้อความซาบซึ้งใจสื่อสารตามเอกลักษณ์ Pawnd พร้อมแอนิเมชัน Fade-Up */}
      <div className="relative z-10 mt-4 flex flex-col items-center gap-2.5 px-6 text-center animate-[fadeInUp_1.2s_ease-out_forwards_0.6s] opacity-0">
        {/* ข้อความหลัก */}
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl text-balance drop-shadow-md">
          ขวัญเอ๋ยขวัญมา
        </h2>
        <p className="text-lg font-bold text-[#A7F3D0] sm:text-xl drop-shadow-xs">
          พาน้องกลับบ้าน
        </p>

        {/* ข้อความสโลแกนและแถบโหลดนุ่มนวล */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-white/70">
            <Image
              src="/logo.png"
              alt="PAWND"
              width={20}
              height={20}
              className="size-4.5 rounded-full brightness-0 invert opacity-80"
            />
            <span>PAWND • กำลังเตรียมความพร้อมระบบค้นหาและจับคู่...</span>
          </div>

          {/* แถบ Loading Bar วิ่งนุ่มนวล */}
          <div className="h-1.5 w-44 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-amber-300 animate-[loadingProgress_2.8s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      {/* 4. Global Keyframe Animations สำหรับ Component นี้ */}
      <style jsx>{`
        @keyframes slideInHuman {
          0% {
            transform: translate(-120px, -120px) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
        }

        @keyframes slideInPet {
          0% {
            transform: translate(120px, 120px) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
        }

        @keyframes floatHand {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(4px, 4px);
          }
        }

        @keyframes floatPaw {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-4px, -4px);
          }
        }

        @keyframes pulseSpark {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.25);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loadingProgress {
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
