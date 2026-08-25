'use client';

import {
  AlertCircle,
  LocateFixed,
  LoaderCircle,
  MapPin,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { NearbyPostCard } from './nearby-post-card';
import type { NearbyPostListProps } from './map-page.types';

/**
 * รายการ nearby ที่รวม location CTA และสถานะ loading/error/empty
 * ลำดับเงื่อนไขตรงกับ MapSidebar เดิมเพื่อคงข้อความและ behavior ทุกสถานะ
 */
export function NearbyPostList({
  data,
  filteredFeatures,
  currentLocation,
  selectedPostId,
  onSelectPost,
  onRequestCurrentLocation,
  isLocating,
  onRetry,
}: NearbyPostListProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
      {!currentLocation ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-4 py-8 text-center">
          <LocateFixed className="size-7 text-primary" aria-hidden="true" />
          <p className="mt-2 text-xs font-semibold text-foreground">
            เปิดตำแหน่งเพื่อดูประกาศใกล้คุณ
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            พิกัดจะเก็บไว้เฉพาะในหน้าเว็บนี้และไม่ถูกบันทึกลงระบบ
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4 rounded-xl"
            onClick={onRequestCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <LocateFixed className="size-4" aria-hidden="true" />
            )}
            {isLocating ? 'กำลังหาตำแหน่ง...' : 'ใช้ตำแหน่งของฉัน'}
          </Button>
        </div>
      ) : data.isLoading && data.features.length === 0 ? (
        <div className="space-y-3" aria-label="กำลังโหลดรายการประกาศ">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex gap-3 rounded-2xl border border-border p-3"
            >
              <Skeleton className="size-16 shrink-0 rounded-xl" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : data.errorMessage ? (
        <div className="flex flex-col items-center rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-8 text-center">
          <AlertCircle className="size-7 text-destructive" aria-hidden="true" />
          <p className="mt-2 text-xs font-semibold text-foreground">
            โหลดรายการไม่สำเร็จ
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            กรุณาลองโหลดประกาศใกล้เคียงอีกครั้ง
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 rounded-xl"
            onClick={onRetry}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            ลองใหม่
          </Button>
        </div>
      ) : filteredFeatures.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-4 py-10 text-center">
          <MapPin className="size-7 text-muted-foreground" aria-hidden="true" />
          <p className="mt-2 text-xs font-semibold text-foreground">
            ไม่พบประกาศที่ตรงกับตัวกรอง
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            ลองเปลี่ยนประเภท ช่วงเวลา หรือเลือกระยะทางที่กว้างขึ้น
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredFeatures.map((item) => (
            <NearbyPostCard
              key={item.feature.properties.id}
              item={item}
              currentLocation={currentLocation}
              selectedPostId={selectedPostId}
              onSelectPost={onSelectPost}
            />
          ))}
        </div>
      )}
    </div>
  );
}
