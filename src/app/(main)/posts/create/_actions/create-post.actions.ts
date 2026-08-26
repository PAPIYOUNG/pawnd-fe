'use server';

import { createPost, CreatePostPayload } from '@/services/post.service';
import { analyzeImage } from '@/services/ai.service';

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
