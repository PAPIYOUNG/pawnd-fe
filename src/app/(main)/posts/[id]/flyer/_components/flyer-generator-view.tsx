'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Download,
  Printer,
  Share2,
  ChevronLeft,
  Check,
  ExternalLink,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PostDetail } from '@/services/post.service';

interface FlyerGeneratorViewProps {
  postId: string;
  post: PostDetail;
}

/**
 * FlyerGeneratorView Component (Client Component)
 * - คอมโพเนนต์แสดงผลและจัดการใบปลิวตามหาสัตว์เลี้ยงด้วยไฟล์ PDF แท้จริงจาก Backend
 * - ดึงตัวอย่างผ่าน Next.js Proxy Route: `/api/posts/${postId}/flyer/pdf`
 * - นำตัวเลือกสลับสไตล์และข้อมูล Mock ออกทั้งหมดตามคำสั่ง
 * - รองรับปุ่มแชร์ (Share), สั่งพิมพ์ (Print) และดาวน์โหลดไฟล์ PDF ไซส์ A4 จริง
 */
export function FlyerGeneratorView({ postId, post }: FlyerGeneratorViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);

  const pdfUrl = `/api/posts/${postId}/flyer/pdf`;
  const petName = post.petName || post.pet?.name || 'สัตว์เลี้ยง';

  // 1. ฟังก์ชันดาวน์โหลด PDF ขนาดจริงลงเครื่อง
  const handleDownloadPdf = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `flyer-${petName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 2. ฟังก์ชันสั่งพิมพ์ไฟล์ PDF
  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      } catch {
        // หากบราวเซอร์บล็อกการสั่ง print ข้าม frame ให้เปิดแท็บใหม่แทน
      }
    }
    window.open(pdfUrl, '_blank');
  };

  // 3. ฟังก์ชันแชร์ลิงก์ใบปลิว
  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ใบปลิวประกาศตามหา ${petName} | PAWND`,
          text: `ช่วยตามหาน้อง ${petName} ประกาศตามหาสัตว์เลี้ยงบน PAWND`,
          url: shareUrl,
        });
      } catch {
        // ผู้ใช้กดยกเลิกการแชร์
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* ส่วนหัวและการควบคุมด้านบน (Navigation & Actions) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-5">
        {/* ลิงก์ย้อนกลับไปยังหน้ารายละเอียดประกาศ */}
        <Link
          href={`/posts/${postId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          <span>กลับหน้ารายละเอียดประกาศ</span>
        </Link>

        {/* แถบปุ่ม Action: แชร์, พิมพ์, ดาวน์โหลด PDF */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* ปุ่มแชร์ */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 rounded-2xl text-xs font-semibold"
          >
            {isCopied ? (
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Share2 className="size-3.5" />
            )}
            <span>{isCopied ? 'คัดลอกลิงก์แล้ว' : 'แชร์'}</span>
          </Button>

          {/* ปุ่มพิมพ์ */}
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

          {/* ปุ่มดาวน์โหลด PDF ขนาดจริง */}
          <Button
            type="button"
            size="sm"
            onClick={handleDownloadPdf}
            className="gap-1.5 rounded-2xl bg-emerald-700 text-xs font-bold text-white shadow-md hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Download className="size-3.5 stroke-[2.5]" />
            <span>ดาวน์โหลด PDF ไซส์จริง</span>
          </Button>
        </div>
      </div>

      {/* พื้นที่แสดงผลตัวอย่างจากไฟล์ PDF จริง (Real PDF Preview) */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-full max-w-[640px] aspect-[1/1.414] overflow-hidden rounded-3xl border border-border/80 bg-muted/30 shadow-2xl transition-all">
          {/* สถานะกำลังโหลด PDF */}
          {isLoadingPdf && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/90 backdrop-blur-xs">
              <Loader2 className="size-9 animate-spin text-primary" />
              <p className="mt-3 text-xs font-semibold text-muted-foreground">
                กำลังเตรียมและโหลดตัวอย่างไฟล์ PDF...
              </p>
            </div>
          )}

          {/* iFrame แสดงผลไฟล์ PDF ตัวจริงจาก Backend */}
          <iframe
            ref={iframeRef}
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            onLoad={() => setIsLoadingPdf(false)}
            className="h-full w-full border-none rounded-3xl bg-white"
            title={`ตัวอย่างใบปลิวตามหา ${petName}`}
          />
        </div>

        {/* แถบคำอธิบายและทางเลือกลิงก์เปิดตรง */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-xs text-muted-foreground">
            ตัวอย่างไฟล์ PDF ขนาด A4 แท้จริงจากระบบ พร้อมนำไปพิมพ์หรือแชร์เพื่อช่วยตามหาสัตว์เลี้ยง
          </p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline underline-offset-4"
          >
            <ExternalLink className="size-3" />
            <span>เปิดไฟล์ PDF ในหน้าต่างใหม่</span>
          </a>
        </div>
      </div>
    </div>
  );
}
