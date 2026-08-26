'use client';

import { MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';

import { MapFilterPanel } from './map-filter-panel';
import { calculateDistanceKm } from './map-page.utils';
import { NearbyPostList } from './nearby-post-list';
import type { MapFilterPanelProps, MapSidebarProps } from './map-page.types';

/**
 * Sidebar ของหน้า Map ที่ประสาน filter, count และรายการ nearby
 * คงการกรองค้นหา/ประเภท/ระยะทางฝั่ง client ตาม implementation เดิม
 */
export function MapSidebar({
  data,
  center,
  postTypeFilter,
  onPostTypeFilterChange,
  currentLocation,
  distanceFilter,
  onDistanceFilterChange,
  timeFilter,
  onTimeFilterChange,
  selectedPostId,
  onSelectPost,
  onRequestCurrentLocation,
  isLocating,
  onRetry,
}: MapSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeatures = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('th-TH');
    const maxDistance = Number(distanceFilter);

    return data.features
      .map((feature) => {
        const [longitude, latitude] = feature.geometry.coordinates;
        const distanceKm =
          feature.properties.distanceKm ??
          calculateDistanceKm(center, [latitude, longitude]);

        return { feature, distanceKm };
      })
      .filter(({ feature, distanceKm }) => {
        const { properties } = feature;
        const searchableText = [
          properties.petName,
          properties.breed,
          properties.province,
          properties.district,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('th-TH');

        return (
          (postTypeFilter === 'ALL' ||
            properties.postType === postTypeFilter) &&
          (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
          distanceKm <= maxDistance
        );
      })
      .sort((first, second) => first.distanceKm - second.distanceKm);
  }, [center, data.features, distanceFilter, postTypeFilter, searchTerm]);

  const filterPanelProps: MapFilterPanelProps = {
    searchTerm,
    onSearchTermChange: setSearchTerm,
    postTypeFilter,
    onPostTypeFilterChange,
    currentLocation,
    distanceFilter,
    onDistanceFilterChange,
    timeFilter,
    onTimeFilterChange,
  };

  return (
    <aside className="flex min-h-0 flex-col rounded-3xl border border-border bg-card shadow-sm lg:h-[calc(100vh-220px)] lg:min-h-[560px]">
      {/* หัว sidebar */}
      <div className="border-b border-border px-5 pb-4 pt-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              PAWND MAP
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">
              แผนที่สัตว์เลี้ยง
            </h2>
          </div>
          <div
            className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <MapPin className="size-5" />
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          ค้นหาประกาศใกล้ตำแหน่งของคุณและเปิดรายละเอียดได้จากรายการ
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 py-4 sm:px-6">
        <MapFilterPanel {...filterPanelProps} />

        <p className="-mt-2 text-[10px] leading-relaxed text-muted-foreground">
          {currentLocation
            ? 'ระยะทางคำนวณจากตำแหน่งปัจจุบันของคุณ'
            : 'กดปุ่มตำแหน่งของฉันบนแผนที่เพื่อเปิดใช้ตัวกรองระยะทาง'}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              ประกาศใกล้เคียง
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {filteredFeatures.length}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            จากตำแหน่งของคุณ
          </span>
        </div>

        {/* รายการประกาศจริงจาก GET /map/posts/nearby */}
        <NearbyPostList
          data={data}
          filteredFeatures={filteredFeatures}
          currentLocation={currentLocation}
          selectedPostId={selectedPostId}
          onSelectPost={onSelectPost}
          onRequestCurrentLocation={onRequestCurrentLocation}
          isLocating={isLocating}
          onRetry={onRetry}
        />
      </div>
    </aside>
  );
}
