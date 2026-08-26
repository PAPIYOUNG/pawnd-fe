import { authFetch } from '@/lib/api/auth-fetch';
import { PetType } from '@/types/post';

/**
 * AI Service — เรียกใช้ AI Vision Analysis ของ Backend สำหรับวิเคราะห์รูปภาพสัตว์เลี้ยง
 * Endpoint นี้ต้อง login — ใช้ authFetch (ส่ง Bearer token อัตโนมัติ)
 */

/** ผลลัพธ์การวิเคราะห์ภาพสัตว์เลี้ยงจาก AI (ตรงตาม Backend AiAnalysisResult) */
export interface AiAnalysisResult {
  type: PetType;
  breed: string | null;
  color: string | null;
  distinctiveFeatures: string | null;
  description: string | null;
}

/**
 * วิเคราะห์รูปภาพสัตว์เลี้ยงด้วย AI (POST /ai/analyze-image)
 * รองรับทั้ง URL ของรูปที่อัปโหลดขึ้น server แล้ว และ Base64 Data URL
 * (สำหรับรูปที่ยังไม่ได้อัปโหลด เนื่องจากยังไม่มีประกาศให้ผูกไฟล์ด้วย)
 * @param imageUrl — URL หรือ Base64 Data URL ของรูปภาพที่ต้องการวิเคราะห์
 */
export async function analyzeImage(imageUrl: string): Promise<AiAnalysisResult> {
  return authFetch<AiAnalysisResult>('/ai/analyze-image', {
    method: 'POST',
    body: { imageUrl },
  });
}
