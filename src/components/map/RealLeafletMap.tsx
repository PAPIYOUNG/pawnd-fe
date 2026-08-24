'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LatestPostItem } from '@/types/post';

interface MapPinItem {
  id: string;
  lat: number;
  lng: number;
  type: 'LOST' | 'FOUND';
  petName: string;
  breed: string;
  location: string;
  imageUrl: string;
}

// รายการหมุดพิกัดจริงของสัตว์เลี้ยงในพื้นที่กรุงเทพฯ และปริมณฑล
const SAMPLE_MAP_PINS: MapPinItem[] = [
  {
    id: 'mock-1',
    lat: 13.7126,
    lng: 100.6042,
    type: 'LOST',
    petName: 'น้องส้มส้ม',
    breed: 'แมวไทยเพศผู้',
    location: 'อ่อนนุช 46, กรุงเทพฯ',
    imageUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'mock-2',
    lat: 13.8476,
    lng: 100.5401,
    type: 'FOUND',
    petName: 'ไซบีเรียนเพศผู้',
    breed: 'ไซบีเรียน ฮัสกี้',
    location: 'ถ.งามวงศ์วาน, นนทบุรี',
    imageUrl:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'mock-3',
    lat: 13.7852,
    lng: 100.6128,
    type: 'LOST',
    petName: 'ช็อกโก้',
    breed: 'พุดเดิ้ลทอย',
    location: 'ลาดพร้าว 101, กรุงเทพฯ',
    imageUrl:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'mock-4',
    lat: 13.8479,
    lng: 100.5701,
    type: 'FOUND',
    petName: 'แมวไทยสีขาวตาโต',
    breed: 'พันธุ์ไทย เพศเมีย',
    location: 'ม.เกษตรศาสตร์ บางเขน',
    imageUrl:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'mock-5',
    lat: 13.7469,
    lng: 100.5349,
    type: 'LOST',
    petName: 'มิลค์กี้',
    breed: 'เปอร์เซีย ขนยาว',
    location: 'สยามสแควร์, ปทุมวัน',
    imageUrl:
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=400&auto=format&fit=crop',
  },
];

interface RealLeafletMapProps {
  center?: [number, number];
  zoom?: number;
  heightClass?: string;
  pins?: LatestPostItem[];
}

/**
 * RealLeafletMap Component (Client Component)
 * - แผนที่จริงแบบ Interactive บน OpenStreetMap ผ่าน Leaflet
 * - แสดงพิกัดจริงของประเทศไทย พร้อมหมุดสัตว์หาย (สีแดง) และพบสัตว์ (สีเขียว)
 * - กดที่หมุดเพื่อเปิด Pop-up ดูรูปถ่าย ชื่อสัตว์ และพิกัดสถานที่
 */
export default function RealLeafletMap({
  center = [13.785, 100.565],
  zoom = 12,
  heightClass = 'h-[360px] sm:h-[450px]',
}: RealLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // ป้องกันการสร้าง map ซ้ำ

    // 1. กำหนดค่า Map Instance
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      scrollWheelZoom: false, // ป้องกันการซูมกวนตอนเลื่อนหน้าเว็บ
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // 2. ดึง Tile Layer จาก OpenStreetMap (CARTO Positron - สไตล์มินิมอลสบายตา)
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    // 3. สร้างและปักหมุดสัตว์เลี้ยงลงบนแผนที่
    SAMPLE_MAP_PINS.forEach((pin) => {
      const isLost = pin.type === 'LOST';
      const pinColor = isLost ? '#EF4444' : '#10B981';
      const pinBgColor = isLost ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
      const badgeText = isLost ? 'สัตว์หาย' : 'พบสัตว์';

      // สร้าง Custom HTML Pin Icon พร้อมเอฟเฟกต์ Ripple Pulse
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background-color: ${pinBgColor}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 22px; height: 22px; border-radius: 9999px; background-color: ${pinColor}; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; border-radius: 9999px; background-color: #FFFFFF;"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      // โค้ด HTML ของการ์ด Popup เมื่อคลิกที่หมุด
      const popupHtml = `
        <div style="font-family: var(--font-sans, system-ui, sans-serif); min-width: 170px; padding: 2px;">
          <div style="position: relative; width: 100%; height: 95px; border-radius: 12px; overflow: hidden; margin-bottom: 8px;">
            <img src="${pin.imageUrl}" alt="${pin.petName}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 6px; left: 6px; background-color: ${pinColor}; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
              ${badgeText}
            </span>
          </div>
          <div style="font-weight: 700; font-size: 14px; color: #133E2B; line-height: 1.2;">${pin.petName}</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 2px;">${pin.breed}</div>
          <div style="font-size: 11px; color: #0F766E; margin-top: 4px; font-weight: 500;">📍 ${pin.location}</div>
          <a href="/posts/${pin.id}" style="display: block; text-align: center; background-color: #0F766E; color: #FFFFFF; font-size: 11px; font-weight: 600; padding: 6px 10px; border-radius: 8px; margin-top: 8px; text-decoration: none;">
            ดูข้อมูลสัตว์เลี้ยง
          </a>
        </div>
      `;

      L.marker([pin.lat, pin.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml, {
          maxWidth: 220,
          className: 'pawnd-map-popup',
        });
    });

    // Cleanup Map Instance เมื่อ Unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom]);

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden rounded-3xl z-0`}>
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
