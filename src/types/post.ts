export type PostType = 'LOST' | 'FOUND';

export type PostStatus =
  'ACTIVE' | 'REUNITED' | 'CLOSED' | 'HIDDEN' | 'DELETED';

export type PetType = 'DOG' | 'CAT' | 'BIRD' | 'HAMSTER' | 'EXOTIC' | 'OTHER';

export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export interface LatestPostItem {
  id: string;
  type: PostType;
  petName: string;
  petType: PetType;
  breed?: string;
  gender?: PetGender;
  ageDescription?: string;
  province: string;
  locationDetail?: string;
  timeAgo: string;
  coverImageUrl: string;
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
