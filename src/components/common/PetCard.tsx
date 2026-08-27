import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LatestPostItem } from '@/types/post';

interface PetCardProps {
  post: LatestPostItem;
}

/**
 * PetCard Component
 * - คอมโพเนนต์การ์ดแสดงข้อมูลสรุปสัตว์เลี้ยง (สำหรับหน้า Feed และ Home Carousel)
 * - ประกอบด้วย:
 *   1. รูปภาพปกสัตว์เลี้ยง พร้อมเอฟเฟกต์ Zoom เมื่อ Hover
 *   2. ป้าย Badge สถานะ: "สัตว์หาย" (สีแดง) หรือ "พบสัตว์พลัดหลง" (สีเขียว)
 *   3. ชื่อสัตว์เลี้ยง และข้อมูลสายพันธุ์/อายุ
 *   4. พิกัดสถานที่ที่พบ/หาย และเวลาที่ผ่านมา (Time Ago)
 */
/**
 * ตรวจสอบและแปลงข้อความที่อาจเป็น 'Unknown' หรือเครื่องหมาย '?' ให้เป็นค่าเริ่มต้นภาษาไทย
 */
function cleanText(val?: string | null, fallback = ''): string {
  if (!val) return fallback;
  const trimmed = val.trim();
  if (
    trimmed === '' ||
    trimmed.toLowerCase() === 'unknown' ||
    /^[\s?？]+$/.test(trimmed)
  ) {
    return fallback;
  }
  return trimmed;
}

export function PetCard({ post }: PetCardProps) {
  const isLost = post.type === 'LOST';
  // กำหนดชื่อที่แสดงผล: ถ้าไม่มีชื่อหรือเป็น Unknown/??? ให้ fallback เป็นภาษาไทยตามประเภทประกาศ
  const defaultName = isLost ? 'สัตว์เลี้ยง (ไม่ระบุชื่อ)' : 'ไม่ทราบชื่อ';
  const displayName = cleanText(post.petName, defaultName);
  const displayLocation = cleanText(
    post.locationDetail || post.province,
    'ไม่ระบุสถานที่',
  );

  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        {/* กล่องรูปภาพสัตว์เลี้ยง */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={post.coverImageUrl}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* ป้าย Badge แสดงสถานะ สัตว์หาย / พบสัตว์พลัดหลง */}
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant={isLost ? 'lost' : 'found'}
              className="px-2.5 py-0.5 text-[11px] font-medium shadow-xs"
            >
              {isLost ? 'สัตว์หาย' : 'พบสัตว์พลัดหลง'}
            </Badge>
          </div>
        </div>

        {/* รายละเอียดข้อมูลสัตว์เลี้ยง */}
        <div className="flex flex-col gap-2 p-4">
          <div>
            {/* ชื่อสัตว์เลี้ยง */}
            <h3 className="line-clamp-1 text-base font-bold text-foreground transition-colors group-hover:text-primary">
              {displayName}
            </h3>
            {/* สายพันธุ์ หรือคำอธิบายเพิ่มเติม */}
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {post.ageDescription || post.breed || 'ข้อมูลสัตว์เลี้ยง'}
            </p>
          </div>

          {/* พิกัดสถานที่และเวลา */}
          <div className="flex flex-col gap-1 border-t border-border/40 pt-1 text-xs text-muted-foreground">
            {/* พิกัดสถานที่ */}
            <div className="flex items-center gap-1.5 line-clamp-1">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{displayLocation}</span>
            </div>
            {/* เวลาที่ผ่านมา */}
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0 text-muted-foreground/80" />
              <span>{post.timeAgo}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
