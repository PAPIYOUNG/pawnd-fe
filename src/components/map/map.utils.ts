import L from 'leaflet';

import { VIEWPORT_COMPARISON_EPSILON } from './map.constants';

import type { MapViewportState } from '@/types/map';
import type { PostType } from '@/types/post';

export interface MapFocusTarget {
  /** พิกัด Leaflet และ zoom เป้าหมายสำหรับ marker/current location */
  center: L.LatLng;
  zoom: number;
  /** false เมื่อแผนที่อยู่ที่พิกัดและ zoom เป้าหมายแล้ว */
  requiresMovement: boolean;
}

/**
 * สร้างเป้าหมาย focus ด้วยเกณฑ์เดียวกันสำหรับ marker, nearby card และ location
 * เพื่อไม่สั่ง flyTo ซ้ำเมื่อ center อยู่ห่างไม่ถึงครึ่งเมตรและ zoom เพียงพอแล้ว
 */
export function getMapFocusTarget(
  map: L.Map,
  latitude: number,
  longitude: number,
  minimumZoom: number,
): MapFocusTarget {
  const center = L.latLng(latitude, longitude);
  const zoom = Math.max(map.getZoom(), minimumZoom);

  return {
    center,
    zoom,
    requiresMovement:
      map.distance(map.getCenter(), center) >= 0.5 || map.getZoom() !== zoom,
  };
}

/**
 * สร้างไอคอน marker แบบเบาและไม่พึ่งไฟล์รูปของ Leaflet ที่อาจหายจาก bundler
 * ใช้ semantic CSS variables ของระบบเพื่อแยกสถานะ LOST และ FOUND
 */
export function createMarkerIcon(
  postType: PostType,
  isSelected = false,
): L.DivIcon {
  const markerColor =
    postType === 'LOST' ? 'var(--destructive)' : 'var(--primary)';
  const markerSize = isSelected ? 42 : 34;
  const markerAnchor = markerSize / 2;
  const selectionRing = isSelected
    ? ',0 0 0 6px color-mix(in oklch, var(--primary) 25%, transparent)'
    : '';

  return L.divIcon({
    className: '',
    html: `<span style="display:flex;width:${markerSize}px;height:${markerSize}px;align-items:center;justify-content:center;border-radius:9999px;background:${markerColor};border:3px solid var(--background);box-shadow:0 3px 8px color-mix(in oklch, var(--foreground) 22%, transparent)${selectionRing};"><span style="display:block;width:8px;height:8px;border-radius:9999px;background:var(--primary-foreground);"></span></span>`,
    iconSize: [markerSize, markerSize],
    iconAnchor: [markerAnchor, markerAnchor],
    popupAnchor: [0, -markerAnchor],
  });
}

/** สร้าง marker สีน้ำเงินเพื่อแยกตำแหน่งผู้ใช้ออกจาก marker ของประกาศ */
export function createCurrentLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: '<span style="display:flex;width:30px;height:30px;align-items:center;justify-content:center;border-radius:9999px;background:#2563eb;border:4px solid var(--background);box-shadow:0 0 0 5px rgb(37 99 235 / 22%),0 3px 8px color-mix(in oklch,var(--foreground) 24%,transparent);"><span style="display:block;width:7px;height:7px;border-radius:9999px;background:white;"></span></span>',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

/** สร้าง marker สีส้มสำหรับจุดที่ผู้ใช้เลือกเป็นตำแหน่งประกาศ */
export function createSelectedLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: '<span style="display:flex;width:34px;height:34px;align-items:center;justify-content:center;border-radius:9999px;background:#f97316;border:4px solid var(--background);box-shadow:0 0 0 5px rgb(249 115 22 / 22%),0 3px 8px color-mix(in oklch,var(--foreground) 24%,transparent);"><span style="display:block;width:8px;height:8px;border-radius:9999px;background:white;"></span></span>',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

/** สร้าง marker สีม่วงสำหรับผลค้นหาที่ใช้เลื่อนแผนที่ก่อนคลิกเลือกจุดจริง */
export function createSearchLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: '<span style="display:flex;width:32px;height:32px;align-items:center;justify-content:center;border-radius:9999px;background:#7c3aed;border:4px solid var(--background);box-shadow:0 0 0 5px rgb(124 58 237 / 20%),0 3px 8px color-mix(in oklch,var(--foreground) 24%,transparent);"><span style="display:block;width:8px;height:8px;border-radius:9999px;background:white;"></span></span>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

/** อ่านขอบเขตและจุดกึ่งกลางปัจจุบันจาก Leaflet เป็น query ที่ Backend รองรับ */
export function readViewportState(map: L.Map): MapViewportState {
  const bounds = map.getBounds();
  const mapCenter = map.getCenter();

  return {
    bounds: {
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
    },
    center: [mapCenter.lat, mapCenter.lng],
    zoom: map.getZoom(),
  };
}

/** เปรียบเทียบ viewport แบบเผื่อ floating-point เพื่อไม่ส่ง state เดิมซ้ำ */
export function isSameViewport(
  previous: MapViewportState,
  next: MapViewportState,
): boolean {
  const isNearlyEqual = (first: number, second: number) =>
    Math.abs(first - second) <= VIEWPORT_COMPARISON_EPSILON;

  return (
    isNearlyEqual(previous.bounds.south, next.bounds.south) &&
    isNearlyEqual(previous.bounds.west, next.bounds.west) &&
    isNearlyEqual(previous.bounds.north, next.bounds.north) &&
    isNearlyEqual(previous.bounds.east, next.bounds.east) &&
    isNearlyEqual(previous.center[0], next.center[0]) &&
    isNearlyEqual(previous.center[1], next.center[1]) &&
    isNearlyEqual(previous.zoom, next.zoom)
  );
}

/** แปลงวันที่ ISO จาก Backend เป็นรูปแบบภาษาไทยที่อ่านง่ายใน popup */
export function formatPostDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'ไม่ระบุวันที่';
  }

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
  }).format(date);
}
