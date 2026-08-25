import { redirect } from 'next/navigation';

/**
 * PetsPage - Route Alias สำหรับ /pets
 * นำทางไปยัง /profile/pets อัตโนมัติ เพื่อรองรับ URL Convention ทั้ง 2 รูปแบบตาม AGENTS.md
 */
export default function PetsPage() {
  redirect('/profile/pets');
}
