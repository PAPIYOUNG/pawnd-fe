import { ReportStatus } from '@/types/admin';

// ป้ายสถานะรายงาน ตรงตาม ReportStatus ของ Backend (src/types/admin.ts)
export const REPORT_STATUS_LABEL: Record<
  ReportStatus,
  { text: string; className: string }
> = {
  PENDING: { text: 'รอตรวจสอบ', className: 'bg-amber-500/10 text-amber-600' },
  REVIEWED: { text: 'ตรวจสอบแล้ว', className: 'bg-blue-500/10 text-blue-600' },
  REJECTED: {
    text: 'ยกคำร้อง',
    className: 'bg-zinc-500/10 text-zinc-600',
  },
  ACTION_TAKEN: {
    text: 'ดำเนินการแล้ว',
    className: 'bg-emerald-500/10 text-emerald-600',
  },
};

// สถานะที่แอดมินเลือกได้เมื่อตรวจสอบรายงาน (ไม่รวม PENDING เพราะเป็นสถานะเริ่มต้นเท่านั้น)
export const REVIEWABLE_REPORT_STATUSES: ReportStatus[] = [
  'REVIEWED',
  'REJECTED',
  'ACTION_TAKEN',
];
