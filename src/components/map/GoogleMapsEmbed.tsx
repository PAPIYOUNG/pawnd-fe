'use client';

interface GoogleMapsEmbedProps {
  apiKey?: string;
  centerAddress?: string;
  heightClass?: string;
}

/**
 * GoogleMapsEmbed Component (Client Component - Version 2 Alternative)
 * - แผนที่จริงผ่าน Google Maps Embed API หรือ Iframe
 * - รองรับการระบุ Google Maps API Key ใน .env หรือใช้ Embed URL พิกัดกรุงเทพฯ
 */
export default function GoogleMapsEmbed({
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  centerAddress = 'Bangkok, Thailand',
  heightClass = 'h-[360px] sm:h-[450px]',
}: GoogleMapsEmbedProps) {
  // หากมี API Key ให้ใช้ Official Embed Endpoint หากไม่มีให้ใช้ Standard Iframe
  const mapSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(centerAddress)}&zoom=13`
    : `https://maps.google.com/maps?q=${encodeURIComponent(centerAddress)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden rounded-3xl z-0`}>
      <iframe
        title="Google Maps Location"
        src={mapSrc}
        className="h-full w-full border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
