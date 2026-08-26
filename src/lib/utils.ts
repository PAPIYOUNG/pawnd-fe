import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const THAI_SHORT_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const;

// จัดรูปแบบวันที่เป็น "DD เดือนย่อ. YYYY" แบบปี ค.ศ. (ไม่ใช่ Intl 'th-TH' เพราะ default เป็นปี พ.ศ.)
export function formatThaiShortDate(date: string | Date) {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = THAI_SHORT_MONTHS[parsed.getMonth()];
  return `${day} ${month} ${parsed.getFullYear()}`;
}
