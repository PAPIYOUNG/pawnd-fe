'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ImagePlus,
  Loader2,
  MapPin,
  PawPrint,
  Plus,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

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
import { PetType } from '@/types/post';
import {
  searchPostsByImageAction,
  type ActionResponse,
} from '../_actions/ai-search.actions';
import type { AiSearchByImageResult } from '@/services/ai.service';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// บาง response ของ AI ส่งค่า breed มาเป็น string "null" ตรงๆ (ไม่ใช่ null จริง) ต้องกรองออกก่อนแสดงผล
const hasMeaningfulText = (value: string | null | undefined): value is string =>
  Boolean(value && value.trim().toLowerCase() !== 'null');

// ป้ายชื่อประเภทสัตว์เลี้ยงภาษาไทย สำหรับแสดงผลใน Dialog นี้เท่านั้น
const PET_TYPE_LABEL_TH: Record<PetType, string> = {
  DOG: 'สุนัข',
  CAT: 'แมว',
  BIRD: 'นก',
  HAMSTER: 'แฮมสเตอร์',
  EXOTIC: 'สัตว์พิเศษ',
  OTHER: 'สัตว์เลี้ยง',
};

/**
 * AiMatchUploadDialog (Client Component)
 * - ปุ่มเปิด Dialog สำหรับอัปโหลดรูปสัตว์เลี้ยงเพื่อค้นหาด้วย AI Smart Matching
 * - รองรับทั้งการคลิกเลือกไฟล์และการลาก-วางไฟล์ (Drag & Drop) ลงในกล่องอัปโหลด
 * - กดค้นหาแล้วเรียก Server Action searchPostsByImageAction (POST /ai/search-by-image จริง)
 *   แล้วแสดงรายการประกาศที่ AI จับคู่ได้ พร้อมคะแนนความคล้ายในหน้าเดียวกัน
 */
export function AiMatchUploadDialog() {
  // ควบคุมสถานะเปิด/ปิดของ Dialog
  const [open, setOpen] = useState(false);
  // ไฟล์รูปภาพจริงที่ผู้ใช้เลือก (ใช้ส่งเข้า Server Action ตอนกดค้นหา)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // เก็บ URL รูปตัวอย่างที่ผู้ใช้เลือก (สำหรับ Preview เท่านั้น)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // เก็บสถานะกำลังลากไฟล์เข้ามาเหนือกล่องอัปโหลด (ไว้เปลี่ยนสไตล์ Dashed Border)
  const [isDragging, setIsDragging] = useState(false);
  // ข้อความ Error กรณีไฟล์ไม่ผ่านการตรวจสอบเบื้องต้น หรือ API ค้นหาล้มเหลว
  const [error, setError] = useState<string | null>(null);
  // สถานะกำลังเรียก API ค้นหาด้วย AI-matching
  const [isSearching, setIsSearching] = useState(false);
  // ผลลัพธ์การค้นหาล่าสุดจาก Backend (null = ยังไม่ได้ค้นหา หรือกำลังเลือกรูปใหม่)
  const [searchResult, setSearchResult] = useState<AiSearchByImageResult | null>(
    null,
  );

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
    setSelectedFile(file);
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
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // กลับไปหน้าเลือกรูปใหม่ (ล้างผลการค้นหาเดิม แต่คง Dialog เปิดอยู่)
  const handleSearchAgain = () => {
    handleRemovePreview();
    setSearchResult(null);
    setError(null);
  };

  // รีเซ็ตสถานะทั้งหมดเมื่อปิด Dialog เพื่อไม่ให้ค้างข้ามการเปิดครั้งถัดไป
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      setIsDragging(false);
      setIsSearching(false);
      setSearchResult(null);
    }
  };

  // ปุ่มค้นหาด้วย AI-matching — เรียก Server Action ไปยัง POST /ai/search-by-image จริง
  const handleSearch = async () => {
    if (!selectedFile) return;

    setIsSearching(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    const res: ActionResponse<AiSearchByImageResult> =
      await searchPostsByImageAction(formData);

    setIsSearching(false);

    if (res.success && res.data) {
      setSearchResult(res.data);
    } else {
      setError(res.error || 'ไม่สามารถค้นหาด้วย AI ได้ในขณะนี้');
    }
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
            {searchResult
              ? searchResult.totalMatches > 0
                ? `พบประกาศที่ใกล้เคียงกัน ${searchResult.totalMatches} รายการ`
                : 'ยังไม่พบประกาศที่มีลักษณะใกล้เคียงในระบบขณะนี้'
              : 'อัปโหลดรูปสัตว์เลี้ยงที่พบเห็นหรือกำลังตามหา ระบบ AI จะช่วยจับคู่กับประกาศที่ใกล้เคียงที่สุดให้คุณ'}
          </DialogDescription>
        </DialogHeader>

        {searchResult ? (
          <>
            {/* สรุปผลวิเคราะห์รูปที่ AI ตรวจพบ */}
            <div className="flex items-center gap-2 rounded-2xl bg-primary/5 px-3.5 py-2.5 text-xs font-semibold text-primary">
              <PawPrint className="size-4 shrink-0" />
              <span>
                AI ตรวจพบ: {PET_TYPE_LABEL_TH[searchResult.analysis.type]}
                {hasMeaningfulText(searchResult.analysis.breed)
                  ? ` พันธุ์${searchResult.analysis.breed}`
                  : ''}
              </span>
            </div>

            {/* รายการประกาศที่จับคู่ได้ */}
            {searchResult.matches.length > 0 ? (
              <div className="flex max-h-80 flex-col gap-2.5 overflow-y-auto pr-1">
                {searchResult.matches.map((match) => {
                  const isLost = match.post.type === 'LOST';
                  const coverImage = match.post.images[0]?.imageUrl;
                  const scorePercent = Math.round(match.finalScore * 100);

                  return (
                    <Link
                      key={match.postId}
                      href={`/posts/${match.postId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-2.5 transition-colors hover:border-primary/50 hover:bg-muted/40"
                    >
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {coverImage && (
                          <Image
                            src={coverImage}
                            alt={
                              hasMeaningfulText(match.post.breed)
                                ? match.post.breed
                                : 'รูปสัตว์เลี้ยงที่จับคู่ได้'
                            }
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span
                          className={cn(
                            'w-fit rounded-full px-2 py-0.5 text-[10px] font-bold text-white',
                            isLost ? 'bg-destructive' : 'bg-emerald-600',
                          )}
                        >
                          {isLost ? 'ตามหา (LOST)' : 'พบเห็น (FOUND)'}
                        </span>
                        <span className="truncate text-sm font-semibold text-foreground">
                          {PET_TYPE_LABEL_TH[match.post.petType]}
                          {hasMeaningfulText(match.post.breed)
                            ? ` · ${match.post.breed}`
                            : ''}
                        </span>
                        {match.post.province && (
                          <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <MapPin className="size-3 shrink-0 text-primary" />
                            {match.post.province}
                          </span>
                        )}
                      </div>

                      <span className="shrink-0 rounded-xl bg-primary/10 px-2.5 py-1 text-sm font-extrabold text-primary">
                        {scorePercent}%
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
                <PawPrint className="size-8 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">
                  ไม่พบสัตว์เลี้ยงที่มีลักษณะใกล้เคียงกัน
                </p>
                <p className="text-xs text-muted-foreground">
                  ลองอัปโหลดรูปที่เห็นลักษณะเด่นชัดเจนกว่านี้ดูอีกครั้ง
                </p>
              </div>
            )}
          </>
        ) : (
          <>
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
          </>
        )}

        <DialogFooter>
          {searchResult ? (
            <>
              <Button
                variant="outline"
                className="h-10 gap-2 rounded-2xl"
                onClick={handleSearchAgain}
              >
                <RotateCcw className="size-4" />
                ค้นหารูปใหม่
              </Button>
              <Button
                className="h-10 rounded-2xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={() => handleOpenChange(false)}
              >
                ปิด
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
