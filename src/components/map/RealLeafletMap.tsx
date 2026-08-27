'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import { MapControls } from '@/components/map/MapControls';
import {
  MapMarkers,
  type LocationSelectHandler,
} from '@/components/map/MapMarkers';
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAP_POST_LIMIT,
  SELECTED_POST_ZOOM,
  VIEWPORT_DEBOUNCE_MS,
} from '@/components/map/map.constants';
import {
  createCurrentLocationIcon,
  createMarkerIcon,
  createSearchLocationIcon,
  createSelectedLocationIcon,
  getMapFocusTarget,
  isSameViewport,
  readViewportState,
} from '@/components/map/map.utils';
import { getMapPosts } from '@/services/map.service';
import type {
  CurrentLocation,
  MapDataState,
  MapPostFeature,
  MapViewportState,
} from '@/types/map';
import type { PostType } from '@/types/post';

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
  /** แสดง marker และโหลดข้อมูลประกาศเมื่อใช้เป็นหน้า Map หลัก */
  showPostMarkers?: boolean;
  /** เปิดการเลือกตำแหน่งด้วยการคลิกพื้นที่ว่างหรือ marker บนแผนที่ */
  onLocationSelect?: LocationSelectHandler;
  /** จุดที่ผู้ใช้เลือกเป็นตำแหน่งประกาศ */
  selectedLocation?: CurrentLocation | null;
  /** จุดจากผลค้นหาที่ใช้เลื่อนแผนที่ก่อนคลิกเลือกพิกัดจริง */
  searchLocation?: CurrentLocation | null;
  /** token สำหรับให้เลือกผลค้นหาเดิมซ้ำได้ */
  searchLocationRequestToken?: number;
}

interface MapViewportObserverProps {
  /** callback ที่รับ bounds ล่าสุดหลังผู้ใช้เลื่อนหรือซูมแผนที่ */
  onChange: (viewport: MapViewportState) => void;
  /** สถานะ movement ที่โค้ดเป็นผู้เริ่ม เพื่อแยกออกจากการลาก/ซูมของผู้ใช้ */
  programmaticMovementRef: React.RefObject<ProgrammaticMovementState>;
}

interface CurrentLocationControllerProps {
  /** พิกัดใหม่ที่จะใช้เลื่อนและซูมแผนที่ */
  currentLocation?: CurrentLocation | null;
  /** แจ้งหน้าฟอร์มเมื่อ current location พร้อมใช้เป็นจุดประกาศ */
  onLocationSelect?: LocationSelectHandler;
  /** ตั้ง guard ก่อนเริ่ม flyTo และให้ publish viewport หนึ่งครั้งเมื่อจบ */
  beginProgrammaticMovement: (publishViewportOnEnd: boolean) => void;
}

interface LocationSelectionControllerProps {
  /** callback รับพิกัดจากการคลิกพื้นที่ว่างบนแผนที่ */
  onLocationSelect: LocationSelectHandler;
}

interface SearchLocationControllerProps {
  /** จุดจากผลค้นหาที่ใช้เป็นเป้าหมายการเลื่อนแผนที่ */
  searchLocation?: CurrentLocation | null;
  /** token ของผลค้นหาแต่ละครั้ง */
  requestToken: number;
  /** ตั้ง guard ก่อนสั่งเลื่อนแผนที่ */
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

interface ProgrammaticMovementState {
  /** true ระหว่าง flyTo/current-location/popup auto-pan */
  active: boolean;
  /** true เฉพาะ movement ที่ควรโหลด viewport ใหม่หลังเคลื่อนที่จบ */
  publishViewportOnEnd: boolean;
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

/** รับ click บนพื้นที่ว่างของแผนที่เพื่อเลือกพิกัดประกาศ */
function LocationSelectionController({
  onLocationSelect,
}: LocationSelectionControllerProps) {
  useMapEvents({
    click: (event) => {
      onLocationSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

/** เลื่อนแผนที่ไปยังผลค้นหาโดยยังไม่เปลี่ยนพิกัดประกาศที่เลือก */
function SearchLocationController({
  searchLocation,
  requestToken,
  beginProgrammaticMovement,
}: SearchLocationControllerProps) {
  const map = useMap();
  const lastFocusedSearchRef = useRef<string | null>(null);

  useEffect(() => {
    if (!searchLocation) {
      lastFocusedSearchRef.current = null;
      return;
    }

    const searchKey = `${requestToken}:${searchLocation.latitude}:${searchLocation.longitude}`;
    if (lastFocusedSearchRef.current === searchKey) {
      return;
    }
    lastFocusedSearchRef.current = searchKey;

    const focusTarget = getMapFocusTarget(
      map,
      searchLocation.latitude,
      searchLocation.longitude,
      16,
    );
    if (!focusTarget.requiresMovement) {
      return;
    }

    beginProgrammaticMovement(true);
    map.flyTo(focusTarget.center, focusTarget.zoom, { animate: true });
  }, [beginProgrammaticMovement, map, requestToken, searchLocation]);

  return null;
}

/** เลื่อนแผนที่ไปยัง current location ทุกครั้งที่ผู้ใช้ขอพิกัดสำเร็จ */
function CurrentLocationController({
  currentLocation,
  onLocationSelect,
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
    onLocationSelect?.(currentLocation);

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
  }, [beginProgrammaticMovement, currentLocation, map, onLocationSelect]);

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
  showPostMarkers = true,
  onLocationSelect,
  selectedLocation,
  searchLocation,
  searchLocationRequestToken = 0,
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
  const selectedLocationIcon = useMemo(() => createSelectedLocationIcon(), []);
  const searchLocationIcon = useMemo(() => createSearchLocationIcon(), []);
  const renderedFeatures = useMemo(
    () => (showPostMarkers ? (visibleFeatures ?? features) : []),
    [features, showPostMarkers, visibleFeatures],
  );

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
    if (!showPostMarkers || !bounds) {
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
  }, [bounds, onDataStateChange, postType, retryToken, showPostMarkers]);

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
        {onLocationSelect && (
          <LocationSelectionController onLocationSelect={onLocationSelect} />
        )}
        <CurrentLocationController
          currentLocation={currentLocation}
          onLocationSelect={onLocationSelect}
          beginProgrammaticMovement={beginProgrammaticMovement}
        />
        <SearchLocationController
          searchLocation={searchLocation}
          requestToken={searchLocationRequestToken}
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

        <MapMarkers
          features={renderedFeatures}
          selectedPostId={selectedPostId}
          markerIcons={markerIcons}
          selectedMarkerIcon={selectedMarkerIcon}
          onMarkerReady={handleMarkerReady}
          beginProgrammaticMovement={beginProgrammaticMovement}
          onLocationSelect={onLocationSelect}
          currentLocation={currentLocation}
          currentLocationIcon={currentLocationIcon}
          selectedLocation={selectedLocation}
          selectedLocationIcon={selectedLocationIcon}
          searchLocation={searchLocation}
          searchLocationIcon={searchLocationIcon}
        />
      </MapContainer>

      {showPostMarkers && (
        <MapControls
          onRequestCurrentLocation={onRequestCurrentLocation}
          isLocating={isLocating}
          locationError={locationError}
          isLoading={isLoading}
          errorMessage={errorMessage}
          visibleFeatureCount={renderedFeatures.length}
          onRetry={() => setRetryToken((token) => token + 1)}
        />
      )}
    </div>
  );
}
