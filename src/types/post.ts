export type PostType = 'LOST' | 'FOUND';

export type PostStatus =
  'ACTIVE' | 'REUNITED' | 'CLOSED' | 'HIDDEN' | 'DELETED';

export type PetType = 'DOG' | 'CAT' | 'BIRD' | 'HAMSTER' | 'EXOTIC' | 'OTHER';

export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export interface LatestPostItem {
  id: string;
  type: PostType;
  status: PostStatus;
  petName: string;
  petType: PetType;
  breed?: string;
  gender?: PetGender;
  color?: string;
  ageDescription?: string;
  distinctiveFeatures?: string;
  description?: string;
  province: string;
  district?: string;
  subdistrict?: string;
  locationDetail?: string;
  rewardAmount?: number | null;
  contactPhone?: string;
  contactLineId?: string;
  timeAgo: string;
  coverImageUrl: string;
  images?: PostImageItem[];
  createdAt: string;
}

/** ผู้สร้างประกาศที่ Backend เปิดเผยในหน้า public post detail */
export interface PostOwnerSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface PostImage {
  id: string;
  postId: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

/** รูปภาพแบบย่อที่ใช้ในการ์ดประกาศและ service ของทีม */
export interface PostImageItem {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

/** PetPost response ที่ใช้ร่วมกันระหว่างหน้ารายการและหน้ารายละเอียด */
export interface PetPostDetail {
  id: string;
  userId: string;
  petId: string | null;
  type: PostType;
  status: PostStatus;
  petName: string | null;
  petType: PetType;
  breed: string | null;
  gender: PetGender | null;
  color: string | null;
  distinctiveFeatures: string | null;
  description: string | null;
  eventDate: string;
  latitude: string | number;
  longitude: string | number;
  province: string | null;
  district: string | null;
  subdistrict: string | null;
  locationDescription: string | null;
  rewardAmount: string | number | null;
  currentLocation: string | null;
  contactPhone: string | null;
  contactLineId: string | null;
  contactEmail: string | null;
  viewCount: number;
  reunitedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: PostOwnerSummary;
  images: PostImage[];
}

export interface PetPostListResponse {
  data: PetPostDetail[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Payload สำหรับ POST /posts ตรงตาม CreatePostDto ของ Backend */
export interface CreatePostPayload {
  petId?: string;
  type: PostType;
  petName?: string;
  petType: PetType;
  breed?: string;
  gender?: PetGender;
  color?: string;
  distinctiveFeatures?: string;
  description?: string;
  eventDate: string;
  latitude: number;
  longitude: number;
  province?: string;
  district?: string;
  subdistrict?: string;
  locationDescription?: string;
  rewardAmount?: number;
  currentLocation?: string;
  contactPhone?: string;
  contactLineId?: string;
  contactEmail?: string;
}

/** DTO แบบฟอร์มสร้างประกาศที่ยังใช้ในส่วน UI รุ่นเดิมของทีม */
export interface CreatePostDto {
  type: PostType;
  petName: string;
  petType: PetType;
  breed: string;
  gender: PetGender;
  color: string;
  distinctiveFeatures: string;
  description?: string;
  locationDescription: string;
  eventDate: string;
  rewardAmount?: number | null;
  contactPhone: string;
  contactLineId?: string;
  contactEmail?: string;
  imageUrls?: string[];
  isDraft?: boolean;
}

export interface CreatePostResponse {
  post: PetPostDetail;
  flyer: {
    flyer: {
      id: string;
      postId: string;
      fileUrl: string;
      qrUrl: string | null;
      generatedAt: string;
    };
  };
}
