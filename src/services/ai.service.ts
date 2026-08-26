import { authFetch } from '@/lib/api/auth-fetch';
import { PetType, PostType, PostImageItem } from '@/types/post';

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

/**
 * ข้อมูลสำหรับส่งไปเจนภาพ Avatar สัตว์เลี้ยง (POST /ai/generate-pet-avatar)
 */
export interface GeneratePetAvatarDto {
  petId: string;
  imageUrls: string[];
}

/**
 * ผลลัพธ์จากการเจนภาพ Avatar สัตว์เลี้ยงจาก Backend
 */
export interface GeneratePetAvatarResponse {
  petId: string;
  sourceImages: { id: string; imageUrl: string }[];
  avatar: {
    imageUrl: string;
    model: string;
    style: string;
  };
  quota: {
    used: number;
    limit: number;
    remaining: number;
    cycle: number;
  };
}

/**
 * สร้างภาพ AI Avatar สำหรับสัตว์เลี้ยง (POST /ai/generate-pet-avatar)
 * - เรียกใช้ AI Studio ใน Backend เพื่อเจนภาพสไตล์ 3D Voxel
 * - ต้องระบุ petId และ imageUrls ของสัตว์เลี้ยงตัวนั้นอย่างน้อย 1 รูป
 * @param dto — { petId: string, imageUrls: string[] }
 */
export async function generatePetAvatar(
  dto: GeneratePetAvatarDto
): Promise<GeneratePetAvatarResponse> {
  return authFetch<GeneratePetAvatarResponse>('/ai/generate-pet-avatar', {
    method: 'POST',
    body: dto as unknown as Record<string, unknown>,
  });
}

/** ข้อมูลประกาศแบบย่อที่แนบมากับผลการค้นหาด้วยรูปภาพ (ตรงตาม Backend response ของ /ai/search-by-image) */
export interface AiSearchMatchPost {
  id: string;
  type: PostType;
  petType: PetType;
  breed: string | null;
  images: PostImageItem[];
  province: string | null;
  eventDate: string;
}

/** ผลจับคู่หนึ่งรายการจากการค้นหาด้วยรูปภาพ พร้อมคะแนนความคล้ายแยกตามสัญญาณ */
export interface AiSearchMatchItem {
  postId: string;
  vectorSimilarity: number;
  featureScore: number;
  finalScore: number;
  post: AiSearchMatchPost;
}

/** ผลลัพธ์ทั้งหมดจาก POST /ai/search-by-image */
export interface AiSearchByImageResult {
  totalCandidates: number;
  totalMatches: number;
  analysis: AiAnalysisResult;
  matches: AiSearchMatchItem[];
}

export interface SearchByImageParams {
  limit?: number;
  postType?: PostType;
}

/**
 * ค้นหาประกาศที่ใกล้เคียงจากรูปภาพโดยตรง (POST /ai/search-by-image)
 * ไม่ต้องมีประกาศต้นทางมาก่อน — Backend วิเคราะห์รูปและจับคู่กับประกาศที่มีอยู่แบบ Real-time
 * โดยไม่บันทึกรูปหรือสร้าง PetPost/AiMatch ใดๆ
 * @param file — ไฟล์รูปภาพ JPEG/PNG/WEBP ขนาดไม่เกิน 5MB
 * @param params — ตัวกรองเสริม: limit (จำนวนผลลัพธ์สูงสุด) และ postType (LOST/FOUND)
 */
export async function searchByImage(
  file: File,
  params: SearchByImageParams = {}
): Promise<AiSearchByImageResult> {
  const formData = new FormData();
  formData.append('image', file);

  const query = new URLSearchParams();
  if (params.limit) query.set('limit', String(params.limit));
  if (params.postType) query.set('postType', params.postType);
  const queryString = query.toString();

  return authFetch<AiSearchByImageResult>(
    `/ai/search-by-image${queryString ? `?${queryString}` : ''}`,
    {
      method: 'POST',
      body: formData as unknown as Record<string, unknown>,
    }
  );
}

