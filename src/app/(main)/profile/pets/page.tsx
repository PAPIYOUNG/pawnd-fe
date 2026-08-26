import { Metadata } from 'next';
import { getMyPets } from '@/services/pet.service';
import { PetShowcaseList } from './_components/pet-showcase-list';

export const metadata: Metadata = {
  title: 'โปรไฟล์สัตว์เลี้ยง | PAWND',
  description: 'จัดการข้อมูลสัตว์เลี้ยงและ QR Code สำหรับสัตว์เลี้ยงของคุณ',
};

/**
 * PetProfilePage (Server Component - RSC)
 * - ดึงข้อมูลสัตว์เลี้ยงทั้งหมดของผู้ใช้งานจาก Backend
 * - เรนเดอร์คอมโพเนนต์แสดงผลการ์ดสัตว์เลี้ยงพาโนรามาและระบบ Smart QR Code
 */
export default async function PetProfilePage() {
  const pets = await getMyPets();

  return <PetShowcaseList initialPets={pets} />;
}
