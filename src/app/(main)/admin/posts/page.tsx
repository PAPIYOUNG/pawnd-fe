import { Metadata } from 'next';
import Link from 'next/link';
import { Eye } from 'lucide-react';

import { PostStatusControl } from './_components/post-status-control';
import { PostsFilterBar } from './_components/posts-filter-bar';
import { PostsPagination } from './_components/posts-pagination';
import { POST_STATUS_LABEL, POST_TYPE_LABEL } from './_lib/post-labels';
import { getPostsAction } from '@/lib/action/admin.action';
import { formatThaiShortDate } from '@/lib/utils';
import { AdminPostListItem } from '@/types/admin';
import { PostStatus, PostType } from '@/types/post';

export const metadata: Metadata = {
  title: 'จัดการประกาศ | Admin',
};

const PAGE_SIZE = 20;

interface AdminPostsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
    status?: string;
  }>;
}

export default async function PostManage({
  searchParams,
}: AdminPostsPageProps) {
  const sp = await searchParams;

  const requestedPage = Number(sp.page);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const search = sp.search?.trim() || '';
  const type =
    sp.type && sp.type in POST_TYPE_LABEL ? (sp.type as PostType) : undefined;
  const status =
    sp.status && sp.status in POST_STATUS_LABEL
      ? (sp.status as PostStatus)
      : undefined;

  const result = await getPostsAction({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    type,
    status,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">จัดการประกาศ</h1>
        <p className="text-sm text-muted-foreground">
          รายการประกาศสัตว์เลี้ยงหาย/พบทั้งหมดในระบบ Pawnd
        </p>
      </div>

      <PostsFilterBar
        defaultSearch={search}
        defaultType={type ?? ''}
        defaultStatus={status ?? ''}
      />

      {'success' in result ? (
        // Error State: เรียก API รายการประกาศไม่สำเร็จ
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center">
          <span className="text-sm font-medium text-destructive">
            ไม่สามารถโหลดรายการประกาศได้
          </span>
          <p className="text-xs text-muted-foreground">{result.message}</p>
        </div>
      ) : result.posts.length === 0 ? (
        // Empty State: ไม่พบประกาศตามเงื่อนไข หรือยังไม่มีประกาศในระบบ
        <div className="flex h-40 items-center justify-center rounded-3xl border border-border bg-card text-sm text-muted-foreground">
          ไม่พบประกาศที่ตรงกับเงื่อนไขที่ค้นหา
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">ID</th>
                  <th className="py-3 pr-4 font-medium">หัวข้อประกาศ</th>
                  <th className="py-3 pr-4 font-medium">ผู้โพสต์</th>
                  <th className="py-3 pr-4 font-medium">ประเภท</th>
                  <th className="py-3 pr-4 font-medium">สถานะ</th>
                  <th className="py-3 pr-4 font-medium">วันที่โพสต์</th>
                  <th className="py-3 pl-4 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {result.posts.map((post) => (
                  <PostRow key={post.id} post={post} />
                ))}
              </tbody>
            </table>
          </div>

          <PostsPagination
            pagination={result.pagination}
            shownCount={result.posts.length}
            queryParams={{ search: search || undefined, type, status }}
          />
        </div>
      )}
    </div>
  );
}

function PostRow({ post }: { post: AdminPostListItem }) {
  const typeLabel = POST_TYPE_LABEL[post.type];
  const statusLabel = POST_STATUS_LABEL[post.status];

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td
        className="py-3 pr-4 font-mono text-xs text-muted-foreground"
        title={post.id}
      >
        {post.id.slice(0, 8)}
      </td>
      <td className="py-3 pr-4 font-semibold text-foreground">
        <Link
          href={`/admin/posts/${post.id}`}
          className="hover:text-primary hover:underline"
        >
          {post.petName}
        </Link>
        {post.breed && (
          <p className="mt-0.5 text-xs font-normal text-muted-foreground">
            {post.breed}
          </p>
        )}
      </td>
      <td className="py-3 pr-4 text-muted-foreground">
        {post.user.firstName} {post.user.lastName}
      </td>
      <td className="py-3 pr-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeLabel.className}`}
        >
          {typeLabel.text}
        </span>
      </td>
      <td className="py-3 pr-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusLabel.className}`}
        >
          {statusLabel.text}
        </span>
      </td>
      <td className="py-3 pr-4 text-muted-foreground">
        {formatThaiShortDate(post.createdAt)}
      </td>
      <td className="py-3 pl-4">
        <div className="flex flex-col items-end gap-2">
          <Link
            href={`/admin/posts/${post.id}`}
            title="ดูรายละเอียดประกาศ"
            aria-label={`ดูรายละเอียดประกาศ ${post.petName}`}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/70"
          >
            <Eye className="size-4" />
          </Link>
          <PostStatusControl postId={post.id} initialStatus={post.status} />
        </div>
      </td>
    </tr>
  );
}
