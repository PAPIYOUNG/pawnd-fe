import type { MapPostProperties } from '@/types/map';
import type { PostType } from '@/types/post';

/** ค่าคงที่ของหน้า Map ที่ใช้ร่วมกันระหว่าง sidebar และ lifecycle ของ nearby API */
export const DEFAULT_MAP_CENTER: [number, number] = [13.7563, 100.5018];
export const NEARBY_DEBOUNCE_MS = 350;
export const NEARBY_POST_LIMIT = 100;

/** ป้ายประเภทประกาศที่ใช้แสดงในรายการ nearby */
export const POST_TYPE_LABEL: Record<PostType, string> = {
  LOST: 'สัตว์หาย',
  FOUND: 'พบสัตว์พลัดหลง',
};

/** ป้ายประเภทสัตว์ที่ใช้แสดงในรายการ nearby */
export const PET_TYPE_LABEL: Record<MapPostProperties['petType'], string> = {
  DOG: 'สุนัข',
  CAT: 'แมว',
  BIRD: 'นก',
  HAMSTER: 'แฮมสเตอร์',
  EXOTIC: 'สัตว์พิเศษ',
  OTHER: 'สัตว์เลี้ยง',
};
