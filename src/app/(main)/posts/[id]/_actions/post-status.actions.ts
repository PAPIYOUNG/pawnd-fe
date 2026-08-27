'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';

import { ApiError } from '@/lib/api/api-error';
import { ErrorActionResult } from '@/lib/api/types/action.type';
import { deletePost, updatePost } from '@/services/post.service';
import type { PostStatus } from '@/types/post';

/**
 * Server Actions สำหรับควบคุมสถานะประกาศบนหน้ารายละเอียดประกาศ (owner only)
 * เรียกจาก Client Component `PostStatusActions`
 * ใช้ Backend contract เดิม: PATCH /posts/:id (ส่ง status อย่างเดียวเพื่อเปลี่ยนสถานะ) และ DELETE /posts/:id
 */

// แปลง error ที่เกิดขึ้นให้เป็น ErrorActionResult มาตรฐาน
// (redirect ที่ authFetch โยนไว้ตอน session หมดอายุ ต้อง rethrow ก่อนเสมอ)
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

export interface ChangeStatusResult {
  success: true;
}

/** เปลี่ยนสถานะประกาศ แล้ว revalidate หน้าที่เกี่ยวข้องเพื่ออัปเดตป้ายสถานะทันที */
export async function changePostStatusAction(
  postId: string,
  status: PostStatus,
): Promise<ChangeStatusResult | ErrorActionResult> {
  try {
    await updatePost(postId, { status });
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath(`/posts/${postId}`);
  revalidatePath('/dashboard');
  revalidatePath('/posts');
  revalidatePath('/profile');
  return { success: true };
}

/** ลบประกาศถาวร แล้วพากลับไปหน้า Dashboard เพราะหน้ารายละเอียดนี้จะไม่มีข้อมูลอีกต่อไป */
export async function deletePostDetailAction(
  postId: string,
): Promise<ErrorActionResult | void> {
  try {
    await deletePost(postId);
  } catch (error) {
    return toActionError(error);
  }
  revalidatePath('/dashboard');
  revalidatePath('/posts');
  revalidatePath('/profile');
  redirect('/dashboard');
}
