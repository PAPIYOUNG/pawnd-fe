import { apiFetch } from '@/lib/api/api-fetch';
import { authFetch } from '@/lib/api/auth-fetch';
import type {
  CreatePostPayload,
  CreatePostResponse,
  LatestPostItem,
  PostStatus,
  PostType,
} from '@/types/post';

export type { CreatePostPayload } from '@/types/post';

/**
 * Post Service — จัดการประกาศตามหาสัตว์เลี้ยง (Lost & Found Posts)
 * - Public endpoints (ดูรายการ, ค้นหา, ดูรายละเอียด) → ใช้ apiFetch (ไม่ต้อง token)
 * - Protected endpoints (สร้าง, แก้ไข, ลบ) → ใช้ authFetch (ส่ง token อัตโนมัติ)
 *
 * หมายเหตุ: Backend POST endpoints ส่ง response แบบ paginated:
 * { data: [...posts], meta: { page, limit, total, totalPages } }
 * แต่ TransformInterceptor จะ wrap อีกชั้นเป็น { success, data: { data: [...], meta: {...} } }
 * → apiFetch unwrap ได้ { data: [...posts], meta: {...} }
 */

/** ข้อมูลโพสต์เต็มรูปแบบที่ Backend ส่งกลับ (รวม user, pet, images) */
export interface PostDetail {
  id: string;
  /** Backend PetPost ใช้ userId เป็น foreign key ของผู้ลงประกาศ */
  userId: string;
  petId?: string | null;
  type: PostType;
  status: PostStatus;
  petName?: string;
  petType?: string;
  breed?: string;
  gender?: string;
  color?: string;
  distinctiveFeatures?: string;
  description?: string;
  eventDate?: string;
  latitude?: number;
  longitude?: number;
  province?: string;
  district?: string;
  subdistrict?: string;
  locationDescription?: string;
  rewardAmount?: number | null;
  currentLocation?: string;
  contactPhone?: string;
  contactLineId?: string;
  contactEmail?: string;
  reunitedAt?: string | null;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  pet?: {
    id: string;
    name: string;
    type: string;
    breed?: string;
    age?: number | null;
    profileImageUrl?: string | null;
  } | null;
  images?: {
    id: string;
    imageUrl: string;
    publicId?: string;
    sortOrder: number;
  }[];
}

/** ข้อมูล Pagination metadata ที่ Backend ส่งกลับ */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Response แบบ paginated สำหรับรายการโพสต์ */
export interface PaginatedPostsResponse {
  data: PostDetail[];
  meta: PaginationMeta;
}

/** พารามิเตอร์สำหรับ query รายการโพสต์ */
export interface PostQueryParams {
  page?: number;
  limit?: number;
  type?: PostType;
  status?: string;
  petType?: string;
}

/** พารามิเตอร์สำหรับค้นหาโพสต์ */
export interface SearchPostsParams extends PostQueryParams {
  q?: string;
  province?: string;
  district?: string;
  minReward?: number;
  maxReward?: number;
  eventFrom?: string;
  eventTo?: string;
}

/** Mock ข้อมูลรายการโพสต์จำลอง สำหรับ fallback เมื่อ Backend ไม่พร้อม */
export const MOCK_POSTS: LatestPostItem[] = [
  {
    id: 'post-1',
    type: 'LOST',
    petName: 'น้องลูน่า (Luna) แมววิเชียรมาศ',
    petType: 'CAT',
    breed: 'วิเชียรมาศ',
    province: 'กรุงเทพฯ',
    locationDetail: 'พญาไท, กรุงเทพฯ',
    timeAgo: '10 นาทีที่แล้ว',
    coverImageUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'post-2',
    type: 'FOUND',
    petName: 'พบเห็นสุนัขไซบีเรียน ฮัสกี้ ปลอกคอดำ',
    petType: 'DOG',
    breed: 'ไซบีเรียน ฮัสกี้',
    province: 'นนทบุรี',
    locationDetail: 'งามวงศ์วาน, นนทบุรี',
    timeAgo: '1 ชั่วโมงที่แล้ว',
    coverImageUrl:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=600&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'post-3',
    type: 'LOST',
    petName: 'ช็อกโก้ สุนัขพุดเดิลสีน้ำตาล',
    petType: 'DOG',
    breed: 'พุดเดิ้ลทอย',
    province: 'กรุงเทพฯ',
    locationDetail: 'ลาดพร้าว 101, กรุงเทพฯ',
    timeAgo: '3 ชั่วโมงที่แล้ว',
    coverImageUrl:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=600&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'post-4',
    type: 'LOST',
    petName: 'น้องส้มส้ม แมวลายเสือส้ม สวมกระดิ่งแดง',
    petType: 'CAT',
    breed: 'พันธุ์ไทยผสมเปอร์เซีย',
    province: 'กรุงเทพฯ',
    locationDetail: 'ดินแดง, กรุงเทพฯ',
    timeAgo: '5 ชั่วโมงที่แล้ว',
    coverImageUrl:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=600&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
];

/**
 * สร้าง query string จาก object parameters
 * กรองค่า undefined ออกก่อนสร้าง URL params
 */
function buildQueryString(params: Record<string, unknown>): string {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (filtered.length === 0) return '';
  return (
    '?' +
    new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString()
  );
}

/**
 * ดึงรายการประกาศทั้งหมด (GET /posts)
 * Endpoint นี้เป็น public — ใช้ apiFetch ไม่ต้อง token
 * Backend ส่ง paginated response: { data: [...], meta: {...} }
 */
export async function getAllPosts(
  params: PostQueryParams = {},
): Promise<PaginatedPostsResponse> {
  try {
    const qs = buildQueryString(params as Record<string, unknown>);
    const response = await apiFetch<PaginatedPostsResponse>(`/posts${qs}`, {
      next: { revalidate: 30 },
    });
    return response;
  } catch {
    // Fallback เป็น mock data เมื่อ Backend ไม่พร้อม
    return {
      data: MOCK_POSTS as unknown as PostDetail[],
      meta: { page: 1, limit: 20, total: MOCK_POSTS.length, totalPages: 1 },
    };
  }
}

/**
 * ดึงรายละเอียดประกาศรายเดี่ยว (GET /posts/:id)
 * Endpoint นี้เป็น public
 */
export async function getPostById(id: string): Promise<PostDetail | null> {
  try {
    return await apiFetch<PostDetail>(`/posts/${id}`);
  } catch {
    return null;
  }
}

/**
 * ดึงประกาศของผู้ใช้ปัจจุบัน (GET /posts/me)
 * ต้อง login — ใช้ authFetch
 */
export async function getMyPosts(): Promise<PostDetail[]> {
  try {
    const response = await authFetch<PaginatedPostsResponse>('/posts/me');
    return response.data || [];
  } catch {
    return [];
  }
}

/**
 * ค้นหาประกาศด้วยคำค้น ตัวกรอง และช่วงเวลา (GET /posts/search)
 * Endpoint นี้เป็น public
 */
export async function searchPosts(
  params: SearchPostsParams = {},
): Promise<PaginatedPostsResponse> {
  try {
    const qs = buildQueryString(params as Record<string, unknown>);
    return await apiFetch<PaginatedPostsResponse>(`/posts/search${qs}`, {
      next: { revalidate: 0 },
    });
  } catch {
    return {
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }
}

/**
 * สร้างประกาศตามหาสัตว์เลี้ยงใหม่ (POST /posts)
 * ต้อง login — ใช้ authFetch
 * @param payload — ข้อมูลประกาศใหม่ตาม CreatePostDto ของ Backend
 */
export async function createPost(
  payload: CreatePostPayload,
): Promise<CreatePostResponse> {
  return authFetch<CreatePostResponse>('/posts', {
    method: 'POST',
    body: payload as unknown as Record<string, unknown>,
  });
}

/**
 * แก้ไขประกาศ (PATCH /posts/:id)
 * ต้อง login — ใช้ authFetch
 */
export async function updatePost(
  id: string,
  data: Partial<CreatePostPayload> & { status?: string },
): Promise<PostDetail> {
  return authFetch<PostDetail>(`/posts/${id}`, {
    method: 'PATCH',
    body: data as Record<string, unknown>,
  });
}

/**
 * ลบประกาศ (DELETE /posts/:id)
 * ต้อง login — ใช้ authFetch
 */
export async function deletePost(id: string): Promise<void> {
  await authFetch<void>(`/posts/${id}`, {
    method: 'DELETE',
  });
}

/**
 * อัปโหลดรูปภาพเพิ่มเติมให้ประกาศ (POST /posts/:id/images)
 * รองรับสูงสุด 3 รูปต่อประกาศ (ตาม business validation ใน Backend)
 * ส่งเป็น FormData (multipart/form-data)
 */
export async function uploadPostImages(
  postId: string,
  files: File[],
): Promise<unknown> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  return authFetch(`/posts/${postId}/images`, {
    method: 'POST',
    body: formData as unknown as Record<string, unknown>,
  });
}

/**
 * ดึงสถิติจำนวนประกาศตามสถานะและประเภท (GET /posts/stats)
 * Endpoint นี้เป็น public
 */
export async function getPostStats(): Promise<Record<string, number>> {
  try {
    return await apiFetch<Record<string, number>>('/posts/stats');
  } catch {
    return {};
  }
}

/**
 * ตรวจสอบและทำความสะอาดข้อความ ป้องกันค่าว่าง, 'Unknown' หรือเครื่องหมาย '?' ล้วน
 */
function sanitizeText(value?: string | null, fallback = ''): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (
    trimmed === '' ||
    trimmed.toLowerCase() === 'unknown' ||
    /^[\s?？]+$/.test(trimmed)
  ) {
    return fallback;
  }
  return trimmed;
}

/**
 * แปลงชื่อสัตว์เลี้ยงให้เหมาะสมตามประเภทประกาศ
 * - ถ้าเป็น FOUND (พบสัตว์พลัดหลง) และไม่มีชื่อ ให้แสดง "ไม่ทราบชื่อ"
 * - ถ้าเป็น LOST (สัตว์หาย) และไม่มีชื่อ ให้แสดง "สัตว์เลี้ยง (ไม่ระบุชื่อ)"
 */
function resolvePetName(rawName?: string | null, postType?: PostType): string {
  const defaultName =
    postType === 'FOUND' ? 'ไม่ทราบชื่อ' : 'สัตว์เลี้ยง (ไม่ระบุชื่อ)';
  return sanitizeText(rawName, defaultName);
}

/**
 * แปลง PostDetail จาก Backend เป็น LatestPostItem ที่ UI cards ใช้
 * ใช้สำหรับ mapping ข้อมูลจริงให้ตรงกับ component props
 */
export function mapPostToLatestItem(post: PostDetail): LatestPostItem {
  // คำนวณเวลาที่ผ่านไปจาก createdAt
  const diff = Date.now() - new Date(post.createdAt).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  let timeAgo = 'เมื่อสักครู่';
  if (days > 0) {
    timeAgo = `${days} วันที่แล้ว`;
  } else if (hours > 0) {
    timeAgo = `${hours} ชั่วโมงที่แล้ว`;
  }

  const cleanProvince = sanitizeText(post.province, 'ไม่ระบุ');
  const cleanLocationDetail = sanitizeText(
    post.locationDescription,
    cleanProvince,
  );

  return {
    id: post.id,
    type: post.type,
    petName: resolvePetName(post.petName || post.pet?.name, post.type),
    petType: (post.petType ||
      post.pet?.type ||
      'DOG') as LatestPostItem['petType'],
    breed: sanitizeText(post.breed || post.pet?.breed, undefined),
    gender: post.gender as LatestPostItem['gender'],
    color: sanitizeText(post.color, undefined),
    distinctiveFeatures: sanitizeText(post.distinctiveFeatures, undefined),
    description: sanitizeText(post.description, undefined),
    province: cleanProvince,
    district: sanitizeText(post.district, undefined),
    locationDetail: cleanLocationDetail,
    rewardAmount: post.rewardAmount,
    contactPhone: sanitizeText(post.contactPhone, undefined),
    timeAgo,
    coverImageUrl:
      (post.images && post.images.length > 0
        ? post.images[0].imageUrl
        : post.pet?.profileImageUrl) ||
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop',
    images: post.images?.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      sortOrder: img.sortOrder,
    })),
    createdAt: post.createdAt,
  };
}
