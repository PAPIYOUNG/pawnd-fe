import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostById } from '@/services/post.service';
import { FlyerGeneratorView } from './_components/flyer-generator-view';

interface FlyerPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'ใบปลิวตามหาสัตว์เลี้ยง (Lost Pet Flyer) | PAWND',
  description: 'สร้างและดาวน์โหลดโปสเตอร์ใบปลิวตามหาสัตว์เลี้ยงพร้อม QR Code สไตล์ One Piece Bounty และ Standard',
};

/**
 * PostFlyerPage (Server Component - RSC)
 * - หน้าสร้างและดูตัวอย่างใบปลิวตามหาสัตว์เลี้ยง (Flyer Generator & PDF Download)
 * - ดึงข้อมูลประกาศจริงจาก Backend ผ่าน getPostById(id)
 * - ส่งต่อข้อมูลให้ FlyerGeneratorView สำหรับแสดงผลตัวอย่างจากไฟล์ PDF จริง
 */
export default async function PostFlyerPage({ params }: FlyerPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <FlyerGeneratorView postId={id} post={post} />
    </div>
  );
}

