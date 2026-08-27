import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Phone,
  MessageCircle,
  ChevronLeft,
  AlertTriangle,
  QrCode,
} from 'lucide-react';

import { getPublicPetProfile } from '@/services/pet.service';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PublicPetPageProps {
  params: Promise<{ qrToken: string }>;
}

export async function generateMetadata({
  params,
}: PublicPetPageProps): Promise<Metadata> {
  const { qrToken } = await params;
  return {
    title: `โปรไฟล์สัตว์เลี้ยง Smart QR Tag (${qrToken}) | PAWND`,
    description: 'ข้อมูลประจำตัวสัตว์เลี้ยงและช่องทางติดต่อเจ้าของฉุกเฉิน',
  };
}

/**
 * PublicPetProfilePage (Server Component - RSC)
 * - หน้าโปรไฟล์สาธารณะที่เปิดขึ้นทันทีเมื่อมีผู้สแกน Smart QR Tag บนปลอกคอสัตว์เลี้ยง
 * - ดึงข้อมูลจริงจาก Backend ผ่าน GET /pets/public/qr/:qrToken (Public endpoint ไม่ต้อง login)
 * - แสดงข้อมูลสัตว์เลี้ยง รูปถ่าย และปุ่มติดต่อเจ้าของฉุกเฉิน (โทรออก, LINE)
 * - หาก QR Token ไม่ถูกต้องหรือถูกปิดใช้งาน จะแสดง Empty State แทน
 */
export default async function PublicPetProfilePage({ params }: PublicPetPageProps) {
  const { qrToken } = await params;
  const pet = await getPublicPetProfile(qrToken);

  // Empty State: ไม่พบสัตว์เลี้ยงจาก QR Token นี้ หรือ QR Code ถูกปิดใช้งานไปแล้ว
  if (!pet) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:py-24">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <QrCode className="size-8" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-foreground">
          ไม่พบข้อมูลสัตว์เลี้ยง
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Smart QR Tag นี้อาจไม่ถูกต้อง หรือถูกปิดใช้งานโดยเจ้าของแล้ว
        </p>
        <Link href="/" className={cn(buttonVariants({ variant: 'default' }), 'mt-6 rounded-2xl')}>
          กลับหน้าหลัก PAWND
        </Link>
      </div>
    );
  }

  const typeLabel = pet.type === 'DOG' ? 'สุนัข' : pet.type === 'CAT' ? 'แมว' : 'สัตว์เลี้ยง';
  const genderLabel =
    pet.gender === 'MALE' ? 'เพศผู้' : pet.gender === 'FEMALE' ? 'เพศเมีย' : 'ไม่ระบุเพศ';
  const displayImageUrl =
    pet.profileImageUrl ||
    pet.images[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=800&auto=format&fit=crop';

  const { ownerContact } = pet;
  const hasContact = Boolean(ownerContact.phone || ownerContact.lineId);

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      {/* 1. ปุ่มย้อนกลับไปหน้าแรก */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="size-4" />
          <span>กลับหน้าหลัก PAWND</span>
        </Link>
      </div>

      {/* 2. การ์ดแจ้งเตือนฉุกเฉินกรณีสัตว์เลี้ยงพลัดหลง */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
          <AlertTriangle className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm">พบเห็นน้อง {pet.name} ใช่หรือไม่?</span>
          <p className="text-xs text-muted-foreground">
            หากคุณพบเห็นสัตว์เลี้ยงตัวนี้ กรุณาติดต่อเจ้าของผ่านปุ่มด้านล่างทันที
          </p>
        </div>
      </div>

      {/* 3. การ์ดข้อมูลประจำตัวสัตว์เลี้ยง */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg dark:border-border/60">
        {/* รูปถ่ายสัตว์เลี้ยง */}
        <div className="relative h-64 w-full overflow-hidden bg-muted sm:h-72">
          <Image
            src={displayImageUrl}
            alt={pet.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold shadow-xs">
              Smart QR Collar Tag
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {pet.name}
            </h1>
            <p className="text-xs text-white/90 sm:text-sm">
              {typeLabel}
              {pet.breed ? ` • ${pet.breed}` : ''}
            </p>
          </div>
        </div>

        {/* รายละเอียดเพิ่มเติม */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-muted/50 p-3">
              <span className="text-xs text-muted-foreground">เพศ</span>
              <p className="font-bold text-foreground">{genderLabel}</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-3">
              <span className="text-xs text-muted-foreground">สี / ลวดลาย</span>
              <p className="font-bold text-foreground">{pet.color || 'ไม่ระบุ'}</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-3">
              <span className="text-xs text-muted-foreground">อายุ</span>
              <p className="font-bold text-foreground">
                {pet.age !== null ? `${pet.age} ปี` : 'ไม่ระบุ'}
              </p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-3">
              <span className="text-xs text-muted-foreground">เจ้าของ</span>
              <p className="line-clamp-1 font-bold text-foreground">
                {ownerContact.name || 'ไม่ระบุ'}
              </p>
            </div>
          </div>

          {pet.distinctiveFeatures && (
            <div className="mt-4 rounded-2xl bg-muted/30 p-3.5">
              <span className="text-xs font-bold text-foreground">ลักษณะเด่น / ข้อสังเกต:</span>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {pet.distinctiveFeatures}
              </p>
            </div>
          )}

          {/* 4. ปุ่มติดต่อเจ้าของด่วน */}
          <div className="mt-6 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-foreground">
              ช่องทางติดต่อเจ้าของฉุกเฉิน
            </h3>

            {ownerContact.phone && (
              <a
                href={`tel:${ownerContact.phone}`}
                className={cn(
                  buttonVariants({ variant: 'default', size: 'lg' }),
                  'h-12 w-full gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md hover:bg-primary/90'
                )}
              >
                <Phone className="size-5" />
                <span>โทรหาเจ้าของทันที ({ownerContact.phone})</span>
              </a>
            )}

            {ownerContact.lineId && (
              <a
                href={`https://line.me/ti/p/~${ownerContact.lineId}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#06C755] font-bold text-white shadow-md transition-colors hover:bg-[#05b34c]"
              >
                <MessageCircle className="size-5" />
                <span>แชทผ่าน LINE กับเจ้าของ</span>
              </a>
            )}

            {!hasContact && (
              <p className="text-center text-xs text-muted-foreground">
                เจ้าของยังไม่ได้เปิดเผยช่องทางติดต่อสาธารณะ
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
