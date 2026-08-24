import { PetHugLoader } from '@/components/common/PetHugLoader';

/**
 * Loading Component (Next.js App Router Suspense Fallback)
 * - แสดงหน้าจอโหลดภาพคนกอดน้องหมาน้องแมว (Pet Hug) พร้อมหลอดโหลดด้านล่าง (ไม่มีตัวหนังสือ/โลโก้) ก่อนเข้าสู่หน้าแรก
 * - ทำงานอัตโนมัติขณะที่ Server Component กำลัง Fetch ข้อมูลจาก Backend
 */
export default function Loading() {
  return <PetHugLoader />;
}
