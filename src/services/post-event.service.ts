import { apiFetch } from '@/lib/api/api-fetch';
import type { PostEvent } from '@/types/posts-event';

/**
 * ดึงประวัติเหตุการณ์ของประกาศ
 * Endpoint เป็น public จึงใช้ apiFetch โดยไม่ต้องส่ง access token
 */
export async function getPostEvents(postId: string): Promise<PostEvent[]> {
  return apiFetch<PostEvent[]>(`/posts/${postId}/events`, {
    // เหตุการณ์มีการเปลี่ยนแปลงตามสถานะโพสต์ จึงไม่เก็บ cache
    cache: 'no-store',
  });
}
