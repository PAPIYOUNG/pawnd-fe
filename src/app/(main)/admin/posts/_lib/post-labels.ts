import { PetGender, PetType, PostStatus, PostType } from '@/types/post';

// ป้ายประเภทประกาศ ตรงตาม PostType ของ Backend (src/types/post.ts)
export const POST_TYPE_LABEL: Record<
  PostType,
  { text: string; className: string }
> = {
  LOST: { text: 'สัตว์เลี้ยงหาย', className: 'bg-red-500/10 text-red-600' },
  FOUND: { text: 'พบสัตว์เลี้ยง', className: 'bg-blue-500/10 text-blue-600' },
};

// ป้ายสถานะประกาศ ตรงตาม PostStatus ของ Backend (src/types/post.ts)
export const POST_STATUS_LABEL: Record<
  PostStatus,
  { text: string; className: string }
> = {
  ACTIVE: { text: 'กำลังตามหา', className: 'bg-amber-500/10 text-amber-600' },
  REUNITED: {
    text: 'พากลับบ้านแล้ว',
    className: 'bg-emerald-500/10 text-emerald-600',
  },
  CLOSED: { text: 'ปิดประกาศ', className: 'bg-muted text-muted-foreground' },
  HIDDEN: { text: 'ซ่อนประกาศ', className: 'bg-zinc-500/10 text-zinc-600' },
  DELETED: { text: 'ถูกลบ', className: 'bg-red-500/10 text-red-600' },
};

// สถานะทั้งหมดที่แอดมินตั้งค่าได้ผ่านหน้านี้ ตรงตาม PostStatus enum ของ Backend ทุกค่า
export const SELECTABLE_POST_STATUSES: PostStatus[] = [
  'ACTIVE',
  'REUNITED',
  'CLOSED',
  'HIDDEN',
  'DELETED',
];

// ป้ายประเภทสัตว์เลี้ยง ตรงตาม PetType ของ Backend (src/types/post.ts)
export const PET_TYPE_LABEL: Record<PetType, string> = {
  DOG: 'สุนัข',
  CAT: 'แมว',
  BIRD: 'นก',
  HAMSTER: 'แฮมสเตอร์',
  EXOTIC: 'สัตว์พิเศษ',
  OTHER: 'อื่นๆ',
};

// ป้ายเพศสัตว์เลี้ยง ตรงตาม PetGender ของ Backend (src/types/post.ts)
export const PET_GENDER_LABEL: Record<PetGender, string> = {
  MALE: 'เพศผู้',
  FEMALE: 'เพศเมีย',
  UNKNOWN: 'ไม่ระบุเพศ',
};
