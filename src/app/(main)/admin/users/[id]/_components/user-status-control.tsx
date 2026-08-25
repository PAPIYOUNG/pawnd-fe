'use client';

import { useState, useTransition } from 'react';

import { USER_STATUS_LABEL } from '../../_lib/user-labels';
import { updateUserStatusAction } from '@/lib/action/admin.action';
import { UserStatus } from '@/types/user';

// สถานะที่แอดมินสามารถตั้งค่าเองได้ผ่านหน้านี้ (ไม่รวม PENDING_EMAIL_VERIFICATION/DELETED
// เพราะเป็นสถานะที่ระบบตั้งค่าเองหรือมี flow เฉพาะแยกต่างหาก)
const SELECTABLE_STATUSES: UserStatus[] = [
  'ACTIVE',
  'SUSPENDED',
  'BLACKLISTED',
];

// ข้อความยืนยันก่อนเปลี่ยนสถานะ เพราะการระงับ/ขึ้นบัญชีดำจะบังคับออกจากระบบทุกอุปกรณ์ทันที
const CONFIRM_MESSAGE: Partial<Record<UserStatus, string>> = {
  SUSPENDED:
    'ยืนยันระงับบัญชีนี้? ผู้ใช้จะถูกออกจากระบบทันทีในทุกอุปกรณ์ที่ล็อกอินอยู่',
  BLACKLISTED:
    'ยืนยันขึ้นบัญชีดำผู้ใช้นี้? ผู้ใช้จะถูกออกจากระบบทันทีในทุกอุปกรณ์ที่ล็อกอินอยู่',
  ACTIVE: 'ยืนยันเปิดใช้งานบัญชีนี้อีกครั้ง?',
};

interface UserStatusControlProps {
  userId: string;
  initialStatus: UserStatus;
}

/**
 * UserStatusControl (Client Component)
 * - แสดง Badge สถานะปัจจุบัน + Dropdown เปลี่ยนสถานะบัญชีผู้ใช้งาน
 * - เรียก Server Action `updateUserStatusAction` (PATCH /admin/users/:id/status ของ Backend)
 * - มีขั้นตอนยืนยันก่อนบันทึก เพราะผลกระทบต่อผู้ใช้ (บังคับออกจากระบบ) ย้อนกลับไม่ได้ทันที
 */
export function UserStatusControl({
  userId,
  initialStatus,
}: UserStatusControlProps) {
  const [status, setStatus] = useState<UserStatus>(initialStatus);
  const [selected, setSelected] = useState<UserStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentLabel = USER_STATUS_LABEL[status];

  function handleSave() {
    if (selected === status) return;

    const confirmMessage =
      CONFIRM_MESSAGE[selected] ??
      `ยืนยันเปลี่ยนสถานะเป็น "${USER_STATUS_LABEL[selected].text}"?`;
    if (!window.confirm(confirmMessage)) return;

    setError(null);
    startTransition(async () => {
      const result = await updateUserStatusAction(userId, selected);
      if ('success' in result) {
        setError(result.message);
        setSelected(status);
        return;
      }
      setStatus(result.user.status);
      setSelected(result.user.status);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${currentLabel.className}`}
        >
          {currentLabel.text}
        </span>

        <select
          aria-label="เปลี่ยนสถานะผู้ใช้งาน"
          value={selected}
          disabled={isPending}
          onChange={(event) => setSelected(event.target.value as UserStatus)}
          className="h-8 rounded-2xl border border-transparent bg-input/50 px-2.5 text-xs text-foreground outline-none transition-[color,box-shadow] duration-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {SELECTABLE_STATUSES.map((value) => (
            <option key={value} value={value}>
              {USER_STATUS_LABEL[value].text}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || selected === status}
          className="flex h-8 items-center rounded-2xl bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'กำลังบันทึก...' : 'บันทึกสถานะ'}
        </button>
      </div>

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
