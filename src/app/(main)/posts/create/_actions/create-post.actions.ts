'use server';

import { auth } from '@/auth';
import { ApiError } from '@/lib/api/api-error';
import type { ErrorActionResult } from '@/lib/action/action.type';
import { createPostRequest } from '@/services/post.service';
import type { CreatePostPayload } from '@/types/post';

type CreatePostActionResult =
  ErrorActionResult | { success: true; postId: string };

/**
 * สร้าง PetPost ผ่าน Backend จริง โดยอ่าน sender identity จาก NextAuth session
 * และไม่รับ userId จาก Client เพื่อป้องกันการสวมสิทธิ์เจ้าของประกาศ
 */
export async function createPostAction(
  payload: CreatePostPayload,
): Promise<CreatePostActionResult> {
  const session = await auth();
  if (!session?.accessToken) {
    return {
      success: false,
      message: 'กรุณาเข้าสู่ระบบก่อนสร้างประกาศ',
      code: '401',
    };
  }

  try {
    const response = await createPostRequest(payload, session.accessToken);
    return { success: true, postId: response.post.id };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        code: String(error.statusCode),
      };
    }
    return {
      success: false,
      message: 'สร้างประกาศไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      code: 'UNKNOWN',
    };
  }
}
