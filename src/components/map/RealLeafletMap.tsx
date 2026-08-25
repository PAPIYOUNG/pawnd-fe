'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  LoaderCircle,
  LocateFixed,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import { Button } from '@/components/ui/button';
import { getMapPosts } from '@/services/map.service';
import type {
  CurrentLocation,
  MapDataState,
  MapPostFeature,
  MapPostProperties,
  MapViewportState,
} from '@/types/map';
import type { PostType } from '@/types/post';

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018];
const DEFAULT_ZOOM = 11;
const SELECTED_POST_ZOOM = 15;
const VIEWPORT_DEBOUNCE_MS = 350;
const VIEWPORT_COMPARISON_EPSILON = 1e-7;
const MAP_POST_LIMIT = 200;

const POST_TYPE_LABEL: Record<PostType, string> = {
  LOST: 'สัตว์หาย',
  FOUND: 'พบสัตว์พลัดหลง',
};

const PET_TYPE_LABEL: Record<MapPostProperties['petType'], string> = {
  DOG: 'สุนัข',
  CAT: 'แมว',
  BIRD: 'นก',
  HAMSTER: 'แฮมสเตอร์',
  EXOTIC: 'สัตว์พิเศษ',
  OTHER: 'สัตว์เลี้ยง',
};

interface RealLeafletMapProps {
  /** จุดกึ่งกลางเริ่มต้นในรูปแบบ [latitude, longitude] */
  center?: [number, number];
  /** ระดับ zoom เริ่มต้นของแผนที่ */
  zoom?: number;
  /** คลาสกำหนดความสูงเพื่อให้แผนที่ responsive ตามบริบทที่เรียกใช้ */
  heightClass?: string;
  /** เปิดการซูมด้วยล้อเมาส์สำหรับหน้าแผนที่เต็มรูปแบบ */
  scrollWheelZoom?: boolean;
  /** กรองประเภทประกาศด้วย query ที่ Backend รองรับจริง */
  postType?: PostType;
  /** ตำแหน่งผู้ใช้ซึ่งอยู่ใน React state ของ parent เท่านั้น */
  currentLocation?: CurrentLocation | null;
  /** ขอพิกัดผ่าน Browser Geolocation API เมื่อผู้ใช้กดปุ่ม */
  onRequestCurrentLocation?: () => void;
  /** แสดงสถานะระหว่าง Browser กำลังอ่านพิกัด */
  isLocating?: boolean;
  /** ข้อความที่อ่านง่ายเมื่อขอพิกัดไม่สำเร็จ */
  locationError?: string | null;
  /** post id จากการ์ดที่ต้องเลื่อนแผนที่ไปหาและเปิด popup */
  selectedPostId?: string | null;
  /** พิกัดจาก nearby card ใช้ flyTo แม้ marker ยังไม่อยู่ใน viewport เดิม */
  selectedPostLocation?: CurrentLocation | null;
  /** token เปลี่ยนทุก click เพื่อรองรับการเลือก post เดิมซ้ำ */
  selectionRequestToken?: number;
  /** posts หลังกรองช่วงเวลาที่ใช้ร่วมกับรายการและจำนวนใน sidebar */
  visibleFeatures?: MapPostFeature[];
  /** ส่งสถานะข้อมูลชุดเดียวกันให้ sidebar แสดงรายการประกาศ */
  onDataStateChange?: (state: MapDataState) => void;
  /** ส่ง viewport ปัจจุบันให้หน้าหลักคำนวณระยะทางของรายการ */
  onViewportChange?: (viewport: MapViewportState) => void;
}

interface MapViewportObserverProps {
  /** callback ที่รับ bounds ล่าสุดหลังผู้ใช้เลื่อนหรือซูมแผนที่ */
  onChange: (viewport: MapViewportState) => void;
  /** สถานะ movement ที่โค้ดเป็นผู้เริ่ม เพื่อแยกออกจากการลาก/ซูมของผู้ใช้ */
  programmaticMovementRef: React.RefObject<ProgrammaticMovementState>;
}

interface MapPostPopupProps {
  /** feature ที่ใช้เติมข้อมูลใน popup ของ marker */
  feature: MapPostFeature;
}

interface CurrentLocationControllerProps {
  /** พิกัดใหม่ที่จะใช้เลื่อนและซูมแผนที่ */
  currentLocation?: CurrentLocation | null;
  /** ตั้ง guard ก่อนเริ่ม flyTo และให้ publish viewport หนึ่งครั้งเมื่อจบ */
  beginProgrammaticMovement: (publishViewportOnEnd: boolean) => void;
}

interface SelectedPostControllerProps {
  /** post id และพิกัดที่ได้จาก feature ชุดเดียวกับ marker */
  postId: string | null;
  latitude?: number;
  longitude?: number;
  /** true เมื่อ marker จาก viewport response ถูก render แล้ว */
  markerAvailable: boolean;
  /** ลำดับคำสั่งเลือกจากการ click การ์ด */
  requestToken: number;
  /** marker instances ที่ใช้เปิด popup โดยไม่สร้าง React state เพิ่ม */
  markerRefs: React.RefObject<Map<string, L.Marker>>;
  /** ตั้ง guard ก่อนเริ่ม flyTo และให้ publish viewport หนึ่งครั้งเมื่อจบ */
  beginProgrammaticMovement: (publishViewportOnEnd: boolean) => void;
}

interface MapPostMarkerProps {
  /** feature และ icon ที่ใช้สร้าง marker หนึ่งจุด */
  feature: MapPostFeature;
  icon: L.DivIcon;
  /** callback stable สำหรับลงทะเบียน Leaflet marker instance */
  onMarkerReady: (postId: string, marker: L.Marker | null) => void;
  /** ตั้ง guard ก่อน marker click เริ่ม flyTo */
  beginProgrammaticMovement: (publishViewportOnEnd: boolean) => void;
}

interface ProgrammaticMovementState {
  /** true ระหว่าง flyTo/current-location/popup auto-pan */
  active: boolean;
  /** true เฉพาะ movement ที่ควรโหลด viewport ใหม่หลังเคลื่อนที่จบ */
  publishViewportOnEnd: boolean;
}

interface MapFocusTarget {
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
function getMapFocusTarget(
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
function createMarkerIcon(postType: PostType, isSelected = false): L.DivIcon {
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
function createCurrentLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: '<span style="display:flex;width:30px;height:30px;align-items:center;justify-content:center;border-radius:9999px;background:#2563eb;border:4px solid var(--background);box-shadow:0 0 0 5px rgb(37 99 235 / 22%),0 3px 8px color-mix(in oklch,var(--foreground) 24%,transparent);"><span style="display:block;width:7px;height:7px;border-radius:9999px;background:white;"></span></span>',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

/**
 * อ่านขอบเขตและจุดกึ่งกลางปัจจุบันจาก Leaflet แล้วแปลงเป็นชื่อ query ที่ Backend รองรับ
 */
function readViewportState(map: L.Map): MapViewportState {
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

/**
 * เปรียบเทียบ viewport แบบเผื่อ floating-point เล็กน้อย เพื่อไม่ส่ง state เดิมซ้ำ
 * โดยเฉพาะ moveend ที่ Leaflet อาจยิงระหว่าง popup auto-pan/update
 */
function isSameViewport(
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

/**
 * ฟังการเปลี่ยน viewport ของแผนที่และส่ง bounds แรกทันทีหลัง map พร้อมใช้งาน
 */
function MapViewportObserver({
  onChange,
  programmaticMovementRef,
}: MapViewportObserverProps) {
  const map = useMap();
  const emitViewport = useCallback(() => {
    onChange(readViewportState(map));
  }, [map, onChange]);
  const handleMoveEnd = useCallback(() => {
    const movement = programmaticMovementRef.current;
    if (movement.active) {
      const shouldPublish = movement.publishViewportOnEnd;
      movement.active = false;
      movement.publishViewportOnEnd = false;

      if (!shouldPublish) {
        return;
      }
    }

    emitViewport();
  }, [emitViewport, programmaticMovementRef]);
  const handleAutoPanStart = useCallback(() => {
    const movement = programmaticMovementRef.current;
    if (!movement.active) {
      movement.active = true;
      movement.publishViewportOnEnd = false;
    }
  }, [programmaticMovementRef]);
  const eventHandlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({
      autopanstart: handleAutoPanStart,
      moveend: handleMoveEnd,
    }),
    [handleAutoPanStart, handleMoveEnd],
  );

  useMapEvents(eventHandlers);

  useEffect(() => {
    emitViewport();
  }, [emitViewport]);

  return null;
}

/** เลื่อนแผนที่ไปยัง current location ทุกครั้งที่ผู้ใช้ขอพิกัดสำเร็จ */
function CurrentLocationController({
  currentLocation,
  beginProgrammaticMovement,
}: CurrentLocationControllerProps) {
  const map = useMap();
  const lastCenteredLocationRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentLocation) {
      lastCenteredLocationRef.current = null;
      return;
    }

    const locationKey = `${currentLocation.latitude}:${currentLocation.longitude}`;
    if (lastCenteredLocationRef.current === locationKey) {
      return;
    }
    lastCenteredLocationRef.current = locationKey;

    const focusTarget = getMapFocusTarget(
      map,
      currentLocation.latitude,
      currentLocation.longitude,
      14,
    );
    if (!focusTarget.requiresMovement) {
      return;
    }

    beginProgrammaticMovement(true);
    map.flyTo(focusTarget.center, focusTarget.zoom, { animate: true });
  }, [beginProgrammaticMovement, currentLocation, map]);

  return null;
}

/**
 * รับคำสั่งจากการ์ดแล้ว flyTo ไปยัง marker ก่อนเปิด popup
 * ไม่มีการ set React state ใน Leaflet event และใช้ token guard กัน effect ซ้ำ
 */
function SelectedPostController({
  postId,
  latitude,
  longitude,
  markerAvailable,
  requestToken,
  markerRefs,
  beginProgrammaticMovement,
}: SelectedPostControllerProps) {
  const map = useMap();
  const lastFocusedSelectionRef = useRef<string | null>(null);
  const lastOpenedSelectionRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !postId ||
      latitude === undefined ||
      longitude === undefined ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    const selectionKey = `${postId}:${requestToken}`;
    const marker = markerRefs.current.get(postId);
    const focusTarget = getMapFocusTarget(
      map,
      latitude,
      longitude,
      SELECTED_POST_ZOOM,
    );

    if (lastFocusedSelectionRef.current !== selectionKey) {
      lastFocusedSelectionRef.current = selectionKey;

      if (focusTarget.requiresMovement) {
        const openSelectedPopup = () => {
          const currentMarker = markerRefs.current.get(postId);
          if (
            currentMarker &&
            lastOpenedSelectionRef.current !== selectionKey
          ) {
            currentMarker.openPopup();
            lastOpenedSelectionRef.current = selectionKey;
          }
        };

        map.once('moveend', openSelectedPopup);
        beginProgrammaticMovement(true);
        map.flyTo(focusTarget.center, focusTarget.zoom, { animate: true });

        return () => {
          map.off('moveend', openSelectedPopup);
        };
      }
    }

    if (marker && lastOpenedSelectionRef.current !== selectionKey) {
      marker.openPopup();
      lastOpenedSelectionRef.current = selectionKey;
    }
  }, [
    beginProgrammaticMovement,
    latitude,
    longitude,
    map,
    markerAvailable,
    markerRefs,
    postId,
    requestToken,
  ]);

  return null;
}

/**
 * แปลงวันที่ ISO จาก Backend เป็นรูปแบบภาษาไทยที่อ่านง่ายใน popup
 */
function formatPostDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'ไม่ระบุวันที่';
  }

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
  }).format(date);
}

/**
 * Popup สรุปประกาศ: รูปสัตว์ ชื่อ ประเภท สถานที่ และลิงก์ไปหน้ารายละเอียด
 */
function MapPostPopup({ feature }: MapPostPopupProps) {
  const { properties } = feature;
  const location = [properties.district, properties.province]
    .filter(Boolean)
    .join(', ');
  /**
   * Leaflet สร้างปุ่มปิดเองเมื่อ popup ถูกเพิ่มลงแผนที่ จึงกำหนดชื่อที่อ่านได้
   * สำหรับ screen reader หลัง element พร้อม โดยไม่เปลี่ยนกลไกปิดเดิมของ Leaflet
   */
  const handlePopupAdd = useCallback((event: L.LeafletEvent) => {
    const popup = event.target as L.Popup;
    const closeButton = popup
      .getElement()
      ?.querySelector<HTMLAnchorElement>('.leaflet-popup-close-button');

    closeButton?.setAttribute('aria-label', 'ปิดรายละเอียดประกาศ');
  }, []);
  const popupEventHandlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({ add: handlePopupAdd }),
    [handlePopupAdd],
  );

  return (
    <Popup
      className="pawnd-map-popup [&_.leaflet-popup-close-button]:!top-2 [&_.leaflet-popup-close-button]:!right-2 [&_.leaflet-popup-close-button]:!flex [&_.leaflet-popup-close-button]:!size-9 [&_.leaflet-popup-close-button]:!items-center [&_.leaflet-popup-close-button]:!justify-center [&_.leaflet-popup-close-button]:!rounded-full [&_.leaflet-popup-close-button]:!border [&_.leaflet-popup-close-button]:!border-border [&_.leaflet-popup-close-button]:!bg-background [&_.leaflet-popup-close-button]:!text-foreground [&_.leaflet-popup-close-button]:!shadow-sm [&_.leaflet-popup-close-button]:transition-colors [&_.leaflet-popup-close-button]:hover:!bg-muted [&_.leaflet-popup-close-button]:focus-visible:!outline-none [&_.leaflet-popup-close-button]:focus-visible:!ring-3 [&_.leaflet-popup-close-button]:focus-visible:!ring-ring/40 dark:[&_.leaflet-popup-content-wrapper]:!border dark:[&_.leaflet-popup-content-wrapper]:!border-border dark:[&_.leaflet-popup-content-wrapper]:!bg-card dark:[&_.leaflet-popup-content-wrapper]:!text-card-foreground dark:[&_.leaflet-popup-content-wrapper]:!shadow-xl dark:[&_.leaflet-popup-tip]:!border dark:[&_.leaflet-popup-tip]:!border-border dark:[&_.leaflet-popup-tip]:!bg-card dark:[&_.leaflet-popup-tip]:!shadow-lg"
      maxWidth={260}
      eventHandlers={popupEventHandlers}
    >
      <article className="w-56 overflow-hidden rounded-xl bg-card text-card-foreground">
        {/* รูปภาพปกของประกาศหรือ placeholder เมื่อไม่มีรูป */}
        <div className="relative h-28 overflow-hidden rounded-xl bg-muted">
          {properties.thumbnailUrl ? (
            <Image
              src={properties.thumbnailUrl}
              alt={properties.petName ?? 'รูปสัตว์เลี้ยง'}
              fill
              sizes="224px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <MapPin className="size-8" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* รายละเอียดสำคัญที่ช่วยตัดสินใจเปิดดูประกาศต่อ */}
        <div className="space-y-1.5 px-1 pt-3">
          <p
            className={`text-xs font-bold ${
              properties.postType === 'LOST'
                ? 'text-destructive'
                : 'text-primary dark:text-chart-2'
            }`}
          >
            {POST_TYPE_LABEL[properties.postType]}
          </p>
          <h3 className="line-clamp-1 text-base font-bold text-foreground">
            {properties.petName ?? 'ไม่ระบุชื่อสัตว์เลี้ยง'}
          </h3>
          <p className="text-xs font-medium text-foreground/75">
            {PET_TYPE_LABEL[properties.petType]}
            {properties.breed ? ` · ${properties.breed}` : ''}
          </p>
          <p className="line-clamp-1 text-xs font-medium text-foreground/75">
            {location || 'ไม่ระบุพื้นที่'}
          </p>
          <p className="text-[11px] font-medium text-foreground/75">
            วันที่ประกาศ: {formatPostDate(properties.eventDate)}
          </p>
        </div>

        {/* ลิงก์ไปหน้า Pet Post Detail ตาม route ที่มีอยู่ใน frontend */}
        <Link
          href={`/posts/${properties.id}`}
          className="mt-3 flex min-h-10 items-center justify-center rounded-xl bg-primary px-3 text-xs font-semibold !text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          ดูรายละเอียดประกาศ
        </Link>
      </article>
    </Popup>
  );
}

/** Marker ของประกาศที่ลงทะเบียน instance ผ่าน ref callback โดยไม่ set state */
function MapPostMarker({
  feature,
  icon,
  onMarkerReady,
  beginProgrammaticMovement,
}: MapPostMarkerProps) {
  const map = useMap();
  const [longitude, latitude] = feature.geometry.coordinates;
  const postId = feature.properties.id;
  const handleMarkerRef = useCallback(
    (marker: L.Marker | null) => {
      onMarkerReady(postId, marker);
    },
    [onMarkerReady, postId],
  );
  const handleMarkerClick = useCallback(() => {
    const focusTarget = getMapFocusTarget(
      map,
      latitude,
      longitude,
      SELECTED_POST_ZOOM,
    );
    if (!focusTarget.requiresMovement) {
      return;
    }

    beginProgrammaticMovement(true);
    map.flyTo(focusTarget.center, focusTarget.zoom, { animate: true });
  }, [beginProgrammaticMovement, latitude, longitude, map]);
  const eventHandlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({ click: handleMarkerClick }),
    [handleMarkerClick],
  );

  return (
    <Marker
      ref={handleMarkerRef}
      position={[latitude, longitude]}
      icon={icon}
      eventHandlers={eventHandlers}
    >
      <MapPostPopup feature={feature} />
    </Marker>
  );
}

/**
 * RealLeafletMap เป็น Client Component สำหรับแสดงแผนที่ OpenStreetMap
 * โดยโหลด marker จาก Backend ตาม viewport และ debounce การเปลี่ยน bounds
 * รองรับ loading, error, empty state และ cleanup ของ request เมื่อ unmount
 */
export default function RealLeafletMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  heightClass = 'h-[420px] sm:h-[560px]',
  scrollWheelZoom = false,
  postType,
  currentLocation,
  onRequestCurrentLocation,
  isLocating = false,
  locationError,
  selectedPostId,
  selectedPostLocation,
  selectionRequestToken = 0,
  visibleFeatures,
  onDataStateChange,
  onViewportChange,
}: RealLeafletMapProps) {
  const [bounds, setBounds] = useState<MapViewportState['bounds'] | null>(null);
  const [features, setFeatures] = useState<MapPostFeature[]>([]);
  const featuresRef = useRef<MapPostFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const lastViewportRef = useRef<MapViewportState | null>(null);
  const programmaticMovementRef = useRef<ProgrammaticMovementState>({
    active: false,
    publishViewportOnEnd: false,
  });
  const markerRefs = useRef(new Map<string, L.Marker>());
  const currentLocationIcon = useMemo(() => createCurrentLocationIcon(), []);
  const renderedFeatures = visibleFeatures ?? features;

  /**
   * เริ่ม movement จากโค้ดโดยแก้เฉพาะ ref เพื่อไม่สร้าง render loop
   * หากมี movement ซ้อนกันจะคงคำสั่ง publish viewport ที่สำคัญกว่าไว้
   */
  const beginProgrammaticMovement = useCallback(
    (publishViewportOnEnd: boolean) => {
      const movement = programmaticMovementRef.current;
      movement.active = true;
      movement.publishViewportOnEnd =
        movement.publishViewportOnEnd || publishViewportOnEnd;
    },
    [],
  );

  /** ลงทะเบียน marker instance เพื่อให้ selection controller เปิด popup ได้โดยตรง */
  const handleMarkerReady = useCallback(
    (postId: string, marker: L.Marker | null) => {
      if (marker) {
        if (markerRefs.current.get(postId) !== marker) {
          markerRefs.current.set(postId, marker);
        }
        return;
      }

      markerRefs.current.delete(postId);
    },
    [],
  );

  /** เก็บ bounds ล่าสุดจาก Leaflet เพื่อให้ effect ถัดไปจัดการ debounce */
  const handleViewportChange = useCallback(
    (nextViewport: MapViewportState) => {
      if (
        lastViewportRef.current &&
        isSameViewport(lastViewportRef.current, nextViewport)
      ) {
        return;
      }

      lastViewportRef.current = nextViewport;
      setBounds(nextViewport.bounds);
      onViewportChange?.(nextViewport);
    },
    [onViewportChange],
  );

  /**
   * โหลดข้อมูลใหม่หลังหยุดเลื่อน/ซูมตามเวลาที่กำหนด
   * Abort request เก่าเพื่อป้องกันผลตอบกลับลำดับเก่าทับข้อมูล viewport ใหม่
   */
  useEffect(() => {
    if (!bounds) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      const loadPosts = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        onDataStateChange?.({
          features: featuresRef.current,
          isLoading: true,
          errorMessage: null,
        });

        try {
          const collection = await getMapPosts(
            {
              ...bounds,
              ...(postType ? { type: postType } : {}),
              limit: MAP_POST_LIMIT,
            },
            controller.signal,
          );
          setFeatures(collection.features);
          featuresRef.current = collection.features;
          onDataStateChange?.({
            features: collection.features,
            isLoading: false,
            errorMessage: null,
          });
        } catch {
          if (controller.signal.aborted) {
            return;
          }

          const nextErrorMessage =
            'ไม่สามารถโหลดข้อมูลแผนที่ได้ กรุณาลองใหม่อีกครั้ง';
          setErrorMessage(nextErrorMessage);
          onDataStateChange?.({
            features: featuresRef.current,
            isLoading: false,
            errorMessage: nextErrorMessage,
          });
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        }
      };

      void loadPosts();
    }, VIEWPORT_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [bounds, onDataStateChange, postType, retryToken]);

  /** สร้าง icon ต่อประเภทโพสต์ครั้งเดียวต่อชุดข้อมูล เพื่อลดการสร้าง DOM ซ้ำ */
  const markerIcons = useMemo(() => {
    const icons = new Map<PostType, L.DivIcon>();

    renderedFeatures.forEach((feature) => {
      const postType = feature.properties.postType;
      if (!icons.has(postType)) {
        icons.set(postType, createMarkerIcon(postType));
      }
    });

    return icons;
  }, [renderedFeatures]);

  /** หา feature ที่เลือกด้วย post id เพื่อใช้พิกัดจริงชุดเดียวกับ marker */
  const selectedFeature = useMemo(
    () =>
      selectedPostId
        ? (renderedFeatures.find(
            (feature) => feature.properties.id === selectedPostId,
          ) ?? null)
        : null,
    [renderedFeatures, selectedPostId],
  );
  const selectedMarkerIcon = useMemo(
    () =>
      selectedFeature
        ? createMarkerIcon(selectedFeature.properties.postType, true)
        : null,
    [selectedFeature],
  );

  return (
    <div
      className={`relative z-0 w-full overflow-hidden rounded-3xl ${heightClass}`}
    >
      {/* แผนที่และ tile จาก OpenStreetMap พร้อม attribution ตามข้อกำหนด */}
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapViewportObserver
          onChange={handleViewportChange}
          programmaticMovementRef={programmaticMovementRef}
        />
        <CurrentLocationController
          currentLocation={currentLocation}
          beginProgrammaticMovement={beginProgrammaticMovement}
        />
        <SelectedPostController
          postId={selectedPostId ?? null}
          latitude={
            selectedFeature?.geometry.coordinates[1] ??
            selectedPostLocation?.latitude
          }
          longitude={
            selectedFeature?.geometry.coordinates[0] ??
            selectedPostLocation?.longitude
          }
          markerAvailable={Boolean(selectedFeature)}
          requestToken={selectionRequestToken}
          markerRefs={markerRefs}
          beginProgrammaticMovement={beginProgrammaticMovement}
        />

        {/* marker สีน้ำเงินของผู้ใช้ ไม่มีการส่งหรือบันทึกพิกัดนอก React state */}
        {currentLocation && (
          <Marker
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={currentLocationIcon}
            title="ตำแหน่งปัจจุบันของคุณ"
          >
            <Popup>ตำแหน่งปัจจุบันของคุณ</Popup>
          </Marker>
        )}

        {/* marker จาก GeoJSON ของ Backend โดยสลับพิกัดเป็น [latitude, longitude] */}
        {renderedFeatures.map((feature) => {
          const [longitude, latitude] = feature.geometry.coordinates;
          const icon = markerIcons.get(feature.properties.postType);

          if (
            !icon ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
          ) {
            return null;
          }

          const isSelected = feature.properties.id === selectedPostId;

          return (
            <MapPostMarker
              key={feature.properties.id}
              feature={feature}
              icon={
                isSelected && selectedMarkerIcon ? selectedMarkerIcon : icon
              }
              onMarkerReady={handleMarkerReady}
              beginProgrammaticMovement={beginProgrammaticMovement}
            />
          );
        })}
      </MapContainer>

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
              onClick={() => setRetryToken((token) => token + 1)}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              ลองใหม่
            </Button>
          </div>
        </div>
      )}

      {/* สถานะสำเร็จแต่ไม่มี marker ใน viewport ปัจจุบัน */}
      {!isLoading && !errorMessage && renderedFeatures.length === 0 && (
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
    </div>
  );
}
