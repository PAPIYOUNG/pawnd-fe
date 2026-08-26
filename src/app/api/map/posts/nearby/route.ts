import { NextRequest, NextResponse } from 'next/server';

import { apiFetch } from '@/lib/api/api-fetch';
import { ApiError } from '@/lib/api/api-error';
import type { MapPostFeatureCollection } from '@/types/map';

/**
 * Route Handler proxy สำหรับ GET /map/posts/nearby ของ Backend
 * proxy ผ่าน server เพื่อเลี่ยงปัญหา CORS เช่นเดียวกับ /api/map/posts
 */
export async function GET(request: NextRequest) {
  try {
    const data = await apiFetch<MapPostFeatureCollection>(
      `/map/posts/nearby${request.nextUrl.search}`,
    );
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { message: 'ไม่สามารถโหลดประกาศใกล้ตำแหน่งคุณได้' },
      { status: 502 },
    );
  }
}
