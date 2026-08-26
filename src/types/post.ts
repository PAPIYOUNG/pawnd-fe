export type PostType = 'LOST' | 'FOUND';

export type PostStatus = 'ACTIVE' | 'REUNITED' | 'CLOSED' | 'HIDDEN' | 'DELETED';

export type PetType = 'DOG' | 'CAT' | 'BIRD' | 'HAMSTER' | 'EXOTIC' | 'OTHER';

export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export interface PostImageItem {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface LatestPostItem {
  id: string;
  type: PostType;
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
