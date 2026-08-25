'use client';

import { useCallback, useState } from 'react';

import type { CurrentLocation } from '@/types/map';

/** ค่าที่หน้า Map ต้องใช้จาก Browser Geolocation lifecycle */
interface UseCurrentLocationResult {
  currentLocation: CurrentLocation | null;
  isLocating: boolean;
  locationError: string | null;
  requestCurrentLocation: () => void;
}

/**
 * ขอและเก็บ current location ไว้ใน React state ของหน้านี้เท่านั้น
 * คงข้อความ error, options และ callback behavior จาก MapPageClient เดิม
 */
export function useCurrentLocation(): UseCurrentLocationResult {
  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  /** ขอ permission เมื่อผู้ใช้กดปุ่ม แล้วแปลง Browser error เป็นข้อความที่อ่านง่าย */
  const requestCurrentLocation = useCallback(() => {
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

  return {
    currentLocation,
    isLocating,
    locationError,
    requestCurrentLocation,
  };
}
