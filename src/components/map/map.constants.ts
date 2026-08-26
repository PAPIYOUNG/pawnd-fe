import type { MapPostProperties } from '@/types/map';
import type { PostType } from '@/types/post';

/** ค่าตั้งต้นและข้อจำกัดที่ใช้ร่วมกันในแผนที่ โดยคงค่าจาก implementation เดิม */
export const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018];
export const DEFAULT_ZOOM = 11;
export const SELECTED_POST_ZOOM = 15;
export const VIEWPORT_DEBOUNCE_MS = 350;
export const VIEWPORT_COMPARISON_EPSILON = 1e-7;
export const MAP_POST_LIMIT = 200;

/** ป้ายชื่อประเภทประกาศที่แสดงใน popup ของ marker */
export const POST_TYPE_LABEL: Record<PostType, string> = {
  LOST: 'สัตว์หาย',
  FOUND: 'พบสัตว์พลัดหลง',
};

/** ป้ายชื่อประเภทสัตว์ที่แสดงใน popup ของ marker */
export const PET_TYPE_LABEL: Record<MapPostProperties['petType'], string> = {
  DOG: 'สุนัข',
  CAT: 'แมว',
  BIRD: 'นก',
  HAMSTER: 'แฮมสเตอร์',
  EXOTIC: 'สัตว์พิเศษ',
  OTHER: 'สัตว์เลี้ยง',
};
