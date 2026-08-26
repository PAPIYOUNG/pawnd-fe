import { Metadata } from 'next';
import { getCurrentUser } from '@/services/user.service';
import { getMyPets } from '@/services/pet.service';
import { UserProfileHeader } from './_components/user-profile-header';
import { UserProfileDetailsGrid } from './_components/user-profile-details-grid';
import { UserMyPetsGrid } from './_components/user-my-pets-grid';
import { EditProfileModal } from './_components/edit-profile-modal';

export const metadata: Metadata = {
  title: 'โปรไฟล์ของฉัน | PAWND',
  description: 'ภาพรวมบัญชีผู้ใช้และสัตว์เลี้ยงของคุณ',
};

/**
 * ProfileOverviewPage (Server Component - RSC)
 * - หน้าภาพรวมโปรไฟล์ผู้ใช้งาน (User Profile Overview)
 * - ดึงข้อมูลจริงจาก Backend: โปรไฟล์ผู้ใช้และสัตว์เลี้ยง
 * - แสดงข้อมูลผู้ใช้และรายการสัตว์เลี้ยงของฉัน (การ์ดสถิติสรุปและประวัติประกาศตามหาย้ายไปอยู่ที่หน้าแดชบอร์ดแทน)
 */
export default async function ProfileOverviewPage() {
  const [user, myPets] = await Promise.all([
    getCurrentUser(),
    getMyPets(),
  ]);

  // ใช้ข้อมูลจริงจาก Backend หรือ fallback ไปที่ mock ถ้าไม่มีข้อมูล
  const pets = myPets.length > 0 ? myPets : user.pets;

  return (
    <div className="flex flex-col gap-8">
      {/* 1. การ์ดโปรไฟล์ผู้ใช้: รวมข้อมูลผู้ใช้ด้านบน + กรอบข้อมูลบัญชีทุกฟิลด์ + ปุ่มแก้ไขโปรไฟล์ไว้ในกรอบเดียวกัน */}
      <div className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-card p-4 shadow-sm sm:p-7 dark:border-border/60">
        <UserProfileHeader user={user} />

        <UserProfileDetailsGrid user={user} />

        {/* ปุ่มแก้ไขโปรไฟล์ อยู่ด้านล่างสุดของกรอบ (พร้อม Modal ฟอร์มแก้ไข) */}
        <div className="flex justify-end border-t border-border/60 pt-5">
          <EditProfileModal user={user} />
        </div>
      </div>

      {/* 2. ส่วนสัตว์เลี้ยงของฉัน */}
      <UserMyPetsGrid pets={pets} />
    </div>
  );
}
