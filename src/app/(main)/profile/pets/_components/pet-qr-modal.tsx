'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  QrCode,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Shield,
  Heart,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PetProfile } from '@/types/pet';

interface PetQrModalProps {
  pet: PetProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * PetQrModal Component (Client Component)
 * - Modal แสดง QR Code และข้อมูลประจำตัวสัตว์เลี้ยงสำหรับทำป้ายปลอกคอ (Smart QR Collar Tag)
 * - มีฟังก์ชันคัดลอกลิงก์โปรไฟล์สาธารณะ (Copy Public Link)
 * - มีฟังก์ชันดาวน์โหลดไฟล์ภาพ QR Code และจำลองสร้างโปสเตอร์ PDF (ตาม Backend pet-profile-pdf.generator)
 */
export function PetQrModal({ pet, isOpen, onClose }: PetQrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !pet) return null;

  const publicUrl = pet.qrCode?.publicProfileUrl || `https://pawnd.co/p/${pet.id}`;
  // สร้าง QR Code Image URL ผ่าน standard qr service
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    publicUrl
  )}&color=16-78-54&bgcolor=255-255-255`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl transition-all sm:p-7 dark:border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ปุ่มปิด Modal มุมบนขวา */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="ปิดหน้าต่าง QR Code"
        >
          <X className="size-5" />
        </button>

        {/* 1. ส่วนหัวของ Modal */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <QrCode className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground sm:text-xl">
              QR Code ประจำตัว {pet.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Smart QR Tag สำหรับติดปลอกคอตามหาสัตว์เลี้ยง
            </p>
          </div>
        </div>

        {/* 2. กล่องแสดง QR Code พร้อมกรอบตกแต่ง */}
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-border/60 bg-muted/40 p-6 text-center">
          <div className="relative size-44 overflow-hidden rounded-2xl border border-border/80 bg-white p-3 shadow-md">
            <Image
              src={qrImageUrl}
              alt={`QR Code ของ ${pet.name}`}
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Shield className="size-3.5" />
            สถานะ: ใช้งานได้ทันที (Active Tag)
          </span>

          <p className="mt-2 text-xs text-muted-foreground">
            เมื่อมีผู้พบเห็นสแกน QR Code นี้ จะเปิดหน้าโปรไฟล์เพื่อติดต่อเจ้าของได้ทันที
          </p>
        </div>

        {/* 3. กล่องคัดลอกลิงก์โปรไฟล์สาธารณะ */}
        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-background px-3 py-2">
          <span className="truncate text-xs text-muted-foreground font-mono">
            {publicUrl}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 gap-1 rounded-lg px-2.5 text-xs font-semibold"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-emerald-500">คัดลอกแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>คัดลอก</span>
              </>
            )}
          </Button>
        </div>

        {/* 4. ปุ่ม Action ด้านล่าง (ดาวน์โหลดรูป / ดาวน์โหลด PDF) */}
        <div className="mt-6 flex gap-3">
          <a
            href={qrImageUrl}
            download={`pawnd-qr-${pet.name}.png`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/80 bg-muted/60 py-3 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
          >
            <Download className="size-4 text-primary" />
            <span>ดาวน์โหลดภาพ QR</span>
          </a>
          <Button
            type="button"
            onClick={() => alert(`กำลังสร้างเอกสาร PDF ป้ายปลอกคอของ ${pet.name}`)}
            className="flex-1 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105"
          >
            <ExternalLink className="size-4" />
            <span>พิมพ์ป้ายปลอกคอ</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
