import { Metadata } from 'next';
import { MOCK_PETS } from '@/services/pet.service';
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
 * - เชื่อมต่อกับ Backend flyer.controller.ts (GET /posts/:id/flyer & download)
 * - มีทั้งเทมเพลตสไตล์ WANTED วันพีซ และ STANDARD ทางการ พร้อมแท็บฉีกเบอร์โทร
 */
export default async function PostFlyerPage({ params }: FlyerPageProps) {
  const { id } = await params;
  const pet = MOCK_PETS[0];

  const postData = {
    id,
    type: 'LOST' as const,
    petName: pet?.name || 'น้องส้มส้ม',
    petType: 'แมว',
    breed: pet?.breed || 'แมวไทย (สลิด)',
    gender: pet?.gender || 'FEMALE',
    color: pet?.color || 'สีส้มสลับขาว',
    distinctiveFeatures:
      pet?.distinctiveFeatures ||
      'น้องค่อนข้างเชื่อง กลัวคนแปลกหน้าเล็กน้อย มีปลอกคอสีแดงพร้อมกระดิ่งสีเงิน ชอบนอนตามพุ่มไม้เตี้ยๆ',
    locationDescription: 'เขตลาดพร้าว, กรุงเทพมหานคร',
    eventDate: '12 ตุลาคม 2568',
    rewardAmount: '5000',
    contactPhone: '089-123-4567',
    contactLineId: '@pawnd_official',
    petImageUrl:
      pet?.coverImageUrl ||
      pet?.profileImageUrl ||
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=800&auto=format&fit=crop',
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <FlyerGeneratorView postId={id} postData={postData} />
    </div>
  );
}
