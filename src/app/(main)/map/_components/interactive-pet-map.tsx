'use client';

import { useState, useEffect, type ComponentType } from 'react';

interface MapProps {
  heightClass?: string;
}

/**
 * InteractivePetMap Component (Client Component)
 * - ส่วนแสดงแผนที่ Leaflet ในหน้าค้นหาแบบ Interactive
 */
export function InteractivePetMap() {
  const [MapComponent, setMapComponent] = useState<ComponentType<MapProps> | null>(null);

  useEffect(() => {
    import('@/components/map/RealLeafletMap').then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  return (
    <div className="relative h-[75vh] w-full overflow-hidden rounded-3xl border border-border/80 shadow-lg bg-muted/20">
      {MapComponent ? (
        <MapComponent heightClass="h-full" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          กำลังโหลดแผนที่ดาวเทียม...
        </div>
      )}
    </div>
  );
}
