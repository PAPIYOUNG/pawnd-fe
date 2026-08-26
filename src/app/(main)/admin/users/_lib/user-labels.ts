import { UserRole } from '@/types/auth';
import { UserStatus } from '@/types/user';

// ป้ายสถานะผู้ใช้งาน ตรงตาม UserStatus ของ Backend (src/types/user.ts)
export const USER_STATUS_LABEL: Record<
  UserStatus,
  { text: string; className: string }
> = {
  ACTIVE: { text: 'ปกติ', className: 'bg-emerald-500/10 text-emerald-600' },
  PENDING_EMAIL_VERIFICATION: {
    text: 'รอยืนยันอีเมล',
    className: 'bg-amber-500/10 text-amber-600',
  },
  SUSPENDED: {
    text: 'ระงับบัญชี',
    className: 'bg-red-500/10 text-red-600',
  },
  BLACKLISTED: {
    text: 'ขึ้นบัญชีดำ',
    className: 'bg-red-500/10 text-red-600',
  },
  DELETED: {
    text: 'ถูกลบ',
    className: 'bg-muted text-muted-foreground',
  },
};

// ป้ายบทบาทที่รู้จัก ส่วนค่าที่ backend ส่งมานอกเหนือจากนี้จะแสดงค่าดิบแทน (ไม่เดา label เอง)
const USER_ROLE_LABEL: Partial<Record<UserRole, string>> = {
  USER: 'สมาชิกทั่วไป',
  ADMIN: 'ผู้ดูแลระบบ',
};

export function getUserRoleLabel(role: UserRole) {
  return USER_ROLE_LABEL[role] ?? role;
}
