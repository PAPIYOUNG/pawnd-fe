import Image from 'next/image';
import { CheckCircle2, AlertCircle, Clock, Ban } from 'lucide-react';

import { UserProfile, UserStatus } from '@/types/user';

interface UserProfileHeaderProps {
  user: UserProfile;
}

/** ป้ายสถานะบัญชี แยกสี/ข้อความตาม user.status จริงจาก Backend (GET /users/me) */
const ACCOUNT_STATUS_BADGE: Record<
  UserStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  ACTIVE: {
    label: 'ยืนยันตัวตนแล้ว',
    icon: CheckCircle2,
    className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  PENDING_EMAIL_VERIFICATION: {
    label: 'ยังไม่ยืนยันตัวตน',
    icon: AlertCircle,
    className: 'bg-destructive/15 text-destructive',
  },
  SUSPENDED: {
    label: 'ถูกระงับการใช้งานชั่วคราว กำลังตรวจสอบ',
    icon: Clock,
    className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  },
  BLACKLISTED: {
    label: 'ถูกระงับการใช้งานถาวร',
    icon: Ban,
    className: 'bg-neutral-900/10 text-neutral-900 dark:bg-neutral-100/15 dark:text-neutral-100',
  },
  DELETED: {
    label: 'บัญชีถูกลบ',
    icon: Ban,
    className: 'bg-muted text-muted-foreground',
  },
};

/**
 * UserProfileHeader Component (Server Component - RSC)
 * - ส่วนหัวข้อมูลผู้ใช้งานด้านในการ์ดโปรไฟล์ (อยู่ในกรอบเดียวกับ UserProfileDetailsGrid ที่หน้า /profile)
 * - แสดงรูป Avatar, ชื่อ-นามสกุล และป้ายสถานะบัญชี เช็คจาก user.status จริงจาก Backend
 *   (ACTIVE=เขียว, PENDING_EMAIL_VERIFICATION=แดง, SUSPENDED=ม่วง, BLACKLISTED=ดำ)
 */
export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  const statusBadge = ACCOUNT_STATUS_BADGE[user.status];
  const StatusIcon = statusBadge.icon;

  return (
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

      {/* ข้อมูลชื่อและป้ายสถานะบัญชี */}
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-2xl">
            คุณ{user.firstName} {user.lastName}
          </h2>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${statusBadge.className}`}
          >
            <StatusIcon className="size-3" />
            {statusBadge.label}
          </span>
        </div>
      </div>
    </div>
  );
}
