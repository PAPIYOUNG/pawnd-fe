export type CommunityPostType =
  'LOST_PET' | 'FOUND_PET' | 'OTHERS' | 'STORY' | 'QUESTION' | 'RECOMMENDATION';

export interface CommunityUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface CommunityPostImage {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface CommunityComment {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  user: CommunityUser;
}

export interface CommunityPost {
  id: string;
  type: CommunityPostType;
  title: string;
  content: string;
  relatedPetPostId: string | null;
  createdAt: string;
  user: CommunityUser;
  images: CommunityPostImage[];
  comments: CommunityComment[];
  _count: {
    likes: number;
    comments: number;
  };
}

export interface CommunityPostPage {
  data: CommunityPost[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
