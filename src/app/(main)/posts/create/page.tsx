import { Metadata } from 'next';
import { getCurrentUser } from '@/services/user.service';
import { getMyPets } from '@/services/pet.service';
import { PostSidebar } from '@/components/layout/PostSidebar';
import { CreatePostForm } from './_components/create-post-form';

export const metadata: Metadata = {
  title: 'แจ้งสัตว์เลี้ยงหาย | PAWND',
  description: 'สร้างประกาศตามหาสัตว์เลี้ยงหายพร้อมระบบ AI Smart Matching',
};

/**
 * CreatePostPage (Server Component - RSC)
 * - หน้าสร้างประกาศแจ้งสัตว์เลี้ยงหาย (Report Lost Pet Page) ตรงตาม UI ต้นแบบในภาพ
 * - ฝั่งซ้าย: PostSidebar เมนูนำทางพอร์ทัลพร้อมแบนเนอร์ระบบ AI Matching
 * - ฝั่งขวา: CreatePostForm ฟอร์มกรอกข้อมูลสัตว์เลี้ยงพร้อม AI Assistant
 */
export default async function CreatePostPage() {
  const [user, pets] = await Promise.all([getCurrentUser(), getMyPets()]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col md:flex-row">
      {/* 1. Sidebar ด้านซ้าย */}
      <PostSidebar user={user} />

      {/* 2. เนื้อหาหลักสร้างประกาศด้านขวา */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-10">
        <CreatePostForm initialPets={pets} />
      </main>
    </div>
  );
}
