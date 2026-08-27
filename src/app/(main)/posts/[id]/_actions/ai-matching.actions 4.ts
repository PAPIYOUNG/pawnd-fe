'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';

import { ApiError } from '@/lib/api/api-error';
import { ErrorActionResult } from '@/lib/api/types/action.type';
import {
  getPostMatches,
  togglePinMatch,
  toggleDismissMatch,
  triggerPostMatch,
} from '@/services/ai-matching.service';
import type {
  GetPostMatchesResult,
  ToggleMatchActionResult,
  TriggerMatchResult,
} from '@/types/ai-match';

/**
 * Server Actions สำหรับฟีเจอร์ AI Smart Matching บนหน้ารายละเอียดประกาศ (public)
 * เรียกจาก Client Component `AiMatchingCard`
 */

// แปลง error ที่เกิดขึ้นให้เป็น ErrorActionResult มาตรฐาน
// (redirect('/login') ที่ authFetch โยนไว้ตอน session หมดอายุ ต้อง rethrow ก่อนเสมอ)
function toActionError(error: unknown): ErrorActionResult {
  unstable_rethrow(error);
  if (error instanceof ApiError) {
    return {
      success: false,
      message: error.message,
      code: error.statusCode === 404 ? 'NOT_FOUND' : 'API_ERROR',
    };
  }
  throw error;
}

// สั่งประมวลผลจับคู่ใหม่สำหรับประกาศนี้ แล้ว revalidate หน้ารายละเอียดประกาศ
export async function triggerPostMatchAction(
  postId: string,
): Promise<TriggerMatchResult | ErrorActionResult> {
  try {
    const result = await triggerPostMatch(postId);
    revalidatePath(`/posts/${postId}`);
    return result;
  } catch (error) {
    return toActionError(error);
  }
}

// ดึงรายการผลการจับคู่ล่าสุด (ใช้รีเฟรชรายการหลังสั่งจับคู่ใหม่ หรือหลัง Pin/Dismiss)
export async function getPostMatchesAction(
  postId: string,
): Promise<GetPostMatchesResult | ErrorActionResult> {
  try {
    return await getPostMatches(postId);
  } catch (error) {
    return toActionError(error);
  }
}

// ปักหมุด/ยกเลิกปักหมุดผลการจับคู่ 1 รายการ
export async function togglePinMatchAction(
  postId: string,
  matchId: string,
): Promise<ToggleMatchActionResult | ErrorActionResult> {
  try {
    return await togglePinMatch(postId, matchId);
  } catch (error) {
    return toActionError(error);
  }
}

// ซ่อนผลการจับคู่ 1 รายการที่เจ้าของประกาศเห็นว่าไม่ตรง
export async function toggleDismissMatchAction(
  postId: string,
  matchId: string,
): Promise<ToggleMatchActionResult | ErrorActionResult> {
  try {
    return await toggleDismissMatch(postId, matchId);
  } catch (error) {
    return toActionError(error);
  }
}
