import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Printer,
  Download,
  Share2,
  ChevronLeft,
  Phone,
  QrCode,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MOCK_PETS } from '@/services/pet.service';

interface FlyerPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'ใบปลิวตามหาสัตว์เลี้ยง (Lost Pet Flyer) | PAWND',
  description: 'สร้างและดาวน์โหลดโปสเตอร์ใบปลิวตามหาสัตว์เลี้ยงพร้อม QR Code',
};

/**
 * PostFlyerPage (Server Component - RSC)
 * - หน้าสร้างและดูตัวอย่างใบปลิวตามหาสัตว์เลี้ยง (Flyer Generator & PDF Download)
 * - ตรงตาม Backend flyer.controller.ts (GET /posts/:id/flyer & download)
 */
export default async function PostFlyerPage({ params }: FlyerPageProps) {
  const { id } = await params;
  const pet = MOCK_PETS[0];

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://pawnd.co/posts/${id}&color=0-0-0&bgcolor=255-255-255`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      {/* ปุ่มย้อนกลับและ Action ด้านบน */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="size-4" />
          <span>กลับหน้ารวมประกาศ</span>
        </Link>

        {/* ปุ่มดาวน์โหลด & พิมพ์ */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-2xl text-xs font-semibold">
            <Share2 className="size-3.5" />
            <span>แชร์</span>
          </Button>
          <Button size="sm" className="gap-1.5 rounded-2xl bg-primary text-xs font-semibold text-primary-foreground shadow-md">
            <Download className="size-3.5" />
            <span>ดาวน์โหลด PDF ใบปลิว</span>
          </Button>
        </div>
      </div>

      {/* ใบปลิวตัวอย่าง (Flyer Preview Container) */}
      <div className="mt-8 overflow-hidden rounded-3xl border-4 border-destructive bg-white p-6 text-black shadow-2xl sm:p-10">
        {/* หัวใบปลิว */}
        <div className="rounded-2xl bg-destructive py-4 text-center text-white">
          <h1 className="text-3xl font-black uppercase tracking-wider sm:text-5xl">
            ตามหาสัตว์เลี้ยงหาย
          </h1>
          <p className="mt-1 text-sm font-bold tracking-widest sm:text-lg">
            LOST PET • มีเงินรางวัลตอบแทน
          </p>
        </div>

        {/* ภาพสัตว์เลี้ยงขนาดใหญ่ */}
        <div className="relative mt-6 h-64 w-full overflow-hidden rounded-2xl border-2 border-black/20 bg-muted sm:h-96">
          <Image
            src={pet.coverImageUrl || pet.profileImageUrl || ''}
            alt={pet.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* ข้อมูลสัตว์เลี้ยง */}
        <div className="mt-6 flex flex-col gap-3 text-center">
          <h2 className="text-3xl font-black text-black sm:text-4xl">
            ชื่อน้อง &quot;{pet.name}&quot;
          </h2>
          <p className="text-base font-bold text-neutral-800 sm:text-xl">
            สายพันธุ์: {pet.breed} • เพศ: {pet.gender === 'FEMALE' ? 'เมีย' : 'ผู้'} • สี: {pet.color}
          </p>
          <p className="text-sm font-semibold text-neutral-600 sm:text-base">
            หายบริเวณ: พญาไท, กรุงเทพฯ เมื่อ 12 ต.ค. 2026
          </p>
        </div>

        {/* QR Code และข้อมูลติดต่อ */}
        <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-2xl border-2 border-black/30 bg-neutral-100 p-6 sm:flex-row">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-destructive uppercase tracking-wide">
              หากพบเห็นหรือมีเบาะแส กรุณาติดต่อทันที
            </span>
            <span className="mt-1 text-2xl font-black text-black sm:text-3xl">
              📞 081-234-XXXX
            </span>
            <span className="mt-0.5 text-sm font-bold text-neutral-700">
              LINE ID: @somchai_pets
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative size-24 overflow-hidden rounded-xl border border-black/30 bg-white p-1">
              <Image src={qrImageUrl} alt="QR Code" fill className="object-contain" unoptimized />
            </div>
            <span className="mt-1 text-[10px] font-bold text-neutral-600">
              สแกนดูพิกัด & ข้อมูล
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
