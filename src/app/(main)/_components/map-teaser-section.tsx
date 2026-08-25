'use client';

import { useState, useEffect, useRef, type ComponentType } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Navigation,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ข้อมูลจำลองรายการสัตว์เลี้ยงหายและพบในระยะใกล้เคียงครบทั้ง 6 รายการ (6 Nearby Pet Cases)
const NEARBY_PET_CASES = [
  {
    id: 'mock-1',
    name: 'น้องส้มส้ม',
    breed: 'แมวไทย สีส้มลายเสือ',
    type: 'LOST' as const,
    distance: '1.2 กม.',
    location: 'อ่อนนุช 46, กทม.',
    imageUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'mock-2',
    name: 'ไซบีเรียนเพศผู้',
    breed: 'ไซบีเรียน ฮัสกี้',
    type: 'FOUND' as const,
    distance: '2.5 กม.',
    location: 'ถ.งามวงศ์วาน, นนทบุรี',
    imageUrl:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'mock-3',
    name: 'ช็อกโก้',
    breed: 'พุดเดิ้ลทอย สีน้ำตาล',
    type: 'LOST' as const,
    distance: '3.1 กม.',
    location: 'ลาดพร้าว 101, กทม.',
    imageUrl:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'mock-4',
    name: 'แมวไทยสีขาวตาโต',
    breed: 'พันธุ์ไทย เพศเมีย',
    type: 'FOUND' as const,
    distance: '3.8 กม.',
    location: 'ม.เกษตรศาสตร์ บางเขน',
    imageUrl:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'mock-5',
    name: 'น้องมิลค์กี้',
    breed: 'ปอมเมอเรเนียน สีขาว',
    type: 'LOST' as const,
    distance: '4.2 กม.',
    location: 'พหลโยธิน 24, จตุจักร',
    imageUrl:
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'mock-6',
    name: 'โกลเด้นท์เพศเมีย',
    breed: 'โกลเด้น รีทรีฟเวอร์',
    type: 'FOUND' as const,
    distance: '4.7 กม.',
    location: 'รัชดาภิเษก 32, กทม.',
    imageUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=200&auto=format&fit=crop',
  },
];

interface MapComponentProps {
  heightClass?: string;
}

/**
 * MapTeaserSection Component (Client Component)
 * - ส่วนแสดงแผนที่จริงของประเทศไทย (Interactive Real Map Teaser)
 * - โหลดคอมโพเนนต์แผนที่ผ่าน Client State Loader ป้องกัน React DevTools Suspense Cleanup Error อย่างเด็ดขาด 100%
 * - สัดส่วนการ์ดพอดีกับหน้าจอมือถือ ไม่ล้นขอบ ไม่ถูกตัดขาด และรูดเลื่อนได้อย่างสมบูรณ์แบบ
 * - ผูก L.DomEvent.disableScrollPropagation ป้องกัน Leaflet แย่ง Touch Events บนมือถือ
 */
export function MapTeaserSection() {
  // State เก็บ Component แผนที่เมื่อโหลดสำเร็จฝั่ง Client (ป้องกัน Suspense Conflict กับ Next.js Loading Boundary)
  const [LeafletMap, setLeafletMap] = useState<ComponentType<MapComponentProps> | null>(null);
  const [GoogleMap, setGoogleMap] = useState<ComponentType<MapComponentProps> | null>(null);

  // State สลับผู้ให้บริการแผนที่: 'leaflet' (OpenStreetMap) หรือ 'google' (Google Maps)
  const [mapProvider, setMapProvider] = useState<'leaflet' | 'google'>('leaflet');

  // State ย่อ/ขยายการ์ดแจ้งเตือนจุดเสี่ยงรอบตัว
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const scrollListRef = useRef<HTMLDivElement>(null);

  // โหลด Module แผนที่ฝั่ง Client โดยตรง
  useEffect(() => {
    import('@/components/map/RealLeafletMap').then((mod) => {
      setLeafletMap(() => mod.default);
    });
    import('@/components/map/GoogleMapsEmbed').then((mod) => {
      setGoogleMap(() => mod.default);
    });
  }, []);

  // จัดการ Leaflet DomEvent ป้องกันการแทรกแซง Touch Gesture บนหน้าจอมือถือ
  useEffect(() => {
    const scrollEl = scrollListRef.current;
    if (!scrollEl) return;

    import('leaflet').then((L) => {
      if (scrollEl) {
        L.DomEvent.disableScrollPropagation(scrollEl);
        L.DomEvent.disableClickPropagation(scrollEl);
      }
    });
  }, [isPanelExpanded, LeafletMap]);

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 1. ส่วนหัวของ Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            สำรวจพื้นที่ผ่านแผนที่สัตว์เลี้ยงหาย
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            ดูตำแหน่งสัตว์ที่หายและพบในพื้นที่ของคุณแบบ Realtime เพื่อช่วยระวังภัยและค้นหาเบาะแสได้ไวขึ้น
          </p>
        </div>

        {/* 2. กรอบแสดงแผนที่จริง (Real Map Container) */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-md dark:border-border/60">
          {/* เรนเดอร์แผนที่ตาม Provider ที่เลือก */}
          {mapProvider === 'leaflet' ? (
            LeafletMap ? (
              <LeafletMap heightClass="h-[480px] sm:h-[540px]" />
            ) : (
              <div className="flex h-[480px] w-full items-center justify-center rounded-3xl bg-muted/60 sm:h-[540px]">
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <span className="text-sm font-medium text-muted-foreground">
                    กำลังโหลดแผนที่ดาวเทียมและพิกัดสัตว์เลี้ยง...
                  </span>
                </div>
              </div>
            )
          ) : GoogleMap ? (
            <GoogleMap heightClass="h-[480px] sm:h-[540px]" />
          ) : (
            <div className="flex h-[480px] w-full items-center justify-center rounded-3xl bg-muted/60 sm:h-[540px]">
              <span className="text-sm font-medium text-muted-foreground">
                กำลังโหลด Google Maps...
              </span>
            </div>
          )}

          {/* 3. การ์ดข้อมูลลอยตัวพร้อมฟังก์ชัน "ย่อ-ขยายได้ (Collapsible Nearby Panel)"
              วางไว้ที่ top-14 left-3 (มือถือ) / top-20 left-6 (เดสก์ท็อป) ไม่บังปุ่มซูมมุมบนซ้าย */}
          <div
            className="absolute top-14 left-3 z-[400] transition-all duration-300 ease-in-out sm:top-20 sm:left-6"
            onWheel={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {isPanelExpanded ? (
              /* การ์ดแบบขยายเต็ม (Expanded View) - ปรับสัดส่วนให้กะทัดรัดและพอดีกับจอมือถือ */
              <div className="w-[270px] sm:w-[310px] rounded-2xl border border-border/80 bg-white/95 p-3 shadow-lg backdrop-blur-md transition-all sm:p-4 dark:bg-card/95 dark:border-border">
                {/* ส่วนหัวการ์ด พร้อมปุ่มกดย่อการ์ด */}
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground sm:text-sm">
                    <Navigation className="size-3.5 sm:size-4 text-primary" />
                    <span>จุดเสี่ยงในพิกัดของคุณ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                      6 เคส
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPanelExpanded(false)}
                      className="flex size-6 sm:size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="ย่อการ์ดแจ้งเตือนจุดเสี่ยง"
                      title="ย่อการ์ดเพื่อดูแผนที่เต็มตา"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                  พบสัตว์เลี้ยงหาย 6 รายการ และแจ้งพบ 3 รายการ ในระยะ 5 กม.
                </p>

                {/* List รายการสัตว์เลี้ยงในระยะใกล้ครบทั้ง 6 รายการ */}
                <div className="mt-2.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      เคสล่าสุดใกล้คุณ (6 เคส)
                    </span>
                    <span className="text-[10px] text-primary font-semibold">
                      ระยะ 5 กม.
                    </span>
                  </div>

                  {/* กล่อง Scroll รายการ 6 เคส (รองรับ Mobile Touch Scroll อย่างสมบูรณ์แบบ) */}
                  <div
                    ref={scrollListRef}
                    className="flex max-h-[145px] sm:max-h-[200px] flex-col gap-1.5 overflow-y-auto overscroll-contain pr-1 touch-pan-y"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      touchAction: 'pan-y',
                    }}
                  >
                    {NEARBY_PET_CASES.map((pet) => (
                      <Link
                        key={pet.id}
                        href={`/posts/${pet.id}`}
                        className="group flex items-center gap-2 rounded-xl border border-border/60 bg-background/90 p-1.5 transition-all hover:border-primary/50 hover:bg-muted/60"
                      >
                        {/* รูปสัตว์เลี้ยงขนาดย่อ */}
                        <div className="relative size-9 shrink-0 overflow-hidden rounded-lg sm:size-10">
                          <Image
                            src={pet.imageUrl}
                            alt={pet.name}
                            fill
                            sizes="40px"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>

                        {/* ข้อมูลสัตว์เลี้ยงและระยะทาง */}
                        <div className="flex flex-1 flex-col overflow-hidden">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate text-[11px] font-bold text-foreground sm:text-xs">
                              {pet.name}
                            </span>
                            <span
                              className={cn(
                                'shrink-0 rounded-[4px] px-1.5 py-0.2 text-[9px] font-bold',
                                pet.type === 'LOST'
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              )}
                            >
                              {pet.type === 'LOST' ? 'หาย' : 'พบ'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground">
                            <span className="truncate">{pet.location}</span>
                            <span className="shrink-0 font-bold text-primary">
                              {pet.distance}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="size-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* การ์ดแบบย่อขนาดกะทัดรัด (Collapsed Pill Button) */
              <button
                type="button"
                onClick={() => setIsPanelExpanded(true)}
                className="group flex items-center gap-2 rounded-2xl border border-border/80 bg-white/95 px-3 py-1.5 text-xs font-bold text-foreground shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-muted/90 dark:bg-card/95 dark:border-border"
                aria-label="ขยายการ์ดแจ้งเตือนจุดเสี่ยง"
              >
                <div className="flex size-5.5 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-3" />
                </div>
                <span className="text-[11px] sm:text-xs">จุดเสี่ยงพิกัดคุณ (6 เคส)</span>
                <span className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-hover:text-foreground">
                  <ChevronDown className="size-3.5" />
                </span>
              </button>
            )}
          </div>

          {/* 4. ปุ่มเครื่องมือสลับเวอร์ชันแผนที่ (Provider Switcher) มุมบนขวา */}
          <div className="absolute top-4 right-4 z-[400] flex items-center gap-1 rounded-2xl border border-border/70 bg-white/90 p-1 shadow-sm backdrop-blur-xs dark:bg-card/90">
            <button
              type="button"
              onClick={() => setMapProvider('leaflet')}
              className={cn(
                'flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium transition-colors',
                mapProvider === 'leaflet'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Layers className="size-3.5" />
              <span>OpenStreetMap</span>
            </button>
            <button
              type="button"
              onClick={() => setMapProvider('google')}
              className={cn(
                'flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium transition-colors',
                mapProvider === 'google'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Google Maps</span>
            </button>
          </div>
        </div>

        {/* 5. ปุ่ม CTA เปิดดูแผนที่เต็มจอ */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/map"
            className={cn(
              buttonVariants({ variant: 'default', size: 'lg' }),
              'rounded-2xl bg-primary px-7 py-6 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 hover:bg-primary/90'
            )}
          >
            <MapPin className="size-4.5" />
            <span>ดูแผนที่เต็มจอ</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
