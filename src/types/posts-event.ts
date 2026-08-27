/**
 * ประเภทเหตุการณ์ของประกาศ
 * ตรงกับ enum PostEventType จาก pawnd-be-template
 */
export type PostEventType =
  | 'POST_CREATED'
  | 'AI_MATCHES_FOUND'
  | 'AI_MATCH_CONFIRMED'
  | 'REUNITED'
  | 'POST_CLOSED';

/**
 * ข้อมูลเหตุการณ์ที่ Backend ส่งกลับจาก GET /posts/:id/events
 */
export interface PostEvent {
  id: string;
  eventType: PostEventType;
  description: string | null;
  createdAt: string;
}
