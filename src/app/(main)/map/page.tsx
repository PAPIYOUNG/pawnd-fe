import type { Metadata } from 'next';

import { MapPageClient } from './_components/map-page-client';

export const metadata: Metadata = {
  title: 'แผนที่สัตว์เลี้ยง',
  description: 'สำรวจตำแหน่งประกาศสัตว์เลี้ยงหายและพบสัตว์พลัดหลงบนแผนที่',
};

/**
 * หน้า Map route แบบ Server Component ที่วาง client boundary ไว้เฉพาะส่วน Leaflet
 */
export default function MapPage() {
  return <MapPageClient />;
}
