'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  QrCode,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';

import { PetProfile } from '@/types/pet';
import { Button } from '@/components/ui/button';

interface PetCardProps {
  pet: PetProfile;
  onOpenQr: (pet: PetProfile) => void;
  onEdit: (pet: PetProfile) => void;
  onDelete: (petId: string) => void;
}

/**
 * PetCard Component (Client Component)
 * - การ์ดแสดงข้อมูลสัตว์เลี้ยงขนาดกะทัดรัด (Compact Pet Grid Card)
 * - รูปภาพด้านบนขนาดพอเหมาะ ไม่ล้นจอ
 * - ข้อมูล: ชื่อ, ชนิด, สายพันธุ์, เพศ, สี, อายุ และลักษณะเด่น
 * - แถบล่าง: ปุ่มเปิด Smart QR Tag สีเขียว และปุ่ม Action (ดูหน้าสาธารณะ, แก้ไข, ลบ)
 */
export function PetCard({ pet, onOpenQr, onEdit, onDelete }: PetCardProps) {
  const typeLabel = pet.type === 'DOG' ? 'สุนัข' : pet.type === 'CAT' ? 'แมว' : 'สัตว์เลี้ยง';
  const genderLabel = pet.gender === 'MALE' ? 'เพศผู้' : pet.gender === 'FEMALE' ? 'เพศเมีย' : 'ไม่ระบุเพศ';
  const avatarUrl = `/pets/${pet.id}/avatar`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xs transition-all duration-300 hover:border-primary/50 hover:shadow-md">
      {/* ลิงก์ครอบคลุมทั้งรูปภาพและเนื้อหาของการ์ด เพื่อนำทางไปยังหน้า Avatar & รายละเอียด */}
      <Link href={avatarUrl} className="flex flex-1 flex-col cursor-pointer">
        {/* 1. รูปภาพสัตว์เลี้ยงขนาดพอเหมาะ */}
        <div className="relative h-44 w-full overflow-hidden bg-muted">
          <Image
            src={
              pet.coverImageUrl ||
              pet.profileImageUrl ||
              'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=600&auto=format&fit=crop'
            }
            alt={`ภาพของ ${pet.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* ป้ายชนิดสัตว์เลี้ยงมุมซ้ายบน */}
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
              {typeLabel}
            </span>
          </div>

          {/* ป้ายอายุสัตว์เลี้ยงมุมขวาบน */}
          {pet.age !== undefined && pet.age !== null && (
            <div className="absolute top-3 right-3">
              <span className="rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground shadow-xs backdrop-blur-xs">
                อายุ {pet.age} ปี
              </span>
            </div>
          )}
        </div>

        {/* 2. ข้อมูลรายละเอียดของสัตว์เลี้ยง */}
        <div className="flex flex-1 flex-col p-4 sm:p-5 pb-0 sm:pb-0">
          {/* ชื่อและสายพันธุ์ */}
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors sm:text-lg">
              {pet.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {pet.breed || 'ไม่ระบุสายพันธุ์'}
            </p>
          </div>

          {/* คุณลักษณะ (เพศ • สี) */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border/60 pt-2.5">
            <span className="font-semibold text-foreground/90">{genderLabel}</span>
            <span>•</span>
            <span className="truncate">{pet.color || 'ไม่ระบุสี'}</span>
          </div>

          {/* ลักษณะเด่น (ถ้ามี) */}
          {pet.distinctiveFeatures && (
            <p className="mt-1.5 line-clamp-1 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground/80">จุดเด่น: </span>
              {pet.distinctiveFeatures}
            </p>
          )}
        </div>
      </Link>

      {/* แถบล่างสุด: ปุ่ม QR Tag และปุ่มจัดการ (อยู่นอก Link เพื่อป้องกันการกดซ้อน) */}
      <div className="p-4 pt-3 sm:p-5 sm:pt-3">
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          {/* ปุ่มเปิด Smart QR Tag */}
          <Button
            type="button"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQr(pet);
            }}
            className="h-8 gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white shadow-2xs transition-transform hover:scale-105 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <QrCode className="size-3.5 stroke-[2.5]" />
            <span>QR Tag</span>
          </Button>

          {/* ปุ่ม Action: ดูหน้ารายละเอียด (Eye), แก้ไข (Edit), ลบ (Trash) */}
          <div className="flex items-center gap-1">
            <Link
              href={avatarUrl}
              className="flex size-7.5 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
              title="ดูหน้ารายละเอียดและสร้าง Avatar"
            >
              <Eye className="size-3.5" />
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(pet);
              }}
              className="flex size-7.5 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-colors hover:bg-amber-500/20 hover:text-amber-600"
              title="แก้ไขข้อมูลสัตว์เลี้ยง"
            >
              <Edit3 className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(pet.id);
              }}
              className="flex size-7.5 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
              title="ลบข้อมูลสัตว์เลี้ยง"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

