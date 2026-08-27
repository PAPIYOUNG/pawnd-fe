'use server';

import { unstable_rethrow } from 'next/navigation';

import {
  searchByImage,
  AiSearchByImageResult,
  SearchByImageParams,
} from '@/services/ai.service';
import { PostType } from '@/types/post';

/**
 * ผลลัพธ์จากการประมวลผล Server Action ของฟีเจอร์ค้นหาด้วย AI Smart Matching
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Server Action: ค้นหาประกาศที่ใกล้เคียงจากรูปภาพที่อัปโหลด (POST /ai/search-by-image)
 * - ตรวจสอบชนิดไฟล์และขนาดไฟล์ก่อนส่งต่อให้ Backend เสมอ
 * - รับ FormData ที่มี field 'image' และ field เสริม 'limit' / 'postType' (ถ้ามี)
 */
export async function searchPostsByImageAction(
  formData: FormData
): Promise<ActionResponse<AiSearchByImageResult>> {
  const file = formData.get('image');
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: 'กรุณาเลือกรูปภาพที่ต้องการค้นหา' };
  }
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'รองรับเฉพาะไฟล์ JPEG, PNG หรือ WEBP เท่านั้น',
    };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { success: false, error: 'ขนาดไฟล์ต้องไม่เกิน 5MB' };
  }

  const params: SearchByImageParams = {};
  const limitRaw = formData.get('limit');
  if (typeof limitRaw === 'string' && limitRaw) {
    params.limit = Number(limitRaw);
  }
  const postTypeRaw = formData.get('postType');
  if (postTypeRaw === 'LOST' || postTypeRaw === 'FOUND') {
    params.postType = postTypeRaw as PostType;
  }

  try {
    const result = await searchByImage(file, params);
    return { success: true, data: result };
  } catch (error) {
    // redirect('/login') ใน authFetch จะ throw error พิเศษ (NEXT_REDIRECT) เมื่อ session หมดอายุ
    // ต้อง rethrow ก่อน ไม่งั้นจะโดน catch จับไว้และ Next.js จะ redirect ไม่ทำงาน
    unstable_rethrow(error);
    const message =
      error instanceof Error
        ? error.message
        : 'ไม่สามารถค้นหาด้วย AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง';
    return { success: false, error: message };
  }
}
