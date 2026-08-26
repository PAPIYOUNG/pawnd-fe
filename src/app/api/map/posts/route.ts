import { NextRequest, NextResponse } from 'next/server';

import { apiFetch } from '@/lib/api/api-fetch';
import { ApiError } from '@/lib/api/api-error';
import type { MapPostFeatureCollection } from '@/types/map';

/**
 * Route Handler proxy สำหรับ GET /map/posts ของ Backend
 * เหตุผลที่ต้อง proxy ผ่าน server แทนให้ browser ยิงตรงไป Backend:
 * Backend ยังไม่ได้เปิด CORS ให้ origin ของ Next.js dev/production server
 * การ fetch ฝั่ง server (server-to-server) จึงไม่ติด CORS และยังใช้ API_URL (server-only env) ได้ถูกต้อง
 */
export async function GET(request: NextRequest) {
  try {
    const data = await apiFetch<MapPostFeatureCollection>(
      `/map/posts${request.nextUrl.search}`,
    );
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { message: 'ไม่สามารถโหลดข้อมูลแผนที่ได้' },
      { status: 502 },
    );
  }
}
