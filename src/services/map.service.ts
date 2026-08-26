import type {
  MapPostFeatureCollection,
  MapPostsQuery,
  NearbyMapPostsQuery,
} from '@/types/map';

/**
 * เรียก Route Handler ของฝั่ง Next.js เอง (/api/map/...) แทนการยิงตรงไป Backend จาก browser
 * เนื่องจาก Backend ยังไม่เปิด CORS ให้ origin ของ frontend การ fetch ตรงจาก client
 * จะโดนเบราว์เซอร์บล็อก (net::ERR_FAILED) — ให้ Next.js server เป็นคนยิงต่อให้แทน
 */
async function fetchMapProxy(
  path: string,
  searchParams: URLSearchParams,
  signal?: AbortSignal,
): Promise<MapPostFeatureCollection> {
  const response = await fetch(`${path}?${searchParams.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load map posts: ${response.status}`);
  }

  return (await response.json()) as MapPostFeatureCollection;
}

/**
 * ดึง marker ประกาศ ACTIVE ตามขอบเขต viewport จาก GET /api/map/posts (proxy)
 */
export async function getMapPosts(
  query: MapPostsQuery,
  signal?: AbortSignal,
): Promise<MapPostFeatureCollection> {
  const searchParams = new URLSearchParams({
    south: String(query.south),
    west: String(query.west),
    north: String(query.north),
    east: String(query.east),
  });

  if (query.type) {
    searchParams.set('type', query.type);
  }

  if (query.petType) {
    searchParams.set('petType', query.petType);
  }

  if (query.limit !== undefined) {
    searchParams.set('limit', String(query.limit));
  }

  return fetchMapProxy('/api/map/posts', searchParams, signal);
}

/**
 * ดึงประกาศรอบตำแหน่งผู้ใช้จาก GET /map/posts/nearby
 * ใช้ชื่อ latitude, longitude และ radiusKm ตรงตาม NearbyPostQueryDto เท่านั้น
 */
export async function getNearbyMapPosts(
  query: NearbyMapPostsQuery,
  signal?: AbortSignal,
): Promise<MapPostFeatureCollection> {
  const searchParams = new URLSearchParams({
    latitude: String(query.latitude),
    longitude: String(query.longitude),
    radiusKm: String(query.radiusKm),
  });

  if (query.type) {
    searchParams.set('type', query.type);
  }

  if (query.petType) {
    searchParams.set('petType', query.petType);
  }

  if (query.limit !== undefined) {
    searchParams.set('limit', String(query.limit));
  }

  return fetchMapProxy('/api/map/posts/nearby', searchParams, signal);
}
