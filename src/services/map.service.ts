import { apiFetch } from '@/lib/api/api-fetch';
import type {
  ApiEnvelope,
  MapPostFeatureCollection,
  MapPostsQuery,
  NearbyMapPostsQuery,
} from '@/types/map';

/** แกะ payload ที่อาจถูกครอบด้วย TransformInterceptor ของ Backend */
function unwrapMapResponse(
  response: MapPostFeatureCollection | ApiEnvelope<MapPostFeatureCollection>,
): MapPostFeatureCollection {
  if ('data' in response) {
    return response.data;
  }

  return response;
}

/**
 * ดึง marker ประกาศ ACTIVE ตามขอบเขต viewport จาก GET /map/posts
 * รองรับทั้ง response ที่ผ่าน TransformInterceptor และ payload ตรง
 * เพื่อให้ client ยังทำงานได้เมื่อเรียกผ่าน proxy หรือ mock API ในเครื่อง
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

  const response = await apiFetch<
    MapPostFeatureCollection | ApiEnvelope<MapPostFeatureCollection>
  >(`/map/posts?${searchParams.toString()}`, { signal });

  return unwrapMapResponse(response);
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

  const response = await apiFetch<
    MapPostFeatureCollection | ApiEnvelope<MapPostFeatureCollection>
  >(`/map/posts/nearby?${searchParams.toString()}`, { signal });

  return unwrapMapResponse(response);
}
