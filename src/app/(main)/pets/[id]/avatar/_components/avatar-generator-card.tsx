'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Loader2,
  Download,
  RefreshCw,
  AlertCircle,
  ImageIcon,
  ArrowRight,
  Images,
} from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { PetProfile, PetAvatarItem } from '@/types/pet';
import { Button } from '@/components/ui/button';
import { generatePetAvatarAction } from '../_actions/avatar.actions';
import { AvatarAlbumModal } from './avatar-album-modal';

/**
 * ช่วยแปลง Cloudinary URL ให้อยู่ในรูปแบบที่ส่ง Header บังคับดาวน์โหลดไฟล์ลงเครื่อง (fl_attachment)
 */
function getCloudinaryDownloadUrl(url: string, filename?: string): string {
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (!url.includes('fl_attachment')) {
      const baseName = filename
        ? filename.replace(/\.[^/.]+$/, '').trim()
        : 'pet-avatar';
      const sanitized = baseName
        .replace(/[/\\?%*:|"<>,\s]+/g, '_')
        .slice(0, 60);
      const cleanName = encodeURIComponent(sanitized || 'pet-avatar');
      return url.replace('/upload/', `/upload/fl_attachment:${cleanName}/`);
    }
  }
  return url;
}

interface AvatarGeneratorCardProps {
  pet: PetProfile;
}

/**
 * AvatarGeneratorCard (Client Component)
 * - ส่วนแสดงผลและปุ่มสั่งสร้าง AI Avatar เชื่อมต่อกับ Backend (POST /ai/generate-pet-avatar)
 * - มีปุ่มเปิดดู "อัลบั้ม Avatar" (Avatar Album & Gallery) ของผู้ใช้
 * - จัดการ 4 สถานะ:
 *   1. Initial: แสดงกรอบเส้นประและปุ่มสร้าง Avatar
 *   2. Loading: แสดงแอนิเมชันกำลังประมวลผล
 *   3. Success: แสดงภาพ Avatar ที่เจนออกมา พร้อมปุ่มดาวน์โหลด, เปิดดูในอัลบั้ม และสร้างใหม่
 *   4. Empty Images Warning: แจ้งเตือนเมื่อสัตว์เลี้ยงยังไม่มีรูปภาพอัปโหลด
 */
export function AvatarGeneratorCard({ pet }: AvatarGeneratorCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [latestAvatar, setLatestAvatar] = useState<PetAvatarItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [quota, setQuota] = useState<{
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);

  // ตรวจสอบรูปภาพอ้างอิงของสัตว์เลี้ยง (Backend ต้องการรูปจริงจาก pet.images อย่างน้อย 1 รูป)
  const petImageUrls = pet.images && pet.images.length > 0
    ? pet.images.map((img) => img.imageUrl)
    : pet.profileImageUrl && !pet.profileImageUrl.includes('unsplash.com')
      ? [pet.profileImageUrl]
      : [];

  const hasImages = petImageUrls.length > 0;

  // ฟังก์ชันดาวน์โหลดภาพลงเครื่องผู้ใช้จริง
  const handleDownload = async (url: string) => {
    try {
      setIsDownloading(true);
      const cleanPetName = pet.name.replace(/[/\\?%*:|"<>,\s]+/g, '_').trim() || 'pet';
      const filename = `${cleanPetName}-avatar-${Date.now()}.png`;

      // 1. กรณีเป็น Data URL (Base64)
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // 2. พยายามดึงเป็น Blob
      const targetUrl = getCloudinaryDownloadUrl(url, filename);
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error('Fetch failed');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // 3. Fallback: ใช้ <a> ชี้ไปที่ fl_attachment URL
      const cleanPetName = pet.name.replace(/[/\\?%*:|"<>,\s]+/g, '_').trim() || 'pet';
      const filename = `${cleanPetName}-avatar.png`;
      const fallbackUrl = getCloudinaryDownloadUrl(url, filename);

      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  // ฟังก์ชันเรียกสร้างภาพ Avatar จาก Backend
  const handleGenerate = async () => {
    if (!hasImages) {
      setError('กรุณาอัปโหลดรูปถ่ายของสัตว์เลี้ยงก่อนสร้าง Avatar');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await generatePetAvatarAction({
        petId: pet.id,
        imageUrls: petImageUrls.slice(0, 3),
      });

      if (res.success && res.data) {
        const generatedImageUrl = res.data.avatar.imageUrl;
        setAvatarUrl(generatedImageUrl);

        const newAvatarItem: PetAvatarItem = {
          id: res.data.avatar.id || 'avatar-' + Date.now(),
          userId: '',
          petId: pet.id,
          imageUrl: generatedImageUrl,
          style: res.data.avatar.style || '3D_VOXEL',
          createdAt: res.data.avatar.createdAt || new Date().toISOString(),
          pet: {
            id: pet.id,
            name: pet.name,
            type: pet.type,
            breed: pet.breed,
            profileImageUrl: pet.profileImageUrl,
          },
        };
        setLatestAvatar(newAvatarItem);

        setQuota({
          used: res.data.quota.used,
          limit: res.data.quota.limit,
          remaining: res.data.quota.remaining,
        });
      } else {
        setError(res.error || 'ไม่สามารถสร้างภาพ Avatar ได้ กรุณาลองใหม่อีกครั้ง');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ AI');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-10 border-t border-border/60 pt-8">
      {/* ส่วนหัวของกล่อง Studio พร้อมปุ่มเปิด อัลบั้ม Avatar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Avatar AI Studio
          </h3>
          <p className="text-xs text-muted-foreground">
            สร้างภาพอวตาร 3D สัตว์เลี้ยงสุดน่ารักด้วย Generative AI
          </p>
        </div>

        {/* ปุ่ม Icon เปิดดูอัลบั้มภาพ Avatar ทั้งหมด (R2: Album Icon Button) */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAlbumOpen(true)}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-2xl border-border/80 bg-card px-4 py-2 text-xs font-bold text-foreground shadow-2xs transition-all hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
        >
          <Images className="size-4 text-primary" />
          <span>อัลบั้มภาพ Avatar ของฉัน</span>
        </Button>
      </div>

      {/* แถบแจ้งเตือน Error ถ้ามี */}
      {error && (
        <div className="mx-auto mb-6 flex max-w-sm items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* กรณีสัตว์เลี้ยงยังไม่มีรูปภาพอัปโหลด */}
      {!hasImages && !avatarUrl && (
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center w-full max-w-sm rounded-3xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 p-8 sm:p-10 shadow-2xs">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-4">
              <ImageIcon className="size-7 stroke-[2.2]" />
            </div>
            <p className="text-sm font-bold text-foreground leading-relaxed">
              สัตว์เลี้ยงยังไม่มีรูปถ่าย
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              ระบบ AI จำเป็นต้องใช้รูปถ่ายจริงของน้องอย่างน้อย 1 รูป เพื่อใช้อ้างอิงลักษณะในการสร้าง Avatar
            </p>
            <Link
              href="/profile/pets"
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-transform hover:scale-105"
            >
              <span>ไปที่หน้าโปรไฟล์เพื่ออัปโหลดรูป</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* กรณีมีรูปภาพสัตว์เลี้ยงพร้อมสร้าง หรือสร้างสำเร็จแล้ว */}
      {(hasImages || avatarUrl) && (
        <div className="flex flex-col items-center justify-center">
          {/* สถานะ 1 & 2: กรอบเส้นประ (Initial) หรือ Lottie Loading State */}
          {!avatarUrl && (
            isLoading ? (
              /* สถานะ Loading: แสดง Music Time Lottie Animation แทนที่กรอบเดิม */
              <div className="flex flex-col items-center justify-center text-center w-full max-w-sm py-4">
                {/* แอนิเมชัน Music Time จาก /public/animations/ */}
                <div className="w-56 h-56 sm:w-64 sm:h-64">
                  <DotLottieReact
                    src="/animations/Music Time.json"
                    loop
                    autoplay
                    className="w-full h-full"
                  />
                </div>
                <p className="mt-3 text-sm font-bold text-foreground leading-relaxed">
                  กำลังเนรมิต Avatar ด้วย AI...
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-xs">
                  การสร้างรูปอาจใช้เวลานาน <strong className="text-foreground">30 – 60 วินาที</strong><br />โปรดอย่าปิดหน้าต่างนี้
                </p>
              </div>
            ) : (
              /* สถานะ Initial: กรอบเส้นประ */
              <div className="flex flex-col items-center justify-center text-center w-full max-w-sm rounded-3xl border-2 border-dashed border-border/90 bg-muted/20 p-8 sm:p-10 shadow-2xs transition-all hover:border-primary/50">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                  <Sparkles className="size-7 stroke-[2.2]" />
                </div>
                <p className="text-sm font-semibold text-foreground leading-relaxed">
                  กดปุ่มสีเขียวด้านล่างเพื่อสร้าง Avatar ในสไตล์ของคุณ
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  ระบบ AI จะเนรมิตภาพโปรไฟล์สุดน่ารักสำหรับสัตว์เลี้ยงของคุณ
                </p>
              </div>
            )
          )}

          {/* สถานะ 3: แสดงภาพผลลัพธ์ Avatar ที่เจนสำเร็จ (Success State) */}
          {avatarUrl && (
            <div className="flex flex-col items-center text-center w-full max-w-sm rounded-3xl border border-primary/40 bg-card p-6 shadow-md">
              <div className="relative aspect-square w-60 sm:w-64 overflow-hidden rounded-2xl bg-muted shadow-sm">
                <Image
                  src={avatarUrl}
                  alt="Generated AI Avatar"
                  fill
                  sizes="(max-width: 640px) 240px, 256px"
                  priority
                  className="object-cover"
                  unoptimized={avatarUrl.startsWith('data:')}
                />
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <Sparkles className="size-4" />
                <span>สร้าง Avatar สำเร็จแล้ว!</span>
              </div>

              {quota && (
                <p className="mt-1 text-xs text-muted-foreground">
                  โควต้าคงเหลือรอบนี้: <strong className="text-foreground">{quota.remaining}</strong>/{quota.limit} ครั้ง
                </p>
              )}

              {/* ปุ่ม Action: ดาวน์โหลด, เปิดดูในอัลบั้ม, และสร้างใหม่ */}
              <div className="mt-5 flex w-full flex-col gap-2">
                <Button
                  type="button"
                  onClick={() => handleDownload(avatarUrl)}
                  disabled={isDownloading}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                >
                  {isDownloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  <span>ดาวน์โหลดรูปภาพ Avatar</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAlbumOpen(true)}
                  className="h-10 w-full gap-2 rounded-xl border-border/80 text-xs font-bold text-foreground hover:bg-muted"
                >
                  <Images className="size-3.5 text-primary" />
                  <span>เปิดดูในอัลบั้ม Avatar ทั้งหมด</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isLoading || (quota !== null && quota.remaining <= 0)}
                  className="h-10 w-full gap-2 rounded-xl border-border/80 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  {isLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="size-3.5" />
                  )}
                  <span>{isLoading ? 'กำลังประมวลผล...' : 'สร้างใหม่อีกครั้ง'}</span>
                </Button>
              </div>
            </div>
          )}

          {/* ปุ่มกดสร้างภาพ Avatar ด้านล่าง (แสดงเมื่อยังไม่เจน หรือกำลังเจน) */}
          {!avatarUrl && (
            <div className="mt-6">
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="h-12 gap-2 rounded-2xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>กำลังสร้างภาพ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    <span>สร้างภาพ Avatar ทันที</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal แกลเลอรีอัลบั้มรูป Avatar (R2 & R3) */}
      <AvatarAlbumModal
        isOpen={isAlbumOpen}
        onClose={() => setIsAlbumOpen(false)}
        currentPetId={pet.id}
        currentPetName={pet.name}
        newlyGeneratedAvatar={latestAvatar}
      />
    </div>
  );
}

