'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';

import { PET_TYPE_LABEL, POST_TYPE_LABEL } from './map-page.constants';
import { formatDistance } from './map-page.utils';
import type { NearbyPostCardProps } from './map-page.types';

/** การ์ดประกาศใกล้เคียงที่ส่ง feature เดิมกลับไปให้แผนที่โฟกัส */
export function NearbyPostCard({
  item,
  currentLocation,
  selectedPostId,
  onSelectPost,
}: NearbyPostCardProps) {
  const { feature, distanceKm } = item;
  const { properties } = feature;

  const isFound = properties.postType === 'FOUND';
  const defaultPetName = isFound ? 'ไม่ทราบชื่อ' : 'ไม่ระบุชื่อสัตว์เลี้ยง';
  const rawPetName = (properties.petName || '').trim();
  const displayPetName =
    rawPetName === '' ||
    rawPetName.toLowerCase() === 'unknown' ||
    /^[\s?？]+$/.test(rawPetName)
      ? defaultPetName
      : rawPetName;

  return (
    <button
      type="button"
      aria-pressed={selectedPostId === properties.id}
      onClick={() => onSelectPost(feature)}
      className={`group flex w-full gap-3 rounded-2xl border p-3 text-left transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 ${
        selectedPostId === properties.id
          ? 'border-primary bg-primary/10 shadow-sm'
          : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
      }`}
    >
      {/* รูป thumbnail หรือ placeholder เมื่อประกาศไม่มีรูป */}
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        {properties.thumbnailUrl ? (
          <Image
            src={properties.thumbnailUrl}
            alt={displayPetName}
            fill
            sizes="64px"
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <MapPin className="size-6" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* ข้อมูลสรุปที่ใช้ระบุตัวประกาศและระยะทาง */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-[10px] font-bold ${
              properties.postType === 'LOST'
                ? 'text-destructive'
                : 'text-primary'
            }`}
          >
            {POST_TYPE_LABEL[properties.postType]}
          </p>
          <span
            className="shrink-0 text-[10px] font-medium text-muted-foreground"
            title={
              currentLocation
                ? 'ระยะทางจากตำแหน่งปัจจุบันของคุณ'
                : 'ระยะทางโดยประมาณจากจุดกึ่งกลางแผนที่'
            }
          >
            {formatDistance(distanceKm)}
          </span>
        </div>
        <h3 className="mt-0.5 truncate text-sm font-bold text-foreground">
          {displayPetName}
        </h3>
        <p className="mt-1 truncate text-[11px] text-muted-foreground">
          {PET_TYPE_LABEL[properties.petType]}
          {properties.breed ? ` · ${properties.breed}` : ''}
        </p>
        <p className="mt-1 truncate text-[10px] text-muted-foreground">
          {[properties.district, properties.province]
            .filter(Boolean)
            .join(', ') || 'ไม่ระบุพื้นที่'}
        </p>
      </div>
    </button>
  );
}
