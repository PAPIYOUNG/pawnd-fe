'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Download,
  Printer,
  Share2,
  ChevronLeft,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FlyerTemplate, getFlyerDownloadUrl } from '@/services/flyer.service';

interface FlyerGeneratorViewProps {
  postId: string;
  postData: {
    id: string;
    type: 'LOST' | 'FOUND';
    petName: string;
    petType: string;
    breed: string;
    gender: string;
    color: string;
    distinctiveFeatures: string;
    locationDescription: string;
    eventDate: string;
    rewardAmount?: string | number | null;
    contactPhone: string;
    contactLineId?: string;
    petImageUrl: string;
  };
}

/**
 * FlyerGeneratorView Component (Client Component)
 * - คอมโพเนนต์แสดงผลและจัดการใบปลิวตามหาสัตว์เลี้ยงแบบ Interactive
 * - ตรงตามเทมเพลตและโค้ดของหลังบ้าน (FlyerPdfGenerator ใน pawnd-be-template):
 *   1. เทมเพลต "WANTED" (Bounty Poster โทนสีกระดาษโบราณยอดฮิต)
 *   2. เทมเพลต "STANDARD" (สไตล์ทางการพร้อมแท็บเบอร์โทรฉีกด้านล่าง)
 * - มีปุ่มดาวน์โหลดไฟล์ PDF โดยตรงจาก Backend API (`GET /posts/:id/flyer/download`)
 * - รองรับคำสั่งพิมพ์ผ่านบราวเซอร์ (Window Print) และการแชร์
 */
export function FlyerGeneratorView({ postId, postData }: FlyerGeneratorViewProps) {
  // State เลือกเทมเพลตใบปลิว (WANTED หรือ STANDARD)
  const [template, setTemplate] = useState<FlyerTemplate>('WANTED');
  const [isCopied, setIsCopied] = useState(false);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://pawnd.app/posts/${postId}&color=0-0-0&bgcolor=255-255-255`;
  const isLost = postData.type === 'LOST';

  // ฟังก์ชันดาวน์โหลด PDF จาก Backend
  const handleDownloadPdf = () => {
    const downloadUrl = getFlyerDownloadUrl(postId);
    window.open(downloadUrl, '_blank');
  };

  // ฟังก์ชันสั่งพิมพ์
  const handlePrint = () => {
    window.print();
  };

  // ฟังก์ชันแชร์ลิงก์
  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ใบปลิวตามหา ${postData.petName} | PAWND`,
          text: `ช่วยตามหาน้อง ${postData.petName} สัตว์เลี้ยงหาย`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. แถบควบคุมด้านบน (Navigation & Template Switcher) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-5">
        <Link
          href={`/posts`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          <span>กลับหน้ารวมประกาศ</span>
        </Link>

        {/* ตัวเลือกสลับเทมเพลต (Template Switcher) */}
        <div className="flex items-center gap-2 rounded-2xl bg-muted/60 p-1 border border-border/80">
          <button
            type="button"
            onClick={() => setTemplate('WANTED')}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all',
              template === 'WANTED'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Sparkles className="size-3.5 text-amber-600" />
            <span>สไตล์ WANTED (วันพีซ)</span>
          </button>

          <button
            type="button"
            onClick={() => setTemplate('STANDARD')}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all',
              template === 'STANDARD'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Layers className="size-3.5 text-primary" />
            <span>สไตล์ มาตรฐาน (พร้อมแท็บฉีก)</span>
          </button>
        </div>

        {/* ปุ่ม Action (แชร์, พิมพ์, ดาวน์โหลด PDF) */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 rounded-2xl text-xs font-semibold"
          >
            {isCopied ? <Check className="size-3.5 text-emerald-600" /> : <Share2 className="size-3.5" />}
            <span>{isCopied ? 'คัดลอกแล้ว' : 'แชร์'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 rounded-2xl text-xs font-semibold"
          >
            <Printer className="size-3.5" />
            <span>พิมพ์</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleDownloadPdf}
            className="gap-1.5 rounded-2xl bg-emerald-800 text-xs font-bold text-white shadow-md hover:bg-emerald-900"
          >
            <Download className="size-3.5" />
            <span>ดาวน์โหลด PDF ใบปลิว</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. แสดงตัวอย่างใบปลิวตามเทมเพลตของหลังบ้าน */}
      {/* ========================================================================= */}
      <div className="flex justify-center print:m-0 print:p-0">
        {/* ----------------------------------------------------------------------- */}
        {/* TEMPLATE 1: WANTED STYLE (ตาม FlyerPdfGenerator WANTED ใน Backend)     */}
        {/* ----------------------------------------------------------------------- */}
        {template === 'WANTED' && (
          <div className="relative w-full max-w-[620px] rounded-3xl border-4 border-[#4A2E19] bg-[#FCF8ED] p-6 shadow-2xl text-[#2A1608] sm:p-10 font-serif">
            {/* กรอบเส้นคู่ด้านในสไตล์โบราณ (Double Vintage Border) */}
            <div className="relative rounded-2xl border-2 border-[#4A2E19] bg-[#F8F1DE] p-5 sm:p-8">
              {/* มุมตกแต่ง 4 ด้าน (Corner Accents) */}
              <div className="absolute top-2 left-2 size-3 border-t-2 border-l-2 border-[#4A2E19]" />
              <div className="absolute top-2 right-2 size-3 border-t-2 border-r-2 border-[#4A2E19]" />
              <div className="absolute bottom-2 left-2 size-3 border-b-2 border-l-2 border-[#4A2E19]" />
              <div className="absolute bottom-2 right-2 size-3 border-b-2 border-r-2 border-[#4A2E19]" />

              {/* โลโก้ PAWND มุมบนซ้าย */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-[#4A2E19]">
                  PAWND NETWORK
                </span>
                <span className="text-[10px] uppercase text-[#8A6E55]">
                  OFFICIAL PET ALERT
                </span>
              </div>

              {/* ข้อความ WANTED สีแดงขนาดใหญ่ */}
              <h1 className="mt-2 text-center text-5xl font-black tracking-widest text-[#C5221F] sm:text-7xl">
                WANTED
              </h1>

              {/* รูปภาพสัตว์เลี้ยงตรงกลางแบบ Frameless */}
              <div className="relative mt-4 h-64 w-full overflow-hidden rounded-xl border-2 border-[#4A2E19]/40 bg-[#EFE6CF] shadow-inner sm:h-80">
                <Image
                  src={postData.petImageUrl}
                  alt={postData.petName}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* หัวข้อย่อยภาษาไทย */}
              <p className="mt-4 text-center text-base font-bold text-[#4A2E19] sm:text-xl font-sans">
                {isLost ? 'โปรดช่วยตามหาน้อง' : 'พบสัตว์เลี้ยง (ตามหาเจ้าของ)'}
              </p>

              {/* ชื่อสัตว์เลี้ยงตัวใหญ่ */}
              <h2 className="text-center text-3xl font-black uppercase text-[#2A1608] sm:text-5xl font-sans">
                {postData.petName}
              </h2>

              {/* เงินรางวัลนำส่ง (Bounty / Reward) */}
              {postData.rewardAmount ? (
                <div className="mt-3 text-center text-xl font-black text-[#C5221F] sm:text-3xl font-sans">
                  รางวัลนำส่ง: ฿ {Number(postData.rewardAmount).toLocaleString()} บาท
                </div>
              ) : (
                <p className="mt-2 text-center text-sm font-bold text-[#5C3D25] font-sans">
                  มีรางวัลตอบแทนสำหรับผู้พบเห็นและช่วยเหลือนำส่ง
                </p>
              )}

              {/* รายละเอียดสัตว์เลี้ยงและ QR Code (2 คอลัมน์) */}
              <div className="mt-6 grid grid-cols-1 gap-4 border-t-2 border-dashed border-[#4A2E19]/30 pt-5 sm:grid-cols-12 font-sans">
                {/* ฝั่งซ้าย: ข้อมูลสัตว์เลี้ยง (8 Cols) */}
                <div className="sm:col-span-8 flex flex-col gap-1.5 text-xs sm:text-sm text-[#2A1608]">
                  <span className="font-bold text-[#4A2E19]">ข้อมูลสัตว์เลี้ยง:</span>
                  <div>
                    <span className="font-semibold">ชนิด / สายพันธุ์:</span> {postData.petType} ({postData.breed})
                  </div>
                  <div>
                    <span className="font-semibold">เพศ:</span> {postData.gender === 'FEMALE' ? 'ตัวเมีย' : 'ตัวผู้'} | <span className="font-semibold">สี:</span> {postData.color}
                  </div>
                  <div>
                    <span className="font-semibold">วันที่หาย:</span> {postData.eventDate}
                  </div>
                  <div>
                    <span className="font-semibold">สถานที่ล่าสุด:</span> {postData.locationDescription}
                  </div>
                  {postData.distinctiveFeatures && (
                    <div className="mt-1 text-xs text-[#5C3D25] leading-relaxed">
                      <span className="font-bold text-[#4A2E19]">จุดเด่น / ตำหนิ:</span> {postData.distinctiveFeatures}
                    </div>
                  )}
                </div>

                {/* ฝั่งขวา: QR Code สแกนแจ้งเบาะแส (4 Cols) */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center text-center">
                  <div className="relative size-24 overflow-hidden rounded-xl border border-[#4A2E19]/40 bg-white p-1 shadow-sm">
                    <Image src={qrImageUrl} alt="QR Code" fill unoptimized className="object-contain" />
                  </div>
                  <span className="mt-1.5 text-[11px] font-bold text-[#4A2E19]">
                    สแกนแจ้งเบาะแส
                  </span>
                </div>
              </div>

              {/* แถบเบอร์โทรติดต่อขนาดใหญ่สีแดง */}
              <div className="mt-6 rounded-2xl bg-[#C5221F]/10 border border-[#C5221F]/30 p-3.5 text-center font-sans">
                <span className="text-base font-black text-[#C5221F] sm:text-xl">
                  ติดต่อ โทร: {postData.contactPhone}
                  {postData.contactLineId ? ` | LINE: ${postData.contactLineId}` : ''}
                </span>
              </div>

              {/* ลายเซ็นแบรนด์ PAWND ด้านล่างสุด */}
              <div className="mt-6 flex items-center justify-between border-t border-[#4A2E19]/20 pt-3 text-[10px] text-[#8A6E55] font-sans">
                <span>PAWND แพลตฟอร์มช่วยตามหาสัตว์เลี้ยง • PAWND.APP</span>
                <span className="font-serif font-black tracking-widest text-[#4A2E19]">
                  P A W N D
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* TEMPLATE 2: STANDARD STYLE (ตาม FlyerPdfGenerator STANDARD ใน Backend)  */}
        {/* ----------------------------------------------------------------------- */}
        {template === 'STANDARD' && (
          <div className="relative w-full max-w-[620px] rounded-3xl border-4 border-destructive bg-white p-6 shadow-2xl text-neutral-900 sm:p-10 font-sans">
            {/* แถบหัวกระดาษสีแดงเด่นชัด */}
            <div className="rounded-2xl bg-destructive py-4 text-center text-white shadow-md">
              <h1 className="text-3xl font-black uppercase tracking-wider sm:text-5xl">
                {isLost ? 'สัตว์เลี้ยงหาย (MISSING PET)' : 'พบสัตว์เลี้ยง (FOUND PET)'}
              </h1>
              <p className="mt-1 text-xs font-bold tracking-widest sm:text-sm">
                PAWND EMERGENCY LOST & FOUND NETWORK
              </p>
            </div>

            {/* แถบเงินรางวัลสีเหลืองสด */}
            {postData.rewardAmount && (
              <div className="mt-4 rounded-2xl bg-amber-400 py-3 text-center text-amber-950 font-black text-xl sm:text-2xl shadow-xs">
                🎁 รางวัลนำส่ง: ฿ {Number(postData.rewardAmount).toLocaleString()} บาท
              </div>
            )}

            {/* รูปภาพสัตว์เลี้ยงขนาดใหญ่ */}
            <div className="relative mt-4 h-64 w-full overflow-hidden rounded-2xl border-2 border-neutral-300 bg-neutral-100 sm:h-80">
              <Image
                src={postData.petImageUrl}
                alt={postData.petName}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* ชื่อสัตว์เลี้ยง */}
            <h2 className="mt-4 text-center text-3xl font-black text-neutral-900 sm:text-4xl">
              น้อง &quot;{postData.petName}&quot;
            </h2>

            {/* รายละเอียดสัตว์เลี้ยงและ QR Code */}
            <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl bg-neutral-50 p-5 border border-neutral-200 sm:grid-cols-12">
              <div className="sm:col-span-8 flex flex-col gap-1.5 text-xs sm:text-sm">
                <div>
                  <span className="font-bold">สายพันธุ์:</span> {postData.petType} ({postData.breed})
                </div>
                <div>
                  <span className="font-bold">เพศ / สี:</span> {postData.gender === 'FEMALE' ? 'เมีย' : 'ผู้'} • {postData.color}
                </div>
                <div>
                  <span className="font-bold">หายเมื่อ:</span> {postData.eventDate}
                </div>
                <div>
                  <span className="font-bold">พิกัด:</span> {postData.locationDescription}
                </div>
                {postData.distinctiveFeatures && (
                  <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                    <span className="font-bold text-neutral-900">จุดเด่น:</span> {postData.distinctiveFeatures}
                  </p>
                )}
              </div>

              <div className="sm:col-span-4 flex flex-col items-center justify-center text-center">
                <div className="relative size-24 overflow-hidden rounded-xl border border-neutral-300 bg-white p-1 shadow-xs">
                  <Image src={qrImageUrl} alt="QR Code" fill unoptimized className="object-contain" />
                </div>
                <span className="mt-1 text-[11px] font-bold text-neutral-700">
                  สแกนดูพิกัด & แจ้งเบาะแส
                </span>
              </div>
            </div>

            {/* เบอร์โทรติดต่อหลัก */}
            <div className="mt-4 rounded-2xl bg-destructive/10 p-3 text-center border border-destructive/20 font-bold text-destructive text-lg">
              📞 โทร: {postData.contactPhone}
            </div>

            {/* แถบแท็บเบอร์โทรสำหรับฉีก (Tear-off Contact Slips) */}
            <div className="mt-6 border-t-2 border-dashed border-neutral-400 pt-3">
              <div className="text-center text-[11px] font-bold text-neutral-500 mb-2">
                ✂️ ตัดหรือฉีกเบอร์โทรติดต่อด้านล่างนี้
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-2 text-center text-[10px]"
                  >
                    <span className="font-bold text-neutral-900 truncate max-w-full">
                      {postData.petName}
                    </span>
                    <span className="font-semibold text-destructive mt-0.5">
                      {postData.contactPhone}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
