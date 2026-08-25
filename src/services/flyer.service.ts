export type FlyerTemplate = 'WANTED' | 'STANDARD' | 'REWARD_EMPHASIS';

export interface FlyerResponse {
  id: string;
  postId: string;
  template: FlyerTemplate;
  pdfUrl?: string;
  qrImageUrl?: string;
  createdAt: string;
}

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

/**
 * ดึงข้อมูลใบปลิวสำหรับประกาศ
 */
export async function getPostFlyer(postId: string): Promise<FlyerResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/flyer`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * สร้างหรืออัปเดตเทมเพลตใบปลิว
 */
export async function generateFlyer(
  postId: string,
  template: FlyerTemplate = 'WANTED'
): Promise<FlyerResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/flyer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ template }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * รับ URL สำหรับดาวน์โหลด PDF ใบปลิวโดยตรงจาก Backend
 */
export function getFlyerDownloadUrl(postId: string): string {
  return `${API_BASE_URL}/posts/${postId}/flyer/download`;
}
