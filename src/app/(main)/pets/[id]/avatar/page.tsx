import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Wand2, Download, ChevronLeft, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MOCK_PETS } from '@/services/pet.service';

interface PetAvatarPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'สร้างรูปอวตาร AI สัตว์เลี้ยง (Pet AI Avatar) | PAWND',
  description: 'แปลงภาพถ่ายสัตว์เลี้ยงของคุณเป็นรูปภาพอวตาร 3D และการ์ตูนสุดน่ารักด้วย Generative AI',
};

/**
 * PetAvatarGeneratorPage (Server Component - RSC)
 * - หน้าสร้างภาพอวตาร AI สำหรับสัตว์เลี้ยง (Generative AI Pet Avatar)
 * - ตรงตาม Backend ai.controller.ts (POST /ai/generate-pet-avatar)
 */
export default async function PetAvatarGeneratorPage({ params }: PetAvatarPageProps) {
  const { id } = await params;
  const pet = MOCK_PETS[0];

  const MOCK_AVATAR_STYLES = [
    { id: '3d-cute', label: '3D Pixar Cute', img: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=400&auto=format&fit=crop' },
    { id: 'cyberpunk', label: 'Cyberpunk Hero', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop' },
    { id: 'watercolor', label: 'Watercolor Art', img: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=400&auto=format&fit=crop' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        href="/profile/pets"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        <span>กลับหน้าโปรไฟล์สัตว์เลี้ยง</span>
      </Link>

      {/* ส่วนหัว */}
      <div className="flex flex-col gap-2 border-b border-border/60 pb-6">
        <div className="flex items-center gap-2 text-primary">
          <Wand2 className="size-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Generative AI Studio
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          สร้าง AI Avatar สำหรับน้อง {pet.name}
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          เลือกสไตล์ศิลปะเพื่อสร้างภาพโปรไฟล์และภาพโปสเตอร์สุดพิเศษด้วย AI
        </p>
      </div>

      {/* สไตล์ที่มีให้เลือก */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-foreground mb-4">
          เลือกสไตล์รูปภาพ AI
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MOCK_AVATAR_STYLES.map((style) => (
            <div
              key={style.id}
              className="group cursor-pointer overflow-hidden rounded-3xl border-2 border-border/80 bg-card p-3 shadow-sm transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
                <Image src={style.img} alt={style.label} fill className="object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="p-3 text-center">
                <span className="font-bold text-sm text-foreground group-hover:text-primary">
                  {style.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button className="h-12 gap-2 rounded-2xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90">
            <Sparkles className="size-5" />
            <span>สร้างภาพ Avatar ทันที</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
