'use client';

import { useEffect, useState } from 'react';

/**
 * Hook สำหรับนับเวลาถอยหลังก่อนอนุญาตให้ผู้ใช้กด "ขอรหัส OTP ใหม่" อีกครั้ง
 * ป้องกันการกดขอ OTP ซ้ำถี่เกินไป และให้เวลาผู้ใช้เช็คอีเมลก่อน
 *
 * @param initialSeconds จำนวนวินาทีเริ่มต้นของการนับถอยหลัง (ค่าเริ่มต้น 60 วินาที)
 */
export function useResendCooldown(initialSeconds = 60) {
  const [remaining, setRemaining] = useState(initialSeconds);

  // นับถอยหลังทีละ 1 วินาที จนกว่าจะถึง 0 แล้วหยุดนับ
  useEffect(() => {
    if (remaining <= 0) return;

    const timer = setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining]);

  // เรียกตอนเข้าหน้า OTP ครั้งแรก และหลังกด "ขอ OTP ใหม่" สำเร็จ เพื่อรีเซ็ตตัวนับ
  const start = (seconds = initialSeconds) => setRemaining(seconds);

  return { remaining, isActive: remaining > 0, start };
}
