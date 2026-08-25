import { useCallback, useMemo } from 'react';
import L from 'leaflet';
import { Marker, Popup, useMap } from 'react-leaflet';

import { MapMarkerPopup } from '@/components/map/MapMarkerPopup';
import { SELECTED_POST_ZOOM } from '@/components/map/map.constants';
import { getMapFocusTarget } from '@/components/map/map.utils';

import type { CurrentLocation, MapPostFeature } from '@/types/map';
import type { PostType } from '@/types/post';

interface MapPostMarkerProps {
  /** feature และ icon ที่ใช้สร้าง marker หนึ่งจุด */
  feature: MapPostFeature;
  icon: L.DivIcon;
  /** callback stable สำหรับลงทะเบียน Leaflet marker instance */
  onMarkerReady: (postId: string, marker: L.Marker | null) => void;
  /** ตั้ง guard ก่อน marker click เริ่ม flyTo */
  beginProgrammaticMovement: (publishViewportOnEnd: boolean) => void;
}

interface MapMarkersProps {
  /** marker ของประกาศที่ผ่านตัวกรองและพร้อม render */
  features: MapPostFeature[];
  /** post ที่เลือกใช้สลับไปยัง icon แบบเน้น */
  selectedPostId?: string | null;
  /** icon ปกติที่สร้างหนึ่ง instance ต่อประเภทประกาศ */
  markerIcons: Map<PostType, L.DivIcon>;
  /** icon ของ marker ที่ถูกเลือก */
  selectedMarkerIcon: L.DivIcon | null;
  /** callback ลงทะเบียน marker instances สำหรับเปิด popup จาก nearby card */
  onMarkerReady: (postId: string, marker: L.Marker | null) => void;
  /** guard ของ movement ที่โค้ดเป็นผู้เริ่ม */
  beginProgrammaticMovement: (publishViewportOnEnd: boolean) => void;
  /** ตำแหน่งผู้ใช้และ icon สีน้ำเงินที่แสดงแยกจากประกาศ */
  currentLocation?: CurrentLocation | null;
  currentLocationIcon: L.DivIcon;
}

/** Marker หนึ่งจุดที่คง click → flyTo และ popup behavior เดิม */
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
      <MapMarkerPopup feature={feature} />
    </Marker>
  );
}

/** Render current-location marker และ GeoJSON post markers ด้วย refs/icons จาก parent */
export function MapMarkers({
  features,
  selectedPostId,
  markerIcons,
  selectedMarkerIcon,
  onMarkerReady,
  beginProgrammaticMovement,
  currentLocation,
  currentLocationIcon,
}: MapMarkersProps) {
  return (
    <>
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
      {features.map((feature) => {
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
            icon={isSelected && selectedMarkerIcon ? selectedMarkerIcon : icon}
            onMarkerReady={onMarkerReady}
            beginProgrammaticMovement={beginProgrammaticMovement}
          />
        );
      })}
    </>
  );
}
