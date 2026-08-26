import Link from 'next/link';

import { cn } from '@/lib/utils';
import { PaginationMeta } from '@/types/admin';

interface UsersPaginationProps {
  pagination: PaginationMeta;
  shownCount: number;
}

// สร้างรายการเลขหน้าที่จะแสดง โดยแทรก 'ellipsis' เมื่อมีช่องว่างระหว่างเลขหน้า
function buildPageList(
  current: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const keep = new Set<number>(
    [
      1,
      2,
      totalPages - 1,
      totalPages,
      current - 1,
      current,
      current + 1,
    ].filter((page) => page >= 1 && page <= totalPages),
  );
  const sorted = [...keep].sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) {
      result.push('ellipsis');
    }
    result.push(page);
    previous = page;
  }
  return result;
}

/**
 * UsersPagination (Server Component)
 * - แถบแบ่งหน้าสำหรับตารางผู้ใช้งาน ใช้ Link ไปที่ `?page=` (ไม่ต้องใช้ Client State)
 */
export function UsersPagination({
  pagination,
  shownCount,
}: UsersPaginationProps) {
  const { page, total, totalPages } = pagination;
  const pages = buildPageList(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 text-sm sm:flex-row">
      <span className="text-xs text-muted-foreground">
        กำลังแสดงผู้ใช้ {shownCount.toLocaleString('th-TH')} คน จากทั้งหมด{' '}
        {total.toLocaleString('th-TH')} คน
      </span>

      <div className="flex items-center gap-1.5">
        <PageLink page={page - 1} disabled={page <= 1}>
          ก่อนหน้า
        </PageLink>

        {pages.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1.5 text-xs text-muted-foreground"
            >
              …
            </span>
          ) : (
            <PageLink key={item} page={item} active={item === page}>
              {item}
            </PageLink>
          ),
        )}

        <PageLink page={page + 1} disabled={page >= totalPages}>
          ถัดไป
        </PageLink>
      </div>
    </div>
  );
}

interface PageLinkProps {
  page: number;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

function PageLink({ page, active, disabled, children }: PageLinkProps) {
  if (disabled) {
    return (
      <span className="flex h-8 min-w-8 items-center justify-center rounded-xl px-2.5 text-xs text-muted-foreground/50">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={`?page=${page}`}
      className={cn(
        'flex h-8 min-w-8 items-center justify-center rounded-xl px-2.5 text-xs font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'border border-border text-foreground hover:bg-muted',
      )}
    >
      {children}
    </Link>
  );
}
