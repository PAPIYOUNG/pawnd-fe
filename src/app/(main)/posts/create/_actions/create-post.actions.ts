'use server';

import { createPost, CreatePostPayload } from '@/services/post.service';

/**
 * Server Action สำหรับสร้างประกาศตามหาสัตว์เลี้ยงใหม่
 */
export async function createPostAction(payload: CreatePostPayload) {
  try {
    const post = await createPost(payload);
    return { success: true, data: post };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถสร้างประกาศได้';
    return { success: false, error: message };
  }
}
