import {
  AlertCircle,
  LoaderCircle,
  LocateFixed,
  MapPin,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface MapControlsProps {
  /** callback ขอ current location; หากไม่มีจะไม่แสดงปุ่ม location */
  onRequestCurrentLocation?: () => void;
  /** สถานะและข้อความจาก Browser Geolocation API */
  isLocating: boolean;
  locationError?: string | null;
  /** สถานะ lifecycle ของ GET /map/posts */
  isLoading: boolean;
  errorMessage: string | null;
  /** จำนวน marker หลังใช้ visible filter สำหรับตัดสิน empty state */
  visibleFeatureCount: number;
  /** โหลด viewport เดิมซ้ำเมื่อผู้ใช้กด retry */
  onRetry: () => void;
}

/** Controls และ loading/error/empty overlays ที่วางเหนือ Leaflet map */
export function MapControls({
  onRequestCurrentLocation,
  isLocating,
  locationError,
  isLoading,
  errorMessage,
  visibleFeatureCount,
  onRetry,
}: MapControlsProps) {
  return (
    <>
      {/* ปุ่ม location ขอ permission เฉพาะเมื่อผู้ใช้กด */}
      {onRequestCurrentLocation && (
        <Button
          type="button"
          variant="outline"
          className="absolute top-4 right-4 z-[1000] min-h-11 rounded-2xl bg-card/95 px-3 shadow-md backdrop-blur-sm"
          onClick={onRequestCurrentLocation}
          disabled={isLocating}
          aria-label="ใช้ตำแหน่งปัจจุบันของฉัน"
        >
          {isLocating ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LocateFixed className="size-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {isLocating ? 'กำลังหาตำแหน่ง...' : 'ตำแหน่งของฉัน'}
          </span>
        </Button>
      )}

      {/* แจ้งข้อผิดพลาด geolocation แยกจาก error ของ API */}
      {locationError && (
        <div
          role="alert"
          className="absolute top-17 right-4 z-[1000] max-w-[min(18rem,calc(100%-2rem))] rounded-2xl border border-destructive/30 bg-card/95 px-3 py-2 text-xs text-foreground shadow-md backdrop-blur-sm"
        >
          {locationError}
        </div>
      )}

      {/* สถานะ loading ระหว่างรอข้อมูลหรือโหลดข้อมูลของ viewport ใหม่ */}
      {isLoading && (
        <div className="pointer-events-none absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-2xl border border-border bg-card/95 px-4 py-2 text-xs font-medium text-muted-foreground shadow-md backdrop-blur-sm">
          กำลังโหลดประกาศในพื้นที่...
        </div>
      )}

      {/* สถานะ error พร้อมปุ่ม retry โดยไม่แสดงรายละเอียด technical error */}
      {!isLoading && errorMessage && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/55 p-4 backdrop-blur-[2px]">
          <div className="flex max-w-sm flex-col items-center gap-3 rounded-3xl border border-destructive/30 bg-card p-6 text-center shadow-lg">
            <AlertCircle
              className="size-8 text-destructive"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-foreground">
              {errorMessage}
            </p>
            <Button
              type="button"
              variant="outline"
              className="min-h-10 rounded-2xl"
              onClick={onRetry}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              ลองใหม่
            </Button>
          </div>
        </div>
      )}

      {/* สถานะสำเร็จแต่ไม่มี marker ใน viewport ปัจจุบัน */}
      {!isLoading && !errorMessage && visibleFeatureCount === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[900] flex items-center justify-center p-4">
          <div className="rounded-3xl border border-border bg-card/95 px-5 py-4 text-center shadow-md backdrop-blur-sm">
            <MapPin
              className="mx-auto size-7 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-medium text-foreground">
              ยังไม่มีประกาศในพื้นที่นี้
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              ลองเลื่อนหรือซูมแผนที่เพื่อค้นหาพื้นที่อื่น
            </p>
          </div>
        </div>
      )}
    </>
  );
}
