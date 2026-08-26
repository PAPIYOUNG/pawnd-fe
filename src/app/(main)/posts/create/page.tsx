import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import { CreatePostForm } from './_components/create-post-form';

export const metadata: Metadata = {
  title: 'สร้างประกาศ | PAWND',
  description: 'สร้างประกาศสัตว์เลี้ยงหายหรือพบสัตว์เลี้ยง',
};

/** ป้องกันหน้า create ที่ Server เพื่อไม่ให้ผู้ใช้ที่ยังไม่ Login ส่งประกาศ */
export default async function CreatePostPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-7">
        <p className="text-sm font-medium text-primary">สร้างประกาศจริง</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          แจ้งสัตว์เลี้ยงหายหรือพบเห็น
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ประกาศนี้จะบันทึกลงระบบและใช้เป็นจุดเริ่มต้นสำหรับทดสอบแชท
        </p>
      </div>

      <CreatePostForm />
    </main>
  );
}
