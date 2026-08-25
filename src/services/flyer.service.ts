import { authFetch } from '@/lib/api/auth-fetch';

/**
 * Flyer Service — จัดการใบปลิวสำหรับประกาศตามหาสัตว์เลี้ยง
 * ใช้ authFetch สำหรับ endpoint ที่ต้อง login (สร้าง/ดึงข้อมูลใบปลิว)
 * URL ดาวน์โหลด PDF เป็น public endpoint สามารถเข้าถึงได้โดยไม่ต้อง login
 */

/** ประเภทเทมเพลตใบปลิวที่ Backend รองรับ */
export type FlyerTemplate = 'WANTED' | 'STANDARD' | 'REWARD_EMPHASIS';

/** ข้อมูลใบปลิวที่ Backend ส่งกลับมา */
export interface FlyerResponse {
  id: string;
  postId: string;
  template: FlyerTemplate;
  pdfUrl?: string;
  qrImageUrl?: string;
  createdAt: string;
}

/** Base URL สำหรับสร้าง download link (public endpoint ไม่ต้อง auth) */
const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

/**
 * ดึงข้อมูลใบปลิวล่าสุดสำหรับประกาศ (GET /posts/:id/flyer)
 * ใช้ authFetch เพื่อส่ง JWT token อัตโนมัติ
 */
export async function getPostFlyer(postId: string): Promise<FlyerResponse | null> {
  try {
    return await authFetch<FlyerResponse>(`/posts/${postId}/flyer`);
  } catch {
    return null;
  }
}

/**
 * สร้างหรืออัปเดตใบปลิวสำหรับประกาศ (POST /posts/:id/flyer)
 * @param postId — รหัสประกาศ
 * @param template — เทมเพลตใบปลิว (WANTED, STANDARD, REWARD_EMPHASIS)
 */
export async function generateFlyer(
  postId: string,
  template: FlyerTemplate = 'WANTED'
): Promise<FlyerResponse | null> {
  try {
    return await authFetch<FlyerResponse>(`/posts/${postId}/flyer`, {
      method: 'POST',
      body: { template },
    });
  } catch {
    return null;
  }
}

/**
 * รับ URL สำหรับดาวน์โหลด PDF ใบปลิวโดยตรงจาก Backend
 * Endpoint นี้เป็น @Public() — ไม่ต้อง login ก็ดาวน์โหลดได้
 */
export function getFlyerDownloadUrl(postId: string): string {
  return `${API_BASE_URL}/posts/${postId}/flyer/download`;
}
