import { apiFetch } from '@/lib/api/api-fetch';
import type {
  CreatePostPayload,
  CreatePostResponse,
  PetPostDetail,
  PetPostListResponse,
  PetType,
  PostType,
} from '@/types/post';

interface GetPostsOptions {
  page?: number;
  limit?: number;
  type?: PostType;
  petType?: PetType;
}

interface SearchPostsOptions extends GetPostsOptions {
  q: string;
}

/** โหลดประกาศ ACTIVE จาก Backend โดยไม่ใช้ mock fallback */
export function getPosts(
  options: GetPostsOptions = {},
): Promise<PetPostListResponse> {
  const query = new URLSearchParams({
    page: String(options.page ?? 1),
    limit: String(options.limit ?? 20),
  });
  if (options.type) query.set('type', options.type);
  if (options.petType) query.set('petType', options.petType);

  return apiFetch<PetPostListResponse>(`/posts?${query.toString()}`, {
    cache: 'no-store',
  });
}

/** ค้นหาประกาศด้วย endpoint เดิมของ Backend พร้อมตัวกรองที่รองรับ */
export function searchPosts(
  options: SearchPostsOptions,
): Promise<PetPostListResponse> {
  const query = new URLSearchParams({
    q: options.q,
    page: String(options.page ?? 1),
    limit: String(options.limit ?? 20),
  });
  if (options.type) query.set('type', options.type);
  if (options.petType) query.set('petType', options.petType);

  return apiFetch<PetPostListResponse>(`/posts/search?${query.toString()}`, {
    cache: 'no-store',
  });
}

/** โหลด public post detail สำหรับ route /posts/[id] */
export function getPostById(id: string): Promise<PetPostDetail> {
  return apiFetch<PetPostDetail>(`/posts/${id}`, { cache: 'no-store' });
}

/** สร้างประกาศจริงด้วย access token จาก NextAuth Server Action */
export function createPostRequest(
  payload: CreatePostPayload,
  accessToken: string,
): Promise<CreatePostResponse> {
  return apiFetch<CreatePostResponse>('/posts', {
    method: 'POST',
    token: accessToken,
    body: { ...payload },
    cache: 'no-store',
  });
}
