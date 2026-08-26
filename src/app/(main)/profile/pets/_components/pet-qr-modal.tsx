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
  ShieldOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PetProfile, PetQrCode } from '@/types/pet';
import { generatePetQrAction, deactivatePetQrAction } from '../_actions/pet.actions';

interface PetQrModalProps {
  pet: PetProfile | null;
  isOpen: boolean;
  onClose: () => void;
  // แจ้งกลับไปยัง parent เมื่อสร้าง/ปิดใช้งาน QR Code สำเร็จ เพื่ออัปเดตข้อมูล pet ตัวนั้นใน state ของหน้า
  onQrCodeChange: (petId: string, qrCode: PetQrCode) => void;
}

/**
 * PetQrModal Component (Client Component)
 * - Modal แสดง QR Code และข้อมูลประจำตัวสัตว์เลี้ยงสำหรับทำป้ายปลอกคอ (Smart QR Collar Tag)
 * - สัตว์เลี้ยงที่เพิ่งสร้างใหม่จะยังไม่มี qrCode จึงต้องให้ผู้ใช้กดสร้างเองก่อน (POST /pets/:id/qr)
 * - รองรับปิดใช้งาน QR Code (PATCH /pets/:id/qr/deactivate) และสร้างใหม่เพื่อเปิดใช้งานอีกครั้ง
 * - มีฟังก์ชันคัดลอกลิงก์โปรไฟล์สาธารณะ (Copy Public Link) และดาวน์โหลดไฟล์ภาพ QR Code
 */
export function PetQrModal({ pet, isOpen, onClose, onQrCodeChange }: PetQrModalProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isOpen || !pet) return null;

  const qrCode = pet.qrCode;
  const isBusy = isGenerating || isDeactivating || isDownloadingPdf;

  // สร้าง QR Code Image URL ผ่าน standard qr service (ใช้เมื่อ backend ยังไม่ได้แนบไฟล์ภาพ qrImageUrl มาให้)
  const buildQrImageUrl = (url: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
      url
    )}&color=16-78-54&bgcolor=255-255-255`;

  const publicUrl = qrCode?.publicProfileUrl;
  const qrImageUrl = qrCode?.qrImageUrl || (publicUrl ? buildQrImageUrl(publicUrl) : null);

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // สร้าง QR Code ใหม่ (ใช้ทั้งกรณีสร้างครั้งแรก และกรณีเปิดใช้งานอีกครั้งหลังถูกปิดใช้งาน)
  const handleGenerate = async () => {
    setIsGenerating(true);
    setActionError(null);
    const res = await generatePetQrAction(pet.id);
    if (res.success && res.data) {
      onQrCodeChange(pet.id, res.data);
    } else {
      setActionError(res.error || 'ไม่สามารถสร้าง QR Code ได้');
    }
    setIsGenerating(false);
  };

  // ปิดใช้งาน QR Code ปัจจุบัน
  const handleDeactivate = async () => {
    if (!confirm(`ต้องการปิดใช้งาน QR Code ของ "${pet.name}" ใช่หรือไม่?`)) return;
    setIsDeactivating(true);
    setActionError(null);
    const res = await deactivatePetQrAction(pet.id);
    if (res.success && res.data) {
      onQrCodeChange(pet.id, res.data);
    } else {
      setActionError(res.error || 'ไม่สามารถปิดใช้งาน QR Code ได้');
    }
    setIsDeactivating(false);
  };

  // ดาวน์โหลดไฟล์ PDF ป้ายปลอกคอ ผ่าน route ภายในที่พร็อกซีไปยัง GET /pets/public/qr/:qrToken/pdf
  const handleDownloadPdf = async () => {
    if (!qrCode) return;
    setIsDownloadingPdf(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/pets/qr/${qrCode.qrToken}/pdf`);
      if (!res.ok) throw new Error('ไม่สามารถสร้างไฟล์ PDF ป้ายปลอกคอได้');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `pawnd-collar-tag-${pet.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'ไม่สามารถดาวน์โหลดไฟล์ PDF ได้');
    } finally {
      setIsDownloadingPdf(false);
    }
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

        {/* แจ้งเตือนข้อผิดพลาดจากการสร้าง/ปิดใช้งาน QR Code */}
        {actionError && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {!qrCode ? (
          /* 2ก. สัตว์เลี้ยงตัวนี้ยังไม่มี QR Code — ให้ผู้ใช้กดสร้างเอง */
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <QrCode className="size-7" />
            </div>
            <p className="mt-3 text-sm font-bold text-foreground">
              {pet.name} ยังไม่มี QR Code
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              กดสร้าง QR Code เพื่อรับลิงก์โปรไฟล์สาธารณะสำหรับติดปลอกคอ
            </p>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isBusy}
              className="mt-4 gap-1.5 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground shadow-md"
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <QrCode className="size-4" />
              )}
              <span>สร้าง QR Code</span>
            </Button>
          </div>
        ) : (
          <>
            {/* 2ข. กล่องแสดง QR Code พร้อมกรอบตกแต่ง */}
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-border/60 bg-muted/40 p-6 text-center">
              {qrCode.isActive && qrImageUrl ? (
                <div className="relative size-44 overflow-hidden rounded-2xl border border-border/80 bg-white p-3 shadow-md">
                  <Image
                    src={qrImageUrl}
                    alt={`QR Code ของ ${pet.name}`}
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex size-44 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/60 text-muted-foreground">
                  <ShieldOff className="size-10" />
                </div>
              )}

              {qrCode.isActive ? (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Shield className="size-3.5" />
                  สถานะ: ใช้งานได้ทันที (Active Tag)
                </span>
              ) : (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                  <ShieldOff className="size-3.5" />
                  สถานะ: ปิดใช้งานอยู่ (Inactive)
                </span>
              )}

              <p className="mt-2 text-xs text-muted-foreground">
                {qrCode.isActive
                  ? 'เมื่อมีผู้พบเห็นสแกน QR Code นี้ จะเปิดหน้าโปรไฟล์เพื่อติดต่อเจ้าของได้ทันที'
                  : 'QR Code นี้ถูกปิดใช้งานไว้ สแกนแล้วจะไม่แสดงหน้าโปรไฟล์สาธารณะ กดสร้างใหม่เพื่อเปิดใช้งานอีกครั้ง'}
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

            {/* 4. ปุ่ม Action ด้านล่าง */}
            {qrCode.isActive ? (
              <div className="mt-6 flex gap-3">
                <a
                  href={qrImageUrl ?? undefined}
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
                  onClick={handleDownloadPdf}
                  disabled={isBusy}
                  className="flex-1 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105"
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ExternalLink className="size-4" />
                  )}
                  <span>{isDownloadingPdf ? 'กำลังสร้างไฟล์...' : 'พิมพ์ป้ายปลอกคอ'}</span>
                </Button>
              </div>
            ) : (
              <div className="mt-6">
                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isBusy}
                  className="w-full gap-1.5 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md"
                >
                  {isGenerating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <QrCode className="size-4" />
                  )}
                  <span>เปิดใช้งาน QR Code อีกครั้ง</span>
                </Button>
              </div>
            )}

            {/* ปุ่มปิดใช้งาน QR Code (แสดงเฉพาะตอนที่ Active อยู่) */}
            {qrCode.isActive && (
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isBusy}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                {isDeactivating ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ShieldOff className="size-3.5" />
                )}
                <span>ปิดใช้งาน QR Code</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
