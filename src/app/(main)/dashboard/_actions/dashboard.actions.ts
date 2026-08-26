'use server';

import { revalidatePath } from 'next/cache';
import { deletePost } from '@/services/post.service';

/**
 * ผลลัพธ์จากการประมวลผล Action
 */
export interface ActionResponse {
  success: boolean;
  error?: string;
}

/**
 * Server Action สำหรับลบประกาศตามหาของฉัน
 * - เรียกใช้ deletePost() จาก post.service เพื่อส่งคำสั่ง DELETE /posts/:id ไปยัง Backend
 * - สั่ง revalidatePath เพื่ออัปเดตข้อมูลบนหน้า /dashboard, /posts และ /profile ทันที
 *
 * @param postId - รหัสประกาศที่ต้องการลบ
 */
export async function deleteMyPostAction(postId: string): Promise<ActionResponse> {
  try {
    await deletePost(postId);
    revalidatePath('/dashboard');
    revalidatePath('/posts');
    revalidatePath('/profile');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถลบประกาศได้';
    return { success: false, error: message };
  }
}
