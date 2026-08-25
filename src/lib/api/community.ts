import { apiRequest } from './client';
import type {
  CommunityComment,
  CommunityPost,
  CommunityPostPage,
  CommunityPostType,
} from '@/types/type-community';

export function listCommunityPosts(
  type: CommunityPostType | 'ALL',
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({
    page: '1',
    limit: '20',
  });

  if (type !== 'ALL') {
    query.set('type', type);
  }

  return apiRequest<CommunityPostPage>(`/community/posts?${query.toString()}`, {
    signal,
  });
}

export function createCommunityPost(
  input: {
    type: CommunityPostType;
    title: string;
    content: string;
    relatedPetPostId?: string;
  },
  accessToken: string,
) {
  return apiRequest<CommunityPost>('/community/posts', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}

export function uploadCommunityImages(
  postId: string,
  files: File[],
  accessToken: string,
) {
  const body = new FormData();

  files.forEach((file) => body.append('images', file));

  return apiRequest<{ images: CommunityPost['images'] }>(
    `/community/posts/${postId}/images`,
    {
      method: 'POST',
      accessToken,
      body,
    },
  );
}

export function addCommunityComment(
  postId: string,
  content: string,
  accessToken: string,
) {
  return apiRequest<CommunityComment>(`/community/posts/${postId}/comments`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ content }),
  });
}

export function likeCommunityPost(postId: string, accessToken: string) {
  return apiRequest<{ liked: true; likeCount: number }>(
    `/community/posts/${postId}/like`,
    {
      method: 'PUT',
      accessToken,
    },
  );
}

export function unlikeCommunityPost(postId: string, accessToken: string) {
  return apiRequest<{ liked: false; likeCount: number }>(
    `/community/posts/${postId}/like`,
    {
      method: 'DELETE',
      accessToken,
    },
  );
}
