import type { PetType, PostType } from './post';

/**
 * ข้อมูลสรุปของประกาศที่ Backend อนุญาตให้แสดงบนแผนที่
 * ใช้เป็นข้อมูลสำหรับ marker และ popup โดยไม่ดึงรายละเอียดส่วนตัวเกินจำเป็น
 */
export interface MapPostProperties {
  id: string;
  postType: PostType;
  petName: string | null;
  petType: PetType;
  breed: string | null;
  province: string | null;
  district: string | null;
  eventDate: string;
  createdAt: string;
  thumbnailUrl: string | null;
  /** ระยะทางจากตำแหน่งผู้ใช้ มีเฉพาะ response จาก GET /map/posts/nearby */
  distanceKm?: number;
}

/** พิกัดปัจจุบันที่เก็บเฉพาะใน React state ของหน้า Map */
export interface CurrentLocation {
  latitude: number;
  longitude: number;
}

/**
 * GeoJSON point feature ที่ใช้เป็น marker หนึ่งจุดบน Leaflet map
 * coordinates ใช้ลำดับ longitude ก่อน latitude ตาม contract ของ Backend
 */
export interface MapPostFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: MapPostProperties;
}

/**
 * กลุ่มข้อมูล marker ที่ Backend ส่งกลับจาก GET /map/posts
 */
export interface MapPostFeatureCollection {
  type: 'FeatureCollection';
  features: MapPostFeature[];
}

/**
 * ขอบเขต viewport ที่ Leaflet ส่งกลับมาเพื่อใช้โหลดข้อมูลตามพื้นที่ที่มองเห็น
 */
export interface MapViewportBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

/**
 * สถานะ viewport ปัจจุบันของแผนที่ รวมจุดกึ่งกลางสำหรับคำนวณระยะทางใน sidebar
 */
export interface MapViewportState {
  bounds: MapViewportBounds;
  center: [number, number];
}

/**
 * สถานะข้อมูลร่วมระหว่างแผนที่กับ sidebar โดยใช้ response ชุดเดียวกันจาก API
 */
export interface MapDataState {
  features: MapPostFeature[];
  isLoading: boolean;
  errorMessage: string | null;
}

/**
 * ขอบเขต viewport ที่ส่งให้ Backend เพื่อโหลด marker เฉพาะพื้นที่ที่มองเห็น
 */
export interface MapPostsQuery {
  south: number;
  west: number;
  north: number;
  east: number;
  type?: PostType;
  petType?: PetType;
  limit?: number;
}

/** Query ที่ตรงกับ NearbyPostQueryDto ของ Backend */
export interface NearbyMapPostsQuery extends CurrentLocation {
  radiusKm: number;
  type?: PostType;
  petType?: PetType;
  limit?: number;
}

/**
 * รูปแบบ response กลางของ Nest TransformInterceptor
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
}
