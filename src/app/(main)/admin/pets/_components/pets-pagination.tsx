import Link from 'next/link';

import { cn } from '@/lib/utils';
import { PaginationMeta } from '@/types/admin';

interface PetsPaginationProps {
  pagination: PaginationMeta;
  shownCount: number;
  // ค่าตัวกรองปัจจุบัน (search/type) ที่ต้องแนบไปกับลิงก์เปลี่ยนหน้าทุกครั้ง
  // ไม่เช่นนั้นเปลี่ยนหน้าแล้วตัวกรองที่เลือกไว้จะหายไป
  queryParams: Record<string, string | undefined>;
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
 * PetsPagination (Server Component)
 * - แถบแบ่งหน้าสำหรับตารางสัตว์เลี้ยง ใช้ Link ไปที่ `?page=` พร้อมคงค่าตัวกรองเดิมไว้เสมอ
 */
export function PetsPagination({
  pagination,
  shownCount,
  queryParams,
}: PetsPaginationProps) {
  const { page, total, totalPages } = pagination;
  const pages = buildPageList(page, totalPages);

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', String(targetPage));
    return `?${params.toString()}`;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 text-sm sm:flex-row">
      <span className="text-xs text-muted-foreground">
        กำลังแสดงสัตว์เลี้ยง {shownCount.toLocaleString('th-TH')} ตัว
        จากทั้งหมด {total.toLocaleString('th-TH')} ตัว
      </span>

      <div className="flex items-center gap-1.5">
        <PageLink href={hrefFor(page - 1)} disabled={page <= 1}>
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
            <PageLink key={item} href={hrefFor(item)} active={item === page}>
              {item}
            </PageLink>
          ),
        )}

        <PageLink href={hrefFor(page + 1)} disabled={page >= totalPages}>
          ถัดไป
        </PageLink>
      </div>
    </div>
  );
}

interface PageLinkProps {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

function PageLink({ href, active, disabled, children }: PageLinkProps) {
  if (disabled) {
    return (
      <span className="flex h-8 min-w-8 items-center justify-center rounded-xl px-2.5 text-xs text-muted-foreground/50">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
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
