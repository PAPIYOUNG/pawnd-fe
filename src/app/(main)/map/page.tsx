import { Metadata } from 'next';
import { MapPin } from 'lucide-react';
import { InteractivePetMap } from './_components/interactive-pet-map';

export const metadata: Metadata = {
  title: 'แผนที่ค้นหาสัตว์เลี้ยงหาย (Pet Map) | PAWND',
  description: 'แผนที่แสดงพิกัดสัตว์เลี้ยงหายและจุดที่พบเห็นแบบเรียลไทม์ทั่วประเทศ',
};

/**
 * PetMapPage (Server Component - RSC)
 * - หน้าแผนที่ค้นหาสัตว์เลี้ยงพลัดหลงและจุดพบเห็นแบบเต็มรูปแบบ (Interactive Pet Map)
 */
export default function PetMapPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* ส่วนหัวหน้าแผนที่ */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2 text-primary">
          <MapPin className="size-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Realtime GPS Map
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          แผนที่ค้นหาสัตว์เลี้ยงพลัดหลง
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          สำรวจจุดที่สัตว์เลี้ยงหาย จุดที่มีผู้พบเห็นเบาะแส และแชร์ตำแหน่งของคุณ
        </p>
      </div>

      {/* แผนที่ Leaflet แบบเต็มพื้นที่ */}
      <InteractivePetMap />
    </div>
  );
}
