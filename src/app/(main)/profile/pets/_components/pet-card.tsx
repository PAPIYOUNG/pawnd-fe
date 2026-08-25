'use client';

import Image from 'next/image';
import {
  QrCode,
  Eye,
  Edit3,
  Trash2,
  Sparkles,
} from 'lucide-react';

import { PetProfile } from '@/types/pet';
import { cn } from '@/lib/utils';

interface PetCardProps {
  pet: PetProfile;
  onOpenQr: (pet: PetProfile) => void;
  onEdit: (pet: PetProfile) => void;
  onDelete: (petId: string) => void;
}

/**
 * PetCard Component (Client Component)
 * - การ์ดแสดงข้อมูลสัตว์เลี้ยงแบบพาโนรามา (Panoramic Pet Showcase Card) ตรงตามดีไซน์ UI
 * - ปรับสัดส่วน Layout ให้พอดีและสวยงามทั้งบน Mobile และ Desktop
 * - ภาพปกแนวนอนแบบพาโนรามา (Panoramic Cover Image)
 * - รูป Avatar สัตว์เลี้ยงลอยตัวมุมขวาล่างของภาพ
 * - แถบปุ่ม Action: ปุ่ม QR Tag, ปุ่มดูตัวอย่าง (Eye), ปุ่มแก้ไข (Edit), และปุ่มลบ (Trash)
 */
export function PetCard({ pet, onOpenQr, onEdit, onDelete }: PetCardProps) {
  const typeLabel = pet.type === 'DOG' ? 'สุนัข' : pet.type === 'CAT' ? 'แมว' : 'สัตว์เลี้ยง';
  const genderLabel = pet.gender === 'MALE' ? 'เพศผู้' : pet.gender === 'FEMALE' ? 'เพศเมีย' : 'ไม่ระบุเพศ';

  return (
    <div className="group overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:shadow-lg dark:border-border/60">
      {/* 1. ภาพปกแนวนอนแบบพาโนรามา (Panoramic Cover Image) */}
      <div className="relative h-40 w-full overflow-hidden bg-muted/80 sm:h-56 md:h-64">
        <Image
          src={
            pet.coverImageUrl ||
            pet.profileImageUrl ||
            'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1200&auto=format&fit=crop'
          }
          alt={`ภาพของ ${pet.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay ด้านล่างภาพ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* รูป Avatar สัตว์เลี้ยงลอยตัวมุมขวาล่างของภาพ */}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 size-11 sm:size-14 overflow-hidden rounded-2xl border-2 border-white/90 shadow-lg ring-2 ring-black/10 dark:border-card">
          <Image
            src={
              pet.profileImageUrl ||
              'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200&auto=format&fit=crop'
            }
            alt={pet.name}
            fill
            sizes="60px"
            className="object-cover"
          />
        </div>
      </div>

      {/* 2. ข้อมูลรายละเอียดของสัตว์เลี้ยง */}
      <div className="p-4 sm:p-6">
        {/* ชื่อสัตว์เลี้ยงและสายพันธุ์ */}
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-2xl">
            {pet.name}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
            {typeLabel} • {pet.breed || 'ไม่ระบุสายพันธุ์'}
          </p>
        </div>

        {/* คุณลักษณะจำเพาะ (เพศ • สี • อายุ) */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground sm:text-sm">
          <span>{genderLabel}</span>
          <span>•</span>
          <span>{pet.color || 'ไม่ระบุสี'}</span>
          {pet.age !== undefined && pet.age !== null && (
            <>
              <span>•</span>
              <span>{pet.age} ปี</span>
            </>
          )}
        </div>

        {/* ลักษณะเด่น (ถ้ามี) */}
        {pet.distinctiveFeatures && (
          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground/90 sm:text-xs">
            <span className="font-semibold text-foreground">ลักษณะเด่น: </span>
            {pet.distinctiveFeatures}
          </p>
        )}

        {/* 3. แถบเครื่องมือและปุ่ม Action ด้านล่างการ์ด */}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5 sm:mt-5 sm:pt-4">
          {/* ฝั่งซ้าย: ปุ่มเปิด QR Code Tag */}
          <button
            type="button"
            onClick={() => onOpenQr(pet)}
            className="flex min-h-[38px] items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-500/20 active:scale-95 dark:text-emerald-400"
            title="ดู QR Code ประจำตัว"
          >
            <QrCode className="size-4" />
            <span>QR Tag</span>
          </button>

          {/* ฝั่งขวา: ปุ่มดูตัวอย่าง, ปุ่มแก้ไข, ปุ่มลบ */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* ปุ่มดูรายละเอียดโปรไฟล์ (View) */}
            <button
              type="button"
              onClick={() => onOpenQr(pet)}
              className="flex size-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
              aria-label="ดูรายละเอียดโปรไฟล์"
              title="ดูโปรไฟล์สาธารณะ"
            >
              <Eye className="size-4" />
            </button>

            {/* ปุ่มแก้ไขข้อมูล (Edit) */}
            <button
              type="button"
              onClick={() => onEdit(pet)}
              className="flex size-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
              aria-label="แก้ไขข้อมูลสัตว์เลี้ยง"
              title="แก้ไขข้อมูล"
            >
              <Edit3 className="size-4" />
            </button>

            {/* ปุ่มลบสัตว์เลี้ยง (Delete) */}
            <button
              type="button"
              onClick={() => onDelete(pet.id)}
              className="flex size-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-xl border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10 active:scale-95"
              aria-label="ลบข้อมูลสัตว์เลี้ยง"
              title="ลบข้อมูล"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
