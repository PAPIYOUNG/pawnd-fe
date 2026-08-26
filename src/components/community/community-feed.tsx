'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { listCommunityPosts } from '@/lib/api/community';
import type { CommunityPost, CommunityPostType } from '@/types/type-community';

import { CommunityFeedSkeleton } from './community-feed-skeleton';
import { CommunityPostCard } from './community-post-card';
import { CommunityPostForm } from './community-post-form';

type FeedFilter = CommunityPostType | 'ALL';

const tabs: Array<{ value: FeedFilter; label: string }> = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'STORY', label: 'เรื่องราว' },
  { value: 'QUESTION', label: 'ถาม-ตอบ' },
  { value: 'RECOMMENDATION', label: 'แนะนำ' },
];

interface CommunityFeedProps {
  accessToken?: string;
}

export function CommunityFeed({ accessToken }: CommunityFeedProps) {
  const [filter, setFilter] = useState<FeedFilter>('ALL');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [formOpen, setFormOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  function changeFilter(nextFilter: FeedFilter) {
    if (nextFilter === filter) {
      return;
    }

    setLoading(true);
    setError(undefined);
    setFilter(nextFilter);
  }

  function reloadPosts() {
    setLoading(true);
    setError(undefined);
    setReloadKey((value) => value + 1);
  }

  useEffect(() => {
    const controller = new AbortController();

    void listCommunityPosts(filter, controller.signal)
      .then((result) => {
        setPosts(result.data);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error ? cause.message : 'ไม่สามารถโหลดโพสต์ได้',
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [filter, reloadKey]);

  return (
    <main className="bg-muted/40 px-4 py-10 sm:px-6 lg:py-14">
      <section className="mx-auto w-full max-w-4xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              ชุมชนคนรักสัตว์
            </h1>

            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              พูดคุย แลกเปลี่ยนความรู้ และเรื่องราวประทับใจของคนรักสัตว์เลี้ยง
            </p>
          </div>

          {accessToken ? (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex h-10 items-center justify-center self-start rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/85"
            >
              ✍️ สร้างโพสต์ใหม่
            </button>
          ) : (
            <Link
              href="/login?returnTo=/community"
              className="inline-flex h-10 items-center justify-center self-start rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/85"
            >
              ✍️ สร้างโพสต์ใหม่
            </Link>
          )}
        </div>

        <div
          role="tablist"
          aria-label="ประเภทโพสต์"
          className="mt-8 grid grid-cols-2 gap-1 rounded-2xl bg-card p-1 md:grid-cols-4"
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={filter === tab.value}
              onClick={() => changeFilter(tab.value)}
              className={
                filter === tab.value
                  ? 'rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground'
                  : 'rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted'
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          {loading && <CommunityFeedSkeleton />}

          {!loading && error && (
            <div role="alert" className="rounded-2xl bg-card p-6 text-center">
              <p className="text-sm text-destructive">{error}</p>

              <button
                type="button"
                onClick={reloadPosts}
                className="mt-3 text-sm font-semibold text-primary hover:underline"
              >
                ลองใหม่
              </button>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <p className="rounded-2xl bg-card p-10 text-center text-muted-foreground">
              ยังไม่มีโพสต์ในหมวดนี้
            </p>
          )}

          {!loading &&
            !error &&
            posts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                accessToken={accessToken}
              />
            ))}
        </div>
      </section>

      <CommunityPostForm
        open={formOpen}
        accessToken={accessToken}
        onClose={() => setFormOpen(false)}
        onCreated={reloadPosts}
      />
    </main>
  );
}
