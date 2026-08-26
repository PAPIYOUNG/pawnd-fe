import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Wand2, ChevronLeft, QrCode } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getPetById } from '@/services/pet.service';
import { AvatarGeneratorCard } from './_components/avatar-generator-card';


interface PetAvatarPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'สร้างรูปอวตาร AI สัตว์เลี้ยง (Pet AI Avatar) | PAWND',
  description: 'แปลงภาพถ่ายสัตว์เลี้ยงของคุณเป็นรูปภาพอวตาร 3D และการ์ตูนสุดน่ารักด้วย Generative AI',
};

/**
 * PetAvatarGeneratorPage (Server Component - RSC)
 * - หน้ารายละเอียดสัตว์เลี้ยงและสร้างภาพอวตาร AI (Pet Detail & Generative AI Avatar)
 * - แสดงกล่องข้อมูลสัตว์เลี้ยงจริงที่ดึงจาก Backend (getPetById)
 * - มีส่วน Generative AI Studio ด้านล่างสำหรับเลือกสไตล์ภาพอวตาร
 */
export default async function PetAvatarGeneratorPage({ params }: PetAvatarPageProps) {
  const { id } = await params;
  const pet = await getPetById(id);

  if (!pet) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-foreground">ไม่พบข้อมูลสัตว์เลี้ยง</h2>
        <p className="mt-1 text-sm text-muted-foreground">สัตว์เลี้ยงนี้อาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <Link href="/profile/pets" className="mt-4 inline-block">
          <Button className="rounded-2xl bg-primary">กลับหน้าโปรไฟล์สัตว์เลี้ยง</Button>
        </Link>
      </div>
    );
  }

  return (

    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        href="/profile/pets"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft className="size-4" />
        <span>กลับหน้าโปรไฟล์สัตว์เลี้ยง</span>
      </Link>

      {/* 1. ส่วนหัว */}
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

      {/* 2. กล่องข้อมูลสรุปของสัตว์เลี้ยง (รูปภาพซ้าย + ข้อมูลขวา ตามที่ผู้ใช้ระบุ) */}
      <div className="mt-6 flex flex-col md:flex-row overflow-hidden rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm gap-6">
        {/* รูปภาพสัตว์เลี้ยงขนาดใหญ่ทางซ้าย */}
        <div className="relative aspect-square w-full md:w-64 shrink-0 overflow-hidden rounded-2xl bg-muted">
          <Image
            src={
              pet.profileImageUrl ||
              pet.coverImageUrl ||
              (pet.type === 'DOG'
                ? 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=600&auto=format&fit=crop')
            }
            alt={`ภาพของ ${pet.name}`}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
              {pet.type === 'DOG' ? 'สุนัข' : pet.type === 'CAT' ? 'แมว' : 'สัตว์เลี้ยง'}
            </span>
          </div>
          {pet.age !== undefined && pet.age !== null && (
            <div className="absolute top-3 right-3">
              <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-primary-foreground shadow-xs backdrop-blur-xs">
                อายุ {pet.age} ปี
              </span>
            </div>
          )}
        </div>

        {/* ข้อมูลรายละเอียดทางขวา */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {pet.name}
              </h2>
              {pet.qrCode && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <QrCode className="size-3.5" />
                  <span>Smart QR Active</span>
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              {pet.breed || 'ไม่ระบุสายพันธุ์'}
            </p>

            {/* ตารางข้อมูลคุณลักษณะ 3 กล่อง */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-muted/40 p-3">
                <span className="text-[11px] font-semibold text-muted-foreground">เพศ</span>
                <p className="mt-0.5 text-sm font-bold text-foreground">
                  {pet.gender === 'MALE' ? 'เพศผู้' : pet.gender === 'FEMALE' ? 'เพศเมีย' : 'ไม่ระบุ'}
                </p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-3">
                <span className="text-[11px] font-semibold text-muted-foreground">สีขน</span>
                <p className="mt-0.5 text-sm font-bold text-foreground">
                  {pet.color || 'ไม่ระบุสี'}
                </p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-3 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-muted-foreground">อายุ</span>
                <p className="mt-0.5 text-sm font-bold text-foreground">
                  {pet.age ? `${pet.age} ปี` : 'ไม่ระบุ'}
                </p>
              </div>
            </div>

            {/* ลักษณะเด่น */}
            {pet.distinctiveFeatures && (
              <div className="mt-3.5 rounded-2xl border border-border/60 bg-background/50 p-3">
                <span className="text-xs font-bold text-primary">ลักษณะเด่น: </span>
                <span className="text-xs text-foreground/90">{pet.distinctiveFeatures}</span>
              </div>
            )}

            {/* คำอธิบายเพิ่มเติม */}
            {pet.description && (
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {pet.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. ส่วน Avatar AI Generate (Interactive Client Component เชื่อมต่อ Backend) */}
      <AvatarGeneratorCard pet={pet} />


    </div>
  );
}

