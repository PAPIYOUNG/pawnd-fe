'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Plus, Sparkles, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * AiMatchUploadDialog (Client Component)
 * - ปุ่มเปิด Dialog สำหรับอัปโหลดรูปสัตว์เลี้ยงเพื่อค้นหาด้วย AI Smart Matching
 * - รองรับทั้งการคลิกเลือกไฟล์และการลาก-วางไฟล์ (Drag & Drop) ลงในกล่องอัปโหลด
 * - ตอนนี้เป็นเพียง UI เท่านั้น ยังไม่เชื่อมต่อ API ค้นหาจริง
 */
export function AiMatchUploadDialog() {
  // ควบคุมสถานะเปิด/ปิดของ Dialog
  const [open, setOpen] = useState(false);
  // เก็บ URL รูปตัวอย่างที่ผู้ใช้เลือก (สำหรับ Preview เท่านั้น)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // เก็บสถานะกำลังลากไฟล์เข้ามาเหนือกล่องอัปโหลด (ไว้เปลี่ยนสไตล์ Dashed Border)
  const [isDragging, setIsDragging] = useState(false);
  // ข้อความ Error กรณีไฟล์ไม่ผ่านการตรวจสอบเบื้องต้น
  const [error, setError] = useState<string | null>(null);
  // สถานะจำลองตอนกด "ค้นหาด้วย AI-matching" (ยังไม่เชื่อม API จริง)
  const [isSearching, setIsSearching] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ตรวจสอบชนิดไฟล์ก่อนสร้าง Preview URL
  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      setError('รองรับเฉพาะไฟล์ JPEG, PNG หรือ WEBP เท่านั้น');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleRemovePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  // รีเซ็ตสถานะทั้งหมดเมื่อปิด Dialog เพื่อไม่ให้ค้างข้ามการเปิดครั้งถัดไป
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setError(null);
      setIsDragging(false);
      setIsSearching(false);
    }
  };

  // ปุ่มค้นหาด้วย AI-matching (ยังเป็น UI จำลองเท่านั้น ไม่เชื่อม API)
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="h-11 w-full gap-2 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground shadow-md hover:bg-primary/90 sm:w-auto" />
        }
      >
        <Plus className="size-5 stroke-[2.5]" />
        <span>อัพโหลดรูปเผื่อค้นหา</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-5 text-primary" />
            ค้นหาสัตว์เลี้ยงด้วย AI Smart Matching
          </DialogTitle>
          <DialogDescription>
            อัปโหลดรูปสัตว์เลี้ยงที่พบเห็นหรือกำลังตามหา ระบบ AI
            จะช่วยจับคู่กับประกาศที่ใกล้เคียงที่สุดให้คุณ
          </DialogDescription>
        </DialogHeader>

        {/* กล่องอัปโหลดรูปภาพ / พื้นที่ Drag & Drop */}
        {previewUrl ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border/80 bg-muted">
            <Image
              src={previewUrl}
              alt="รูปตัวอย่างที่เลือกสำหรับค้นหาด้วย AI"
              fill
              sizes="(max-width: 640px) 100vw, 480px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleRemovePreview}
              aria-label="ลบรูปที่เลือก"
              className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border bg-muted/40 text-center transition-colors hover:border-primary/60 hover:bg-muted/70',
              isDragging && 'border-primary bg-primary/5',
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImagePlus className="size-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              คลิกเพื่อเลือกรูป หรือลากไฟล์มาวางที่นี่
            </p>
            <p className="text-xs text-muted-foreground">
              รองรับไฟล์ JPEG, PNG, WEBP
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />

        {error && (
          <p className="text-xs font-semibold text-destructive">{error}</p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="h-10 rounded-2xl"
            onClick={() => handleOpenChange(false)}
          >
            ยกเลิก
          </Button>
          <Button
            className="h-10 gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            disabled={!previewUrl || isSearching}
            onClick={handleSearch}
          >
            {isSearching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            <span>ค้นหาด้วย AI-matching</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
