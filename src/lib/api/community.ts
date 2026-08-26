import { apiRequest } from './client';

import type {
  CommunityComment,
  CommunityLikeResult,
  CommunityPost,
  CommunityPostPage,
  CommunityPostType,
  CreatableCommunityPostType,
} from '@/types/type-community';

interface CommunityPostInput {
  type: CreatableCommunityPostType;
  title: string;
  content: string;
  relatedPetPostId?: string;
}

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
  input: CommunityPostInput,
  accessToken: string,
) {
  return apiRequest<{ id: string }>('/community/posts', {
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

  files.forEach((file) => {
    body.append('images', file);
  });

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
  return apiRequest<CommunityLikeResult>(`/community/posts/${postId}/like`, {
    method: 'PUT',
    accessToken,
  });
}

export function unlikeCommunityPost(postId: string, accessToken: string) {
  return apiRequest<CommunityLikeResult>(`/community/posts/${postId}/like`, {
    method: 'DELETE',
    accessToken,
  });
}

export function reportCommunityPost(
  postId: string,
  reason: string,
  accessToken: string,
) {
  return apiRequest<{ id: string }>('/reports', {
    method: 'POST',
    accessToken,
    body: JSON.stringify({
      reportType: 'POST',
      communityPostId: postId,
      reason,
    }),
  });
}
