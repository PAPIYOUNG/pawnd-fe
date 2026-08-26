'use client';

import Image from 'next/image';
import { CheckCircle2, Mail, Phone, Calendar, Edit3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserProfile } from '@/types/user';

interface UserProfileHeaderProps {
  user: UserProfile;
}

/**
 * UserProfileHeader Component (Client Component)
 * - การ์ดข้อมูลโปรไฟล์ผู้ใช้งานด้านบนสุด (User Profile Header Card)
 * - ออกแบบ Responsive ให้พอดีและสวยงามทั้งบนมือถือและคอมพิวเตอร์
 * - แสดงรูป Avatar, ชื่อ-นามสกุล, ป้ายยืนยันตัวตนแล้ว (Verified Badge)
 * - แสดงอีเมล เบอร์โทรศัพท์ วันที่สมัครสมาชิก และปุ่มแก้ไขโปรไฟล์
 */
export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  const memberDate = new Date(user.createdAt).toLocaleDateString('th-TH', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-border/80 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7 dark:border-border/60">
      {/* ฝั่งซ้าย: รูป Avatar และข้อมูลผู้ใช้ */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* รูป Avatar ขนาดพอดี */}
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-border/80 shadow-md sm:size-22">
          <Image
            src={
              user.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop'
            }
            alt={`${user.firstName} ${user.lastName}`}
            fill
            sizes="(min-width: 640px) 88px, 64px"
            className="object-cover"
            priority
          />
        </div>

        {/* ข้อมูลชื่อและรายละเอียดการติดต่อ */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-2xl">
              คุณ{user.firstName} {user.lastName}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3" />
              ยืนยันตัวตนแล้ว
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
            <span className="flex items-center gap-1">
              <Mail className="size-3.5 text-primary" />
              <span className="line-clamp-1">{user.email}</span>
            </span>
            {user.phone && (
              <span className="flex items-center gap-1">
                <Phone className="size-3.5 text-primary" />
                <span>{user.phone}</span>
              </span>
            )}
            <span className="hidden items-center gap-1 sm:flex">
              <Calendar className="size-3.5 text-primary" />
              <span>เป็นสมาชิกตั้งแต่: {memberDate}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ฝั่งขวา: ปุ่มแก้ไขโปรไฟล์ */}
      <div className="flex shrink-0">
        <Button
          type="button"
          variant="outline"
          className="h-10 min-h-[40px] w-full rounded-2xl border-border px-5 text-xs font-semibold shadow-2xs sm:w-auto sm:text-sm hover:bg-muted"
        >
          <Edit3 className="size-3.5 mr-1.5" />
          <span>แก้ไขโปรไฟล์</span>
        </Button>
      </div>
    </div>
  );
}
