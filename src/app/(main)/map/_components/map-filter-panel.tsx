'use client';

import { Clock3, ListFilter, Search, SlidersHorizontal } from 'lucide-react';

import type { MapFilterPanelProps } from './map-page.types';

/**
 * แผงค้นหาและตัวกรองของ sidebar ที่เป็น controlled UI
 * รับค่าและ callback จาก MapSidebar เพื่อไม่เปลี่ยนแหล่งเก็บ state เดิม
 */
export function MapFilterPanel({
  searchTerm,
  onSearchTermChange,
  postTypeFilter,
  onPostTypeFilterChange,
  currentLocation,
  distanceFilter,
  onDistanceFilterChange,
  timeFilter,
  onTimeFilterChange,
}: MapFilterPanelProps) {
  return (
    <>
      {/* ค้นหาแบบ visual: กรองรายการที่โหลดแล้ว ไม่ส่ง q ไป Backend */}
      <label className="relative block">
        <span className="sr-only">ค้นหาชื่อสัตว์หรือพื้นที่</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="ค้นหาชื่อสัตว์หรือพื้นที่"
          className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </label>

      {/* Filter ประเภทเดียวที่ส่งไป Backend ได้จริง */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
          <ListFilter className="size-3.5 text-primary" aria-hidden="true" />
          ประเภทประกาศ
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              {
                value: 'ALL',
                label: 'ทั้งหมด',
                dotClass: 'bg-muted-foreground',
              },
              {
                value: 'LOST',
                label: 'สัตว์หาย',
                dotClass: 'bg-destructive',
              },
              { value: 'FOUND', label: 'พบสัตว์', dotClass: 'bg-primary' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={postTypeFilter === option.value}
              onClick={() => onPostTypeFilterChange(option.value)}
              className={`flex min-h-10 items-center justify-center gap-1 rounded-xl border px-1 text-[11px] font-semibold transition-colors sm:text-xs ${
                postTypeFilter === option.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              <span
                className={`size-2 rounded-full ${option.dotClass}`}
                aria-hidden="true"
              />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter เวลากรอง marker/list/count ร่วมกัน ส่วนระยะทางเรียก nearby endpoint */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <Clock3 className="size-3.5" aria-hidden="true" />
            ช่วงเวลา
          </span>
          <select
            value={timeFilter}
            onChange={(event) =>
              onTimeFilterChange(event.target.value as typeof timeFilter)
            }
            className="h-10 w-full rounded-xl border border-border bg-background px-2.5 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            <option value="ALL">ทุกช่วงเวลา</option>
            <option value="ONE_DAY">1 วันที่ผ่านมา</option>
            <option value="SEVEN_DAYS">7 วันที่ผ่านมา</option>
            <option value="THIRTY_DAYS">30 วันที่ผ่านมา</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            ระยะทาง
          </span>
          <select
            value={distanceFilter}
            disabled={!currentLocation}
            onChange={(event) =>
              onDistanceFilterChange(
                event.target.value as typeof distanceFilter,
              )
            }
            className="h-10 w-full rounded-xl border border-border bg-background px-2.5 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="5">ภายใน 5 กม.</option>
            <option value="10">ภายใน 10 กม.</option>
            <option value="25">ภายใน 25 กม.</option>
            <option value="50">ภายใน 50 กม.</option>
          </select>
        </label>
      </div>
    </>
  );
}
