import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import L from 'leaflet';
import { Popup } from 'react-leaflet';

import {
  PET_TYPE_LABEL,
  POST_TYPE_LABEL,
} from '@/components/map/map.constants';
import { formatPostDate } from '@/components/map/map.utils';

import type { MapPostFeature } from '@/types/map';

interface MapMarkerPopupProps {
  /** feature ที่ใช้เติมข้อมูลใน popup ของ marker */
  feature: MapPostFeature;
}

/** Popup สรุปประกาศที่คงข้อมูล ลิงก์ ปุ่มปิด และ dark-mode styling เดิม */
export function MapMarkerPopup({ feature }: MapMarkerPopupProps) {
  const { properties } = feature;
  const location = [properties.district, properties.province]
    .filter(Boolean)
    .join(', ');

  /** เติมชื่อปุ่มปิดที่ Leaflet สร้างเองหลัง popup ถูกเพิ่มลงแผนที่ */
  const handlePopupAdd = useCallback((event: L.LeafletEvent) => {
    const popup = event.target as L.Popup;
    const closeButton = popup
      .getElement()
      ?.querySelector<HTMLAnchorElement>('.leaflet-popup-close-button');

    closeButton?.setAttribute('aria-label', 'ปิดรายละเอียดประกาศ');
  }, []);
  const popupEventHandlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({ add: handlePopupAdd }),
    [handlePopupAdd],
  );

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
    <Popup
      className="pawnd-map-popup [&_.leaflet-popup-close-button]:!top-2 [&_.leaflet-popup-close-button]:!right-2 [&_.leaflet-popup-close-button]:!flex [&_.leaflet-popup-close-button]:!size-9 [&_.leaflet-popup-close-button]:!items-center [&_.leaflet-popup-close-button]:!justify-center [&_.leaflet-popup-close-button]:!rounded-full [&_.leaflet-popup-close-button]:!border [&_.leaflet-popup-close-button]:!border-border [&_.leaflet-popup-close-button]:!bg-background [&_.leaflet-popup-close-button]:!text-foreground [&_.leaflet-popup-close-button]:!shadow-sm [&_.leaflet-popup-close-button]:transition-colors [&_.leaflet-popup-close-button]:hover:!bg-muted [&_.leaflet-popup-close-button]:focus-visible:!outline-none [&_.leaflet-popup-close-button]:focus-visible:!ring-3 [&_.leaflet-popup-close-button]:focus-visible:!ring-ring/40 dark:[&_.leaflet-popup-content-wrapper]:!border dark:[&_.leaflet-popup-content-wrapper]:!border-border dark:[&_.leaflet-popup-content-wrapper]:!bg-card dark:[&_.leaflet-popup-content-wrapper]:!text-card-foreground dark:[&_.leaflet-popup-content-wrapper]:!shadow-xl dark:[&_.leaflet-popup-tip]:!border dark:[&_.leaflet-popup-tip]:!border-border dark:[&_.leaflet-popup-tip]:!bg-card dark:[&_.leaflet-popup-tip]:!shadow-lg"
      maxWidth={260}
      eventHandlers={popupEventHandlers}
    >
      <article className="w-56 overflow-hidden rounded-xl bg-card text-card-foreground">
        {/* รูปภาพปกของประกาศหรือ placeholder เมื่อไม่มีรูป */}
        <div className="relative h-28 overflow-hidden rounded-xl bg-muted">
          {properties.thumbnailUrl ? (
            <Image
              src={properties.thumbnailUrl}
              alt={displayPetName}
              fill
              sizes="224px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <MapPin className="size-8" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* รายละเอียดสำคัญที่ช่วยตัดสินใจเปิดดูประกาศต่อ */}
        <div className="space-y-1.5 px-1 pt-3">
          <p
            className={`text-xs font-bold ${
              properties.postType === 'LOST'
                ? 'text-destructive'
                : 'text-primary dark:text-chart-2'
            }`}
          >
            {POST_TYPE_LABEL[properties.postType]}
          </p>
          <h3 className="line-clamp-1 text-base font-bold text-foreground">
            {displayPetName}
          </h3>
          <p className="text-xs font-medium text-foreground/75">
            {PET_TYPE_LABEL[properties.petType]}
            {properties.breed ? ` · ${properties.breed}` : ''}
          </p>
          <p className="line-clamp-1 text-xs font-medium text-foreground/75">
            {location || 'ไม่ระบุพื้นที่'}
          </p>
          <p className="text-[11px] font-medium text-foreground/75">
            วันที่ประกาศ: {formatPostDate(properties.eventDate)}
          </p>
        </div>

        {/* ลิงก์ไปหน้า Pet Post Detail ตาม route ที่มีอยู่ใน frontend */}
        <Link
          href={`/posts/${properties.id}`}
          className="mt-3 flex min-h-10 items-center justify-center rounded-xl bg-primary px-3 text-xs font-semibold !text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          ดูรายละเอียดประกาศ
        </Link>
      </article>
    </Popup>
  );
}
