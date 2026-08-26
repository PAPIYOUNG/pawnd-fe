'use client';

import Image from 'next/image';
import { Heart, Link2, MessageCircle } from 'lucide-react';

import type { CommunityPost, CommunityPostType } from '@/types/type-community';
import { useState } from 'react';
import { likeCommunityPost, unlikeCommunityPost } from '@/lib/api/community';

const typeLabels: Record<
  CommunityPostType,
  { label: string; className: string }
> = {
  STORY: { label: 'เรื่องราว', className: 'bg-green-100 text-green-700' },
  QUESTION: { label: 'ถาม-ตอบ', className: 'bg-amber-100 text-amber-700' },
  RECOMMENDATION: {
    label: 'แนะนำ',
    className: 'bg-cyan-100 text-cyan-700',
  },
  LOST_PET: { label: 'สัตว์หาย', className: 'bg-red-100 text-red-700' },
  FOUND_PET: { label: 'พบสัตว์', className: 'bg-blue-100 text-blue-700' },
  OTHERS: { label: 'ทั่วไป', className: 'bg-muted text-muted-foreground' },
};

interface CommunityPostCardProps {
  post: CommunityPost;
  accessToken?: string;
}

export function CommunityPostCard({
  post,
  accessToken,
}: CommunityPostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [likePending, setLikePending] = useState(false);
  const [actionError, setActionError] = useState<string>();

  async function toggleLike() {
    if (!accessToken) {
      window.location.assign('/login?returnTo=/community');
      return;
    }

    setLikePending(true);
    setActionError(undefined);

    try {
      const result = liked
        ? await unlikeCommunityPost(post.id, accessToken)
        : await likeCommunityPost(post.id, accessToken);

      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (cause: unknown) {
      setActionError(
        cause instanceof Error ? cause.message : 'ไม่สามารถอัปเดตการถูกใจได้',
      );
    } finally {
      setLikePending(false);
    }
  }

  const badge = typeLabels[post.type];

  async function sharePost() {
    const url = `${window.location.origin}/community/${post.id}`;

    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.content, url });
      return;
    }

    await navigator.clipboard.writeText(url);
  }

  return (
    <article className="rounded-3xl bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
            {post.user.avatarUrl ? (
              <Image
                src={post.user.avatarUrl}
                alt={`${post.user.firstName} ${post.user.lastName}`}
                fill
                sizes="44px"
                className="object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center font-semibold text-primary">
                {post.user.firstName.slice(0, 1)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold">
              คุณ {post.user.firstName} {post.user.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Intl.DateTimeFormat('th-TH', {
                dateStyle: 'medium',
              }).format(new Date(post.createdAt))}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
        >
          {badge.label}
        </span>
      </header>

      <p className="mt-5 whitespace-pre-wrap text-sm leading-7 sm:text-base">
        {post.content}
      </p>

      {post.images.length > 0 && (
        <div className="mt-5 grid gap-2 overflow-hidden rounded-2xl">
          {post.images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-16/7 overflow-hidden bg-muted"
            >
              <Image
                src={image.imageUrl}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-6 border-t pt-4 text-sm text-muted-foreground">
        <button
          type="button"
          disabled={likePending}
          onClick={() => void toggleLike()}
          className="flex items-center gap-2 hover:text-primary"
        >
          <Heart className="size-4" />
          {likeCount} ถูกใจ
        </button>

        <button
          type="button"
          className="flex items-center gap-2 hover:text-primary"
        >
          <MessageCircle className="size-4" />
          {post._count.comments} ความเห็น
        </button>

        <button
          type="button"
          onClick={() => void sharePost()}
          className="flex items-center gap-2 hover:text-primary"
        >
          <Link2 className="size-4" />
          แชร์
        </button>
      </div>

      {actionError && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {actionError}
        </p>
      )}

      {post.comments[0] && (
        <div className="mt-4 rounded-xl bg-muted/70 px-4 py-3 text-sm">
          <p className="font-semibold">
            คุณ {post.comments[0].user.firstName}{' '}
            {post.comments[0].user.lastName}
          </p>
          <p className="mt-1 text-muted-foreground">
            {post.comments[0].content}
          </p>
        </div>
      )}
    </article>
  );
}
