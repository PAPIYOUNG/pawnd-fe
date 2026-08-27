import { apiFetch } from '@/lib/api/api-fetch';
import { authFetch } from '@/lib/api/auth-fetch';

import type {
  GetPostMatchesResult,
  ToggleMatchActionResult,
  TriggerMatchResult,
} from '@/types/ai-match';

/**
 * AI Matching Service — เรียกใช้ Endpoint ของ `AiController` ฝั่ง Backend
 * ที่เกี่ยวกับการจับคู่ประกาศ (`/ai/match`, `/ai/posts/:postId/matches`)
 * - getPostMatches เป็น public endpoint (ไม่ต้อง login ก็ดูผลจับคู่ได้) → ใช้ apiFetch
 * - ฟังก์ชันอื่นที่เหลือ (สั่งจับคู่ใหม่, Pin/Dismiss) ต้อง login และเป็นเจ้าของประกาศเท่านั้น จึงใช้ authFetch
 */

/**
 * สั่งให้ AI ประมวลผลหาคู่จับคู่ให้ประกาศนี้ (POST /ai/match/:postId)
 * - Backend คำนวณ Vector Similarity จาก Image Embedding ที่สร้างไว้ตอนสร้างประกาศแล้วโดยอัตโนมัติ
 *   ร่วมกับคะแนนลักษณะภายนอก ระยะทาง และวันที่ แล้วบันทึกผลเป็น AiMatch
 * - ใช้ได้เฉพาะประกาศของตัวเองที่สถานะเป็น ACTIVE เท่านั้น
 */
export async function triggerPostMatch(
  postId: string,
): Promise<TriggerMatchResult> {
  return authFetch<TriggerMatchResult>(`/ai/match/${postId}`, {
    method: 'POST',
  });
}

/**
 * ดึงรายการผลการจับคู่ทั้งหมดของประกาศนี้ เรียงจากคะแนนรวมสูงไปต่ำ (GET /ai/posts/:postId/matches)
 * เป็น public endpoint — ผู้ใช้ที่ไม่ได้ login ก็ดูรายการนี้ได้เช่นกัน (read-only)
 */
export async function getPostMatches(
  postId: string,
): Promise<GetPostMatchesResult> {
  return apiFetch<GetPostMatchesResult>(`/ai/posts/${postId}/matches`, {
    method: 'GET',
    cache: 'no-store',
  });
}

/** ปักหมุด/ยกเลิกปักหมุดผลการจับคู่ 1 รายการ (PATCH /ai/posts/:postId/matches/:matchId/pin) */
export async function togglePinMatch(
  postId: string,
  matchId: string,
): Promise<ToggleMatchActionResult> {
  return authFetch<ToggleMatchActionResult>(
    `/ai/posts/${postId}/matches/${matchId}/pin`,
    { method: 'PATCH' },
  );
}

/** ซ่อน/เลิกซ่อนผลการจับคู่ 1 รายการที่ไม่ตรงกับที่ตามหา (PATCH /ai/posts/:postId/matches/:matchId/dismiss) */
export async function toggleDismissMatch(
  postId: string,
  matchId: string,
): Promise<ToggleMatchActionResult> {
  return authFetch<ToggleMatchActionResult>(
    `/ai/posts/${postId}/matches/${matchId}/dismiss`,
    { method: 'PATCH' },
  );
}
