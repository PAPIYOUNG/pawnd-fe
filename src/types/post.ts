export type PostType = 'LOST' | 'FOUND';

export type PostStatus = 'ACTIVE' | 'REUNITED' | 'CLOSED' | 'HIDDEN' | 'DELETED';

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
