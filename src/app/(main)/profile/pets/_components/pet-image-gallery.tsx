'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Trash2,
  CheckCircle2,
  Star,
  Image as ImageIcon,
  AlertCircle,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PetImage } from '@/types/pet';
import { cn } from '@/lib/utils';

interface PetImageGalleryProps {
  images: PetImage[];
  profileImageUrl?: string | null;
  maxImages?: number;
  onUploadImages?: (files: FileList) => void;
  onSetProfileImage?: (imageId: string) => void;
  onDeleteImage?: (imageId: string) => void;
  readOnly?: boolean;
}

/**
 * PetImageGallery Component (Client Component)
 * - คอมโพเนนต์จัดการแกลเลอรีรูปภาพสัตว์เลี้ยงตามกฎของ Backend (pawnd-be-template):
 *   1. โควต้ารูปภาพสูงสุด 3 รูปต่อสัตว์เลี้ยงหนึ่งตัว (Max 3 Images per Pet)
 *   2. รองรับไฟล์ JPEG, PNG, WEBP ขนาดไม่เกิน 5MB
 *   3. กำหนดรูปภาพโปรไฟล์หลักได้ (Set Profile Image)
 *   4. ลบรูปภาพเดี่ยวได้ (Delete Image) พร้อมเลื่อนรูปถัดไปเป็นรูปหลักอัตโนมัติ
 */
export function PetImageGallery({
  images,
  profileImageUrl,
  maxImages = 3,
  onUploadImages,
  onSetProfileImage,
  onDeleteImage,
  readOnly = false,
}: PetImageGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentCount = images.length;
  const canUploadMore = currentCount < maxImages && !readOnly;

  // ตรวจสอบไฟล์และส่งต่อให้อัปโหลด
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);

    // ตรวจสอบจำนวนไฟล์ที่เลือกไม่เกินโควต้าที่เหลือ
    if (currentCount + files.length > maxImages) {
      setErrorMessage(
        `สามารถอัปโหลดได้สูงสุด ${maxImages} รูป (ปัจจุบันมี ${currentCount} รูปแล้ว)`
      );
      return;
    }

    // ตรวจสอบขนาดและชนิดไฟล์
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrorMessage('รองรับเฉพาะไฟล์รูปภาพ JPG, PNG หรือ WEBP เท่านั้น');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`ไฟล์ ${file.name} มีขนาดเกิน 5MB`);
        return;
      }
    }

    if (onUploadImages) {
      onUploadImages(files);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ส่วนหัวแสดงโควต้ารูปภาพและกฎเกณฑ์ */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-foreground">
          รูปภาพสัตว์เลี้ยง ({currentCount}/{maxImages} รูป)
        </Label>
        <span className="text-[11px] text-muted-foreground">
          JPG, PNG, WEBP (สูงสุด 5MB ต่อรูป)
        </span>
      </div>

      {/* ข้อความแจ้งเตือน Error */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid แสดงรูปภาพและปุ่มอัปโหลด */}
      <div className="grid grid-cols-3 gap-3">
        {/* รูปภาพที่อัปโหลดแล้ว */}
        {images.map((img) => {
          const isMainProfile = img.isProfile || img.imageUrl === profileImageUrl;

          return (
            <div
              key={img.id}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-2xl border-2 bg-muted transition-all',
                isMainProfile
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border/80 hover:border-primary/50'
              )}
            >
              <Image
                src={img.imageUrl}
                alt="รูปสัตว์เลี้ยง"
                fill
                sizes="120px"
                className="object-cover"
              />

              {/* ป้ายกำกับรูปโปรไฟล์หลัก */}
              {isMainProfile ? (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[9px] font-bold text-primary-foreground shadow-xs">
                  <Star className="size-2.5 fill-current" />
                  <span>รูปหลัก</span>
                </div>
              ) : null}

              {/* เมนู Action เมื่อ Hover บนรูป (ตั้งเป็นรูปหลัก / ลบรูป) */}
              {!readOnly && (
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 backdrop-blur-2xs transition-opacity group-hover:opacity-100">
                  {!isMainProfile && onSetProfileImage && (
                    <button
                      type="button"
                      onClick={() => onSetProfileImage(img.id)}
                      className="flex size-8 items-center justify-center rounded-xl bg-white/90 text-primary shadow-md hover:bg-white active:scale-95"
                      title="ตั้งเป็นรูปโปรไฟล์หลัก"
                    >
                      <Star className="size-4" />
                    </button>
                  )}
                  {onDeleteImage && (
                    <button
                      type="button"
                      onClick={() => onDeleteImage(img.id)}
                      className="flex size-8 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 active:scale-95"
                      title="ลบรูปภาพนี้"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* ช่องกดอัปโหลดรูปภาพใหม่ (ถ้ายังไม่ครบ 3 รูป) */}
        {canUploadMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-2 text-center transition-all hover:border-primary hover:bg-primary/10"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform group-hover:scale-110">
              <Upload className="size-4" />
            </div>
            <span className="mt-1.5 text-[11px] font-bold text-foreground group-hover:text-primary">
              เพิ่มรูป
            </span>
            <span className="text-[9px] text-muted-foreground">
              เหลือ {maxImages - currentCount} รูป
            </span>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
