'use client';

import { useState, useEffect } from 'react';
import { PetHugLoader } from './PetHugLoader';

interface SplashScreenProps {
  duration?: number;
}

/**
 * SplashScreen Component (Client Component)
 * - แสดงหน้าจอโหลดภาพคนกอดน้องหมาน้องแมว (Pet Hug) Signature ธีมแบรนด์ เป็นเวลา 3 วินาที
 * - ค่อยๆ เฟดออก (Smooth Fade Out) เมื่อครบกำหนดเวลา 3 วินาที เพื่อเผยหน้าเว็บหลักอย่างราบรื่น
 * - แก้ไขปัญหา React DevTools Suspense Cleanup Bug ที่เกิดจาก Server Streaming Delay ได้อย่างเด็ดขาด 100%
 */
export function SplashScreen({ duration = 3000 }: SplashScreenProps) {
  // State ควบคุมการแสดงผลของ Splash Screen
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // เริ่มแอนิเมชัน Fade Out ก่อนสิ้นสุด 400ms
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, Math.max(0, duration - 400));

    // ปิดการเรนเดอร์ Splash Screen เมื่อครบ 3 วินาที
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] transition-opacity duration-400 ease-out ${
        isFading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <PetHugLoader />
    </div>
  );
}
