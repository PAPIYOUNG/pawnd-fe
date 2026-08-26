'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Images,
  X,
  Download,
  Calendar,
  Sparkles,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  Filter,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PetAvatarItem } from '@/types/pet';
import { getMyAvatarsAction } from '../_actions/avatar.actions';

/**
 * ช่วยแปลง Cloudinary URL ให้อยู่ในรูปแบบที่ส่ง Header บังคับดาวน์โหลดไฟล์ลงเครื่อง (fl_attachment)
 * เพื่อป้องกันปัญหา Cross-Origin / CORS บล็อกการดาวน์โหลดบน Browser และ Mobile
 *
 * @param url - URL ของรูปภาพ Cloudinary
 * @param filename - ชื่อไฟล์ที่ต้องการบันทึก (จะถูกทำความสะอาดและ URL-encode)
 */
function getCloudinaryDownloadUrl(url: string, filename?: string): string {
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (!url.includes('fl_attachment')) {
      const baseName = filename
        ? filename.replace(/\.[^/.]+$/, '').trim()
        : 'pet-avatar';
      // แปลงอักขระพิเศษและช่องว่างเป็น underscore และ URL-encode สำหรับแนบใน Cloudinary path
      const sanitized = baseName
        .replace(/[/\\?%*:|"<>,\s]+/g, '_')
        .slice(0, 60);
      const cleanName = encodeURIComponent(sanitized || 'pet-avatar');
      return url.replace('/upload/', `/upload/fl_attachment:${cleanName}/`);
    }
  }
  return url;
}

interface AvatarAlbumModalProps {
  /** สถานะเปิด/ปิด Modal */
  isOpen: boolean;
  /** Callback เมื่อสั่งปิด Modal */
  onClose: () => void;
  /** ID ของสัตว์เลี้ยงปัจจุบันในหน้า (สำหรับ Filter) */
  currentPetId?: string;
  /** ชื่อของสัตว์เลี้ยงปัจจุบัน */
  currentPetName?: string;
  /** รายการ Avatar เริ่มต้น (ถ้ามี เพื่อไม่ต้อง fetch ซ้ำ) */
  initialAvatars?: PetAvatarItem[];
  /** Avatar ที่เพิ่งสร้างใหม่ล่าสุด (เพื่อแทรกเข้าอัลบั้มทันทีโดยไม่ต้องรอ revalidate) */
  newlyGeneratedAvatar?: PetAvatarItem | null;
  /** Callback เมื่อต้องการสร้างภาพใหม่ (ปิด modal เพื่อไปกดเจน) */
  onOpenGenerator?: () => void;
}

/**
 * AvatarAlbumModal (Client Component)
 * - Modal แสดงอัลบั้มและคลังภาพ AI Avatar ทั้งหมดของผู้ใช้ (Pet AI Avatar Album & Gallery)
 * - รองรับ 3 มุมมอง:
 *   1. Gallery Grid: แสดงภาพ Avatar ทั้งหมดในรูปแบบ Responsive Grid พร้อมชื่อสัตว์เลี้ยงและวันที่สร้าง
 *   2. Detailed Image Viewer (Lightbox): แสดงภาพขยายขนาดใหญ่ความละเอียดเต็ม พร้อมปุ่มสลับรูปถัดไป/ก่อนหน้า และปุ่มดาวน์โหลด
 *   3. Empty State: แสดงเมื่อยังไม่มีประวัติภาพ พร้อมปุ่ม CTA ปิดเพื่อไปเริ่มสร้างภาพ
 */
export function AvatarAlbumModal({
  isOpen,
  onClose,
  currentPetId,
  currentPetName,
  initialAvatars,
  newlyGeneratedAvatar,
  onOpenGenerator,
}: AvatarAlbumModalProps) {
  // State จัดการรายการรูปภาพและสถานะการโหลด
  const [avatars, setAvatars] = useState<PetAvatarItem[]>(initialAvatars || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State สำหรับโหมดภาพขยาย (Detailed View / Lightbox)
  const [selectedAvatar, setSelectedAvatar] = useState<PetAvatarItem | null>(null);

  // State ฟิลเตอร์: 'all' = ดูทั้งหมด, 'current' = ดูเฉพาะสัตว์เลี้ยงตัวนี้
  const [filterMode, setFilterMode] = useState<'all' | 'current'>('all');

  // State แสดงสถานะกำลังดาวน์โหลด
  const [isDownloading, setIsDownloading] = useState(false);

  /**
   * ฟังก์ชันดึงรายการภาพจาก Server Action (สำหรับปุ่มรีเฟรช)
   */
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMyAvatarsAction();
      if (res.success && res.data) {
        setAvatars(res.data);
      } else {
        setError(res.error || 'ไม่สามารถโหลดประวัติภาพ Avatar ได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลอัลบั้ม Avatar');
    } finally {
      setIsLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อเปิด Modal ขึ้นมา (โหลดแบบ Asynchronous ป้องกัน cascading renders)
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadInitialAvatars() {
      setIsLoading(true);
      try {
        const res = await getMyAvatarsAction();
        if (!isMounted) return;
        if (res.success && res.data) {
          setAvatars(res.data);
          setError(null);
        } else {
          setError(res.error || 'ไม่สามารถโหลดประวัติภาพ Avatar ได้');
        }
      } catch {
        if (!isMounted) return;
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลอัลบั้ม Avatar');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialAvatars();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // ล็อกการเลื่อนหน้าเว็บหลักขณะเปิด Modal (Prevent body scroll)
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // ซิงค์ภาพที่เพิ่งสร้างใหม่ (newlyGeneratedAvatar) เข้ากับรายการ avatars อย่างปลอดภัยด้วย useMemo
  const allAvatars = useMemo(() => {
    if (!newlyGeneratedAvatar) return avatars;
    const exists = avatars.some(
      (a) => a.id === newlyGeneratedAvatar.id || a.imageUrl === newlyGeneratedAvatar.imageUrl
    );
    return exists ? avatars : [newlyGeneratedAvatar, ...avatars];
  }, [avatars, newlyGeneratedAvatar]);

  // รายการภาพที่จะแสดงตาม Filter ที่เลือก
  const displayedAvatars = useMemo(() => {
    if (filterMode === 'current' && currentPetId) {
      return allAvatars.filter((a) => a.petId === currentPetId);
    }
    return allAvatars;
  }, [allAvatars, filterMode, currentPetId]);

  // ค้นหา Index ของภาพปัจจุบันใน Lightbox
  const currentAvatarIndex = useMemo(() => {
    if (!selectedAvatar) return -1;
    return displayedAvatars.findIndex(
      (a) => a.id === selectedAvatar.id || a.imageUrl === selectedAvatar.imageUrl
    );
  }, [selectedAvatar, displayedAvatars]);

  // ฟังก์ชันเลื่อนไปยังภาพก่อนหน้าใน Lightbox
  const handlePrevAvatar = useCallback(() => {
    if (currentAvatarIndex > 0) {
      setSelectedAvatar(displayedAvatars[currentAvatarIndex - 1]);
    }
  }, [currentAvatarIndex, displayedAvatars]);

  // ฟังก์ชันเลื่อนไปยังภาพถัดไปใน Lightbox
  const handleNextAvatar = useCallback(() => {
    if (currentAvatarIndex >= 0 && currentAvatarIndex < displayedAvatars.length - 1) {
      setSelectedAvatar(displayedAvatars[currentAvatarIndex + 1]);
    }
  }, [currentAvatarIndex, displayedAvatars]);

  // จัดการการปิด Modal
  const handleClose = useCallback(() => {
    setSelectedAvatar(null);
    onClose();
  }, [onClose]);

  // ควบคุมด้วยคีย์บอร์ด (Escape = ปิด / ถอยกลับ, ArrowLeft = รูปก่อนหน้า, ArrowRight = รูปถัดไป)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        if (selectedAvatar) {
          setSelectedAvatar(null);
        } else {
          handleClose();
        }
      } else if (selectedAvatar) {
        if (e.key === 'ArrowLeft') {
          handlePrevAvatar();
        } else if (e.key === 'ArrowRight') {
          handleNextAvatar();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedAvatar, handleClose, handlePrevAvatar, handleNextAvatar]);

  if (!isOpen) return null;

  /**
   * จัดรูปแบบวันที่ภาษาไทย เช่น 27 ส.ค. 2569 / 2026
   */
  const formatThaiDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return '';
    }
  };

  /**
   * ฟังก์ชันดาวน์โหลดรูปภาพลงในเครื่องผู้ใช้จริง (R3: Download Action)
   * รองรับทั้ง Data URL (Base64), Cloudinary Direct Blob, และ Cloudinary fl_attachment Fallback
   */
  const handleDownload = async (avatar: PetAvatarItem) => {
    try {
      setIsDownloading(true);
      const petName = avatar.pet?.name || currentPetName || 'pet';
      const cleanPetName = petName.replace(/[/\\?%*:|"<>,\s]+/g, '_').trim() || 'pet';
      const fileId = avatar.id ? avatar.id.slice(0, 8) : Date.now().toString();
      const filename = `${cleanPetName}-avatar-${fileId}.png`;

      // 1. กรณีเป็น Data URL (Base64)
      if (avatar.imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = avatar.imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // 2. พยายามดึงเป็น Blob เพื่อดาวน์โหลดโดยตรง
      const targetUrl = getCloudinaryDownloadUrl(avatar.imageUrl, filename);
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error('Fetch image failed');

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
      // 3. Fallback: ถ้าโดน CORS บล็อกการ Fetch Blob ให้ดาวน์โหลดผ่าน fl_attachment URL
      const petName = avatar.pet?.name || currentPetName || 'pet';
      const cleanPetName = petName.replace(/[/\\?%*:|"<>,\s]+/g, '_').trim() || 'pet';
      const fileId = avatar.id ? avatar.id.slice(0, 8) : Date.now().toString();
      const filename = `${cleanPetName}-avatar-${fileId}.png`;
      const fallbackUrl = getCloudinaryDownloadUrl(avatar.imageUrl, filename);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-modal-title"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl transition-all dark:border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* 1. MODAL HEADER */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {selectedAvatar ? (
              <button
                type="button"
                onClick={() => setSelectedAvatar(null)}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="ย้อนกลับไปแกลเลอรี"
              >
                <ChevronLeft className="size-5" />
              </button>
            ) : (
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Images className="size-5" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 id="album-modal-title" className="text-base font-bold text-foreground sm:text-lg">
                  {selectedAvatar
                    ? `ภาพ Avatar น้อง ${selectedAvatar.pet?.name || currentPetName || 'สัตว์เลี้ยง'}`
                    : 'อัลบั้ม Pet AI Avatar ของฉัน'}
                </h3>
                {!selectedAvatar && allAvatars.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {allAvatars.length} ภาพ
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedAvatar
                  ? `สร้างเมื่อ ${formatThaiDate(selectedAvatar.createdAt)}`
                  : 'ประวัติและคลังภาพ Avatar ทั้งหมดที่คุณเคยสร้างด้วย AI'}
              </p>
            </div>
          </div>

          {/* ส่วนปุ่มคำสั่งขวาบน: ปุ่มรีเฟรช และ ปุ่มปิด Modal */}
          <div className="flex items-center gap-1.5">
            {!selectedAvatar && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label="รีเฟรชรายการอัลบั้ม"
                title="รีเฟรชรูปภาพ"
              >
                <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="ปิดหน้าต่างอัลบั้ม"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. FILTER BAR (แสดงเมื่ออยู่ในหน้า Grid และมีภาพมากกว่า 1 ภาพ) */}
        {/* ========================================================= */}
        {!selectedAvatar && allAvatars.length > 0 && currentPetId && (
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-2.5 sm:px-6">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Filter className="size-3.5" />
              <span>แสดง:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition-colors ${
                  filterMode === 'all'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                ทั้งหมด ({allAvatars.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('current')}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition-colors ${
                  filterMode === 'current'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                เฉพาะน้อง {currentPetName || 'ตัวนี้'} ({allAvatars.filter((a) => a.petId === currentPetId).length})
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. MODAL CONTENT BODY */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* แจ้งเตือนข้อผิดพลาดถ้ามี */}
          {error && (
            <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* สถานะ 1: กำลังโหลด (Loading State) */}
          {isLoading && allAvatars.length === 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-square animate-pulse rounded-2xl bg-muted/60 border border-border/40"
                />
              ))}
            </div>
          )}

          {/* สถานะ 2: โหมดแสดงภาพขยายความละเอียดเต็ม (Detailed Image Viewer / Lightbox) */}
          {selectedAvatar && (
            <div className="flex flex-col items-center">
              {/* กรอบภาพขนาดใหญ่พร้อมปุ่ม Previous / Next */}
              <div className="relative flex items-center justify-center w-full">
                {/* ปุ่มภาพก่อนหน้า (Previous) */}
                {displayedAvatars.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevAvatar}
                    disabled={currentAvatarIndex <= 0}
                    className="absolute left-1 sm:left-2 z-10 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs transition-opacity hover:bg-black/80 disabled:opacity-20"
                    aria-label="ดูภาพก่อนหน้า"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                )}

                {/* กรอบรูปภาพใหญ่ */}
                <div className="relative aspect-square w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl border border-border/80 bg-muted shadow-lg">
                  <Image
                    src={selectedAvatar.imageUrl}
                    alt={`AI Avatar ของ ${selectedAvatar.pet?.name || 'สัตว์เลี้ยง'}`}
                    fill
                    sizes="(max-width: 640px) 90vw, 448px"
                    priority
                    className="object-cover"
                    unoptimized={selectedAvatar.imageUrl.startsWith('data:')}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs shadow-xs">
                      สไตล์ 3D Voxel
                    </span>
                  </div>
                  {displayedAvatars.length > 1 && (
                    <div className="absolute bottom-3 right-3">
                      <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs shadow-xs">
                        {currentAvatarIndex + 1} / {displayedAvatars.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* ปุ่มภาพถัดไป (Next) */}
                {displayedAvatars.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNextAvatar}
                    disabled={currentAvatarIndex >= displayedAvatars.length - 1}
                    className="absolute right-1 sm:right-2 z-10 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs transition-opacity hover:bg-black/80 disabled:opacity-20"
                    aria-label="ดูภาพถัดไป"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                )}
              </div>

              {/* ข้อมูลประกอบรูปภาพ */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>น้อง {selectedAvatar.pet?.name || currentPetName || 'สัตว์เลี้ยง'}</span>
                </span>
                {selectedAvatar.pet?.breed && (
                  <>
                    <span>•</span>
                    <span>{selectedAvatar.pet.breed}</span>
                  </>
                )}
                {selectedAvatar.createdAt && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      <span>{formatThaiDate(selectedAvatar.createdAt)}</span>
                    </span>
                  </>
                )}
              </div>

              {/* ปุ่ม Action: ดาวน์โหลดภาพลงเครื่อง และ เปิดดูภาพต้นฉบับ */}
              <div className="mt-6 flex w-full max-w-sm flex-col sm:flex-row gap-2.5">
                <Button
                  type="button"
                  onClick={() => handleDownload(selectedAvatar)}
                  disabled={isDownloading}
                  className="flex-1 h-11 gap-2 rounded-2xl bg-primary text-xs font-bold text-primary-foreground shadow-md transition-transform hover:scale-102"
                >
                  {isDownloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  <span>ดาวน์โหลดรูปภาพลงเครื่อง</span>
                </Button>

                <a
                  href={selectedAvatar.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-border/80 bg-muted/60 px-4 text-xs font-bold text-foreground transition-colors hover:bg-muted"
                >
                  <ExternalLink className="size-3.5" />
                  <span>เปิดภาพเต็ม</span>
                </a>
              </div>
            </div>
          )}

          {/* สถานะ 3: แกลเลอรีแบบ Responsive Grid (Gallery Grid View) */}
          {!selectedAvatar && displayedAvatars.length > 0 && (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-3">
              {displayedAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card p-2 shadow-2xs transition-all hover:border-primary/60 hover:shadow-md"
                >
                  {/* รูปภาพ Thumbnail */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={avatar.imageUrl}
                      alt={`Avatar ของ ${avatar.pet?.name || 'สัตว์เลี้ยง'}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={avatar.imageUrl.startsWith('data:')}
                    />

                    {/* Overlay เมื่อ Hover บน Desktop */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-2xs">
                      <div className="flex size-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-md">
                        <Maximize2 className="size-5" />
                      </div>
                    </div>
                  </div>

                  {/* ข้อมูลใต้ภาพใน Card */}
                  <div className="mt-2 flex items-center justify-between px-1">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-foreground">
                        {avatar.pet?.name || currentPetName || 'สัตว์เลี้ยง'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatThaiDate(avatar.createdAt)}
                      </p>
                    </div>

                    {/* ปุ่มดาวน์โหลดด่วนบนการ์ด */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(avatar);
                      }}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      title="ดาวน์โหลดภาพนี้"
                      aria-label="ดาวน์โหลดภาพ"
                    >
                      <Download className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* สถานะ 4: Empty State เมื่อยังไม่มีภาพในอัลบั้ม (Empty State) */}
          {!isLoading && !selectedAvatar && displayedAvatars.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center sm:py-14">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-4 shadow-2xs">
                <Images className="size-8 stroke-[1.8]" />
              </div>
              <h4 className="text-base font-bold text-foreground sm:text-lg">
                {filterMode === 'current'
                  ? `ยังไม่มีภาพ AI Avatar ของน้อง ${currentPetName || 'ตัวนี้'}`
                  : 'ยังไม่มีประวัติภาพ AI Avatar'}
              </h4>
              <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
                เมื่อคุณสร้างภาพ AI Avatar สำหรับสัตว์เลี้ยง ภาพผลลัพธ์จะถูกจัดเก็บไว้ในอัลบั้มนี้โดยอัตโนมัติ ให้คุณกลับมาดูและดาวน์โหลดได้ตลอดเวลา
              </p>

              {/* ปุ่ม CTA ปิด Modal เพื่อไปเริ่มสร้างภาพ */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {filterMode === 'current' && allAvatars.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFilterMode('all')}
                    className="rounded-2xl border-border text-xs font-bold"
                  >
                    ดูภาพทั้งหมด ({allAvatars.length})
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={() => {
                    handleClose();
                    if (onOpenGenerator) onOpenGenerator();
                  }}
                  className="gap-2 rounded-2xl bg-primary px-6 text-xs font-bold text-primary-foreground shadow-md transition-transform hover:scale-105"
                >
                  <Sparkles className="size-4" />
                  <span>ลองสร้างภาพ Avatar ตอนนี้</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 4. MODAL FOOTER */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/10 px-5 py-3 sm:px-6">
          <p className="text-[11px] text-muted-foreground">
            * ภาพที่สร้างด้วย AI จะถูกจัดเก็บอย่างปลอดภัยในบัญชีของคุณ
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            ปิด
          </Button>
        </div>
      </div>
    </div>
  );
}
