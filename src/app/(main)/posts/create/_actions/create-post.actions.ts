'use server';

import { revalidatePath } from 'next/cache';
import {
  createPost,
  uploadPostImages,
} from '@/services/post.service';
import type { CreatePostPayload, CreatePostResponse } from '@/types/post';
import { analyzeImage } from '@/services/ai.service';

type PostActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server Action สำหรับสร้างประกาศตามหาสัตว์เลี้ยงใหม่
 */
export async function createPostAction(
  payload: CreatePostPayload,
): Promise<PostActionResponse<CreatePostResponse>> {
  try {
    const post = await createPost(payload);
    revalidatePath('/posts');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    revalidatePath('/');
    return { success: true, data: post };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถสร้างประกาศได้';
    return { success: false, error: message };
  }
}

/**
 * Server Action สำหรับอัปโหลดรูปของประกาศที่สร้างแล้ว
 * รับ FormData จาก Client แล้วส่งไฟล์ต่อไปยัง Backend โดยใช้ session token ฝั่ง Server
 */
export async function uploadPostImagesAction(
  postId: string,
  formData: FormData,
): Promise<PostActionResponse<unknown>> {
  try {
    const files = formData.getAll('images').filter(
      (value): value is File =>
        typeof value !== 'string' && 'arrayBuffer' in value,
    );

    if (files.length === 0) {
      return { success: false, error: 'กรุณาเลือกอย่างน้อย 1 รูปภาพ' };
    }

    const result = await uploadPostImages(postId, files);
    revalidatePath(`/posts/${postId}`);
    revalidatePath('/posts');
    return { success: true, data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถอัปโหลดรูปภาพได้';
    return { success: false, error: message };
  }
}

/**
 * Server Action สำหรับเรียก AI วิเคราะห์รูปภาพสัตว์เลี้ยง (ประเภท, สายพันธุ์, สีขน, ลักษณะเด่น, คำบรรยาย)
 * ใช้ทั้งสำหรับปุ่ม "AI วิเคราะห์สายพันธุ์และลักษณะสีขน" และ "AI ช่วยเขียนคำบรรยาย"
 * @param imageUrl — URL หรือ Base64 Data URL ของรูปภาพสัตว์เลี้ยงที่จะวิเคราะห์
 */
export async function analyzeImageAction(imageUrl: string) {
  try {
    const result = await analyzeImage(imageUrl);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถวิเคราะห์รูปภาพได้';
    return { success: false, error: message };
  }
}
