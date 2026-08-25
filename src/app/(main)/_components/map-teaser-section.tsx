'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useEffect, useState, type ComponentType } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MapComponentProps {
  /** คลาสความสูงของแผนที่ตามพื้นที่ที่ Home จัดสรรให้ */
  heightClass?: string;
  /** เปิดการซูมด้วยล้อเมาส์ให้ behavior ตรงกับหน้า Map */
  scrollWheelZoom?: boolean;
}

/**
 * Map teaser ของหน้า Home ที่ใช้ RealLeafletMap ตัวเดียวกับหน้า Map
 * ข้อมูล marker, viewport loading, popup และสถานะต่าง ๆ จึงมาจาก API จริง
 */
export function MapTeaserSection() {
  const [LeafletMap, setLeafletMap] =
    useState<ComponentType<MapComponentProps> | null>(null);

  /** โหลด Leaflet เฉพาะฝั่ง browser เพื่อไม่ให้ SSR เรียกใช้ window/document */
  useEffect(() => {
    import('@/components/map/RealLeafletMap').then((module) => {
      setLeafletMap(() => module.default);
    });
  }, []);

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ส่วนหัวของ Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            สำรวจพื้นที่ผ่านแผนที่สัตว์เลี้ยงหาย
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            ดูตำแหน่งสัตว์ที่หายและพบในพื้นที่ของคุณแบบ Realtime
            เพื่อช่วยระวังภัยและค้นหาเบาะแสได้ไวขึ้น
          </p>
        </div>

        {/* กรอบแผนที่จริงที่ใช้ lifecycle และ API เดียวกับหน้า Map */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-md dark:border-border/60">
          {LeafletMap ? (
            <LeafletMap heightClass="h-[480px] sm:h-[540px]" scrollWheelZoom />
          ) : (
            <div className="flex h-[480px] w-full items-center justify-center rounded-3xl bg-muted/60 sm:h-[540px]">
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <span className="text-sm font-medium text-muted-foreground">
                  กำลังโหลดแผนที่...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ปุ่ม CTA เปิดดูแผนที่เต็มจอ */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/map"
            className={cn(
              buttonVariants({ variant: 'default', size: 'lg' }),
              'rounded-2xl bg-primary px-7 py-6 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 hover:bg-primary/90',
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
