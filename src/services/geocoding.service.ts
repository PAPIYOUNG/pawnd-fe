import type { CurrentLocation } from '@/types/map';

interface ReverseGeocodeResponse {
  display_name?: string;
}

interface SearchGeocodeResponse {
  place_id?: number | string;
  display_name?: string;
  lat?: string;
  lon?: string;
}

export interface GeocodingSearchResult {
  id: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

/**
 * แปลงพิกัดที่ผู้ใช้เลือกบนแผนที่เป็นที่อยู่เต็มสำหรับแสดงในฟอร์ม
 * ใช้ Nominatim ของ OpenStreetMap ซึ่งเป็นผู้ให้บริการเดียวกับแผนที่ที่แสดงอยู่
 */
export async function reverseGeocode(
  location: CurrentLocation,
  signal?: AbortSignal,
): Promise<string> {
  const searchParams = new URLSearchParams({
    format: 'jsonv2',
    lat: String(location.latitude),
    lon: String(location.longitude),
    zoom: '18',
    'accept-language': 'th',
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${searchParams.toString()}`,
    {
      signal,
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed: ${response.status}`);
  }

  const result = (await response.json()) as ReverseGeocodeResponse;
  const displayName = result.display_name?.trim();

  if (!displayName) {
    throw new Error('ไม่พบชื่อสถานที่จากพิกัดที่เลือก');
  }

  return displayName;
}

/** ค้นหาสถานที่จากข้อความที่ผู้ใช้กดส่งเองใน popup เลือกพิกัด */
export async function searchGeocodingPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodingSearchResult[]> {
  const searchParams = new URLSearchParams({
    q: query.trim(),
    format: 'jsonv2',
    limit: '5',
    'accept-language': 'th',
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${searchParams.toString()}`,
    {
      signal,
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Place search failed: ${response.status}`);
  }

  const results = (await response.json()) as SearchGeocodeResponse[];

  return results.flatMap((result, index) => {
    const displayName = result.display_name?.trim();
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (
      !displayName ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return [];
    }

    return [
      {
        id: String(result.place_id ?? `${latitude}:${longitude}:${index}`),
        displayName,
        latitude,
        longitude,
      },
    ];
  });
}
