import type {
  PetGender,
  PetType,
  PostImageItem,
  PostStatus,
  PostType,
} from './post';

/**
 * ai-match.ts
 * เก็บ Type ที่ตรงกับ Response ของ Backend `AiController` (ai.controller.ts)
 * สำหรับฟีเจอร์ AI Smart Matching ฝั่งเจ้าของประกาศ (public post detail page)
 */

/** คะแนนย่อยของการจับคู่ 1 รายการ เป็นค่า 0-1 (สัดส่วนความเหมือน) ยกเว้น distanceKm ที่เป็นกิโลเมตร */
export interface AiMatchScores {
  vectorSimilarity: number;
  featureScore: number;
  locationScore: number;
  dateScore: number;
  finalScore: number;
  distanceKm: number;
}

/** ข้อมูลย่อของประกาศฝั่งตรงข้ามที่ AI จับคู่มาให้ (Lost คู่กับ Found หรือกลับกัน) */
export interface AiMatchedPostSummary {
  id: string;
  type: PostType;
  status: PostStatus;
  petName: string | null;
  petType: PetType;
  breed: string | null;
  gender: PetGender | null;
  color: string | null;
  province: string | null;
  district: string | null;
  subdistrict: string | null;
  eventDate: string;
  images: PostImageItem[];
}

/** ผลการจับคู่ของ AI 1 รายการ จาก Backend `GET /ai/posts/:postId/matches` */
export interface AiMatchItem {
  matchId: string;
  matchedPost: AiMatchedPostSummary;
  scores: AiMatchScores;
  isNotified: boolean;
  /** สถานะ Pin/Dismiss ของ "ประกาศนี้" ต่อการจับคู่รายการนี้ (มาจากตาราง AiMatchUserAction) */
  isPinned: boolean;
  isDismissed: boolean;
  createdAt: string;
  updatedAt: string;
}

/** ผลลัพธ์เต็มจาก `GET /ai/posts/:postId/matches` */
export interface GetPostMatchesResult {
  postId: string;
  totalMatches: number;
  matches: AiMatchItem[];
}

/** ผลลัพธ์จากการสั่งประมวลผลจับคู่ใหม่ `POST /ai/match/:postId` */
export interface TriggerMatchResult {
  postId: string;
  totalCandidates: number;
  totalMatches: number;
}

/**
 * ผลลัพธ์จากการ Pin/Dismiss การจับคู่ 1 รายการ
 * (`PATCH /ai/posts/:postId/matches/:matchId/pin` และ `.../dismiss`)
 */
export interface ToggleMatchActionResult {
  matchId: string;
  postId: string;
  isPinned: boolean;
  isDismissed: boolean;
}
