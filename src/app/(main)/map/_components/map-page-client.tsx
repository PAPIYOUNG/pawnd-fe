'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  AlertCircle,
  Clock3,
  ListFilter,
  MapPin,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import type {
  CurrentLocation,
  MapDataState,
  MapViewportState,
} from '@/types/map';
import type { PetType, PostType } from '@/types/post';

/**
 * โหลด Leaflet เฉพาะฝั่ง browser เพื่อไม่ให้ SSR เรียกใช้ window/document
 * และแสดง placeholder ที่มีขนาดใกล้เคียงกับแผนที่ระหว่างโหลด bundle
 */
const RealLeafletMap = dynamic(
  () => import('@/components/map/RealLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] min-h-[480px] w-full items-center justify-center bg-muted/60 lg:h-[calc(100vh-220px)]">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <p className="text-sm font-medium text-muted-foreground">
            กำลังโหลดแผนที่...
          </p>
        </div>
      </div>
    ),
  },
);

const DEFAULT_MAP_CENTER: [number, number] = [13.7563, 100.5018];
const MAP_CENTER_COMPARISON_EPSILON = 1e-7;

const POST_TYPE_LABEL: Record<PostType, string> = {
  LOST: 'สัตว์หาย',
  FOUND: 'พบสัตว์พลัดหลง',
};

const PET_TYPE_LABEL: Record<PetType, string> = {
  DOG: 'สุนัข',
  CAT: 'แมว',
  BIRD: 'นก',
  HAMSTER: 'แฮมสเตอร์',
  EXOTIC: 'สัตว์พิเศษ',
  OTHER: 'สัตว์เลี้ยง',
};

type PostTypeFilter = 'ALL' | PostType;
type TimeFilter = 'ALL' | 'ONE_DAY' | 'SEVEN_DAYS' | 'THIRTY_DAYS';
type DistanceFilter = 'ALL' | '5' | '10' | '25';

interface MapSidebarProps {
  /** ข้อมูล marker ชุดเดียวกับที่แสดงบน Leaflet map */
  data: MapDataState;
  /** จุดกึ่งกลาง viewport สำหรับคำนวณระยะทางโดยประมาณในรายการ */
  center: [number, number];
  /** ประเภทที่ถูกเลือกจะถูกส่งเข้า GET /map/posts ผ่าน prop ของแผนที่ */
  postTypeFilter: PostTypeFilter;
  /** callback เปลี่ยน filter ประเภทที่ Backend รองรับจริง */
  onPostTypeFilterChange: (filter: PostTypeFilter) => void;
  /** ตำแหน่งปัจจุบันใช้เปิดใช้งาน distance filter และคำนวณระยะ */
  currentLocation: CurrentLocation | null;
  /** ระยะทางที่เลือกจะถูกส่งให้ GET /map/posts/nearby */
  distanceFilter: DistanceFilter;
  /** callback เปลี่ยนระยะทางใน state ของหน้า Map */
  onDistanceFilterChange: (filter: DistanceFilter) => void;
  /** ช่วงเวลาที่ใช้กรอง visible posts ด้วย createdAt จาก API */
  timeFilter: TimeFilter;
  /** callback เปลี่ยนช่วงเวลาโดยไม่สั่ง movement ของแผนที่ */
  onTimeFilterChange: (filter: TimeFilter) => void;
  /** post id ที่กำลังถูกเลือกเพื่อเน้นการ์ดให้ตรงกับ marker */
  selectedPostId: string | null;
  /** callback ส่ง post id จากการ์ดไปให้แผนที่โฟกัสและเปิด popup */
  onSelectPost: (postId: string) => void;
}

/**
 * คำนวณระยะทางเส้นตรงโดยประมาณระหว่างจุดสองจุดด้วย Haversine formula
 * ใช้เฉพาะเพื่อแสดงผลใน sidebar เพราะ GET /map/posts ไม่ได้คืน distanceKm
 */
function calculateDistanceKm(
  first: [number, number],
  second: [number, number],
): number {
  const earthRadiusKm = 6371;
  const latitudeDelta = ((second[0] - first[0]) * Math.PI) / 180;
  const longitudeDelta = ((second[1] - first[1]) * Math.PI) / 180;
  const firstLatitude = (first[0] * Math.PI) / 180;
  const secondLatitude = (second[0] * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.sin(longitudeDelta / 2) ** 2 *
      Math.cos(firstLatitude) *
      Math.cos(secondLatitude);

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

/** แสดงระยะทางให้กระชับและอ่านง่ายทั้งบนมือถือและ desktop */
function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} ม.`;
  }

  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} กม.`;
}

/** กรองวันที่ของประกาศในฝั่ง client โดยไม่ส่ง query ที่ Backend ไม่รองรับ */
function matchesTimeFilter(
  createdAt: string | null | undefined,
  filter: TimeFilter,
): boolean {
  if (filter === 'ALL') {
    return true;
  }

  if (!createdAt) {
    return false;
  }

  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  const days = filter === 'ONE_DAY' ? 1 : filter === 'SEVEN_DAYS' ? 7 : 30;
  const now = Date.now();
  const createdTimestamp = parsedDate.getTime();
  return (
    createdTimestamp <= now &&
    createdTimestamp >= now - days * 24 * 60 * 60 * 1000
  );
}

/**
 * Sidebar สำหรับค้นหาและอ่านรายการประกาศจาก API ชุดเดียวกับ marker
 * รับ visible posts ที่กรองเวลาแล้ว และกรองค้นหา/ระยะทางต่อบนข้อมูลที่โหลดอยู่
 */
function MapSidebar({
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
}: MapSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeatures = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('th-TH');
    const maxDistance =
      distanceFilter === 'ALL' ? null : Number(distanceFilter);

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
          (maxDistance === null || distanceKm <= maxDistance)
        );
      })
      .sort((first, second) => first.distanceKm - second.distanceKm);
  }, [center, data.features, distanceFilter, postTypeFilter, searchTerm]);

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
          ค้นหาประกาศในขอบเขตแผนที่ปัจจุบันและเปิดรายละเอียดได้จากรายการ
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 py-4 sm:px-6">
        {/* ค้นหาแบบ visual: กรองรายการที่โหลดแล้ว ไม่ส่ง q ไป Backend */}
        <label className="relative block">
          <span className="sr-only">ค้นหาชื่อสัตว์หรือพื้นที่</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
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
                onTimeFilterChange(event.target.value as TimeFilter)
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
                onDistanceFilterChange(event.target.value as DistanceFilter)
              }
              className="h-10 w-full rounded-xl border border-border bg-background px-2.5 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="ALL">ทุกระยะ</option>
              <option value="5">ภายใน 5 กม.</option>
              <option value="10">ภายใน 10 กม.</option>
              <option value="25">ภายใน 25 กม.</option>
            </select>
          </label>
        </div>
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
            {distanceFilter === 'ALL' ? 'ตามขอบเขตแผนที่' : 'จากตำแหน่งของคุณ'}
          </span>
        </div>

        {/* รายการประกาศจริงจาก GET /map/posts */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {data.isLoading && data.features.length === 0 ? (
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
              <AlertCircle
                className="size-7 text-destructive"
                aria-hidden="true"
              />
              <p className="mt-2 text-xs font-semibold text-foreground">
                โหลดรายการไม่สำเร็จ
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                ใช้ปุ่ม “ลองใหม่” บนแผนที่เพื่อโหลดข้อมูลอีกครั้ง
              </p>
            </div>
          ) : filteredFeatures.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-4 py-10 text-center">
              <MapPin
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="mt-2 text-xs font-semibold text-foreground">
                ไม่พบประกาศที่ตรงกับตัวกรอง
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                ลองเปลี่ยนประเภท ค้นหา หรือเลื่อนแผนที่ไปยังพื้นที่อื่น
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredFeatures.map(({ feature, distanceKm }) => {
                const { properties } = feature;

                return (
                  <button
                    key={properties.id}
                    type="button"
                    aria-pressed={selectedPostId === properties.id}
                    onClick={() => onSelectPost(properties.id)}
                    className={`group flex w-full gap-3 rounded-2xl border p-3 text-left transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 ${
                      selectedPostId === properties.id
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {properties.thumbnailUrl ? (
                        <Image
                          src={properties.thumbnailUrl}
                          alt={properties.petName ?? 'รูปสัตว์เลี้ยง'}
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
                        {properties.petName ?? 'ไม่ระบุชื่อสัตว์เลี้ยง'}
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
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/**
 * หน้าหลัก Map: ใช้ Header/Footer จาก main layout เดิม และจัด content เป็น
 * sidebar 300px + แผนที่ responsive โดยไม่เพิ่มข้อมูลตัวอย่างใน production
 */
export function MapPageClient() {
  const [postTypeFilter, setPostTypeFilter] = useState<PostTypeFilter>('ALL');
  const [mapData, setMapData] = useState<MapDataState>({
    features: [],
    isLoading: true,
    errorMessage: null,
  });
  const [viewportCenter, setViewportCenter] =
    useState<[number, number]>(DEFAULT_MAP_CENTER);
  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocation | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectionRequestToken, setSelectionRequestToken] = useState(0);

  const handleDataStateChange = useCallback((nextState: MapDataState) => {
    setMapData(nextState);
  }, []);

  const handleViewportChange = useCallback((viewport: MapViewportState) => {
    setViewportCenter((currentCenter) => {
      const isSameCenter =
        Math.abs(currentCenter[0] - viewport.center[0]) <=
          MAP_CENTER_COMPARISON_EPSILON &&
        Math.abs(currentCenter[1] - viewport.center[1]) <=
          MAP_CENTER_COMPARISON_EPSILON;

      return isSameCenter ? currentCenter : viewport.center;
    });
  }, []);

  /**
   * กรองด้วย createdAt จริงจาก API เพียงครั้งเดียว แล้วส่ง array ชุดเดียวกัน
   * ให้ marker, sidebar list และตัวนับ โดยไม่เปลี่ยน viewport หรือเรียก API ใหม่
   */
  const visiblePosts = useMemo(
    () =>
      mapData.features.filter((feature) =>
        matchesTimeFilter(feature.properties.createdAt, timeFilter),
      ),
    [mapData.features, timeFilter],
  );
  const visibleMapData = useMemo<MapDataState>(
    () => ({ ...mapData, features: visiblePosts }),
    [mapData, visiblePosts],
  );

  /**
   * เปลี่ยนช่วงเวลาจาก user event และล้าง selection เฉพาะเมื่อ post เดิม
   * ไม่อยู่ในช่วงใหม่ จึงไม่มี effect ที่ setState หรือ movement loop
   */
  const handleTimeFilterChange = useCallback(
    (nextFilter: TimeFilter) => {
      setTimeFilter((currentFilter) =>
        currentFilter === nextFilter ? currentFilter : nextFilter,
      );
      setSelectedPostId((currentPostId) => {
        if (!currentPostId) {
          return currentPostId;
        }

        const selectedPost = mapData.features.find(
          (feature) => feature.properties.id === currentPostId,
        );
        return selectedPost &&
          matchesTimeFilter(selectedPost.properties.createdAt, nextFilter)
          ? currentPostId
          : null;
      });
    },
    [mapData.features],
  );

  /**
   * เลือก post ด้วย id และเพิ่ม token ทุกครั้ง เพื่อให้คลิก post เดิมซ้ำแล้ว
   * แผนที่ยังสั่ง flyTo/openPopup ใหม่ได้ โดยไม่มี state update จาก map event
   */
  const handleSelectPost = useCallback((postId: string) => {
    setSelectedPostId((currentPostId) =>
      currentPostId === postId ? currentPostId : postId,
    );
    setSelectionRequestToken((token) => token + 1);
  }, []);

  /**
   * ขอ permission เมื่อผู้ใช้กดปุ่ม แล้วเก็บ latitude/longitude ใน React state เท่านั้น
   * แปลง error ของ Browser เป็นข้อความที่ผู้ใช้เข้าใจได้โดยไม่เปิดเผยรายละเอียดเทคนิค
   */
  const handleRequestCurrentLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationError('เบราว์เซอร์นี้ไม่รองรับการค้นหาตำแหน่งปัจจุบัน');
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'ไม่สามารถใช้ตำแหน่งได้ เพราะยังไม่ได้รับอนุญาต กรุณาอนุญาตตำแหน่งในการตั้งค่าเบราว์เซอร์แล้วลองใหม่'
            : error.code === error.TIMEOUT
              ? 'ใช้เวลาค้นหาตำแหน่งนานเกินไป กรุณาลองใหม่อีกครั้ง'
              : 'ไม่สามารถค้นหาตำแหน่งปัจจุบันได้ กรุณาตรวจสอบการตั้งค่าตำแหน่งแล้วลองใหม่';
        setLocationError(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const distanceRadiusKm =
    distanceFilter === 'ALL' ? undefined : Number(distanceFilter);
  const distanceOrigin: [number, number] = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : viewportCenter;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-muted/30">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Intro bar ของหน้า Map; Header global มีโลโก้และ navigation อยู่ด้านบนแล้ว */}
        <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              สำรวจพื้นที่รอบตัวคุณ
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              แผนที่สัตว์เลี้ยง
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              ดูประกาศสัตว์หายและพบสัตว์พลัดหลงจากข้อมูลจริงบนแผนที่แบบ
              interactive
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full bg-destructive"
                aria-hidden="true"
              />
              สัตว์หาย
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full bg-primary"
                aria-hidden="true"
              />
              พบสัตว์
            </span>
          </div>
        </header>

        {/* บนจอเล็ก sidebar จะอยู่ด้านบนและแผนที่จะเลื่อนลงด้านล่าง */}
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <MapSidebar
            data={visibleMapData}
            center={distanceOrigin}
            postTypeFilter={postTypeFilter}
            onPostTypeFilterChange={setPostTypeFilter}
            currentLocation={currentLocation}
            distanceFilter={distanceFilter}
            onDistanceFilterChange={setDistanceFilter}
            timeFilter={timeFilter}
            onTimeFilterChange={handleTimeFilterChange}
            selectedPostId={selectedPostId}
            onSelectPost={handleSelectPost}
          />

          <section
            aria-label="แผนที่ประกาศสัตว์เลี้ยง"
            className="relative min-h-[520px] overflow-hidden rounded-3xl border border-border bg-card p-1 shadow-sm sm:p-2 lg:min-h-[560px]"
          >
            <RealLeafletMap
              heightClass="h-[520px] min-h-[480px] sm:h-[640px] lg:h-[calc(100vh-220px)]"
              scrollWheelZoom
              postType={postTypeFilter === 'ALL' ? undefined : postTypeFilter}
              currentLocation={currentLocation}
              distanceRadiusKm={distanceRadiusKm}
              onRequestCurrentLocation={handleRequestCurrentLocation}
              isLocating={isLocating}
              locationError={locationError}
              selectedPostId={selectedPostId}
              selectionRequestToken={selectionRequestToken}
              visibleFeatures={visiblePosts}
              onDataStateChange={handleDataStateChange}
              onViewportChange={handleViewportChange}
            />
          </section>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden="true" />
          แตะ marker หรือรายการประกาศเพื่อเปิดรายละเอียดโพสต์
        </p>
      </div>
    </div>
  );
}
