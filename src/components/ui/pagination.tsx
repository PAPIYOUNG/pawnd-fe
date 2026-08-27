import Link from 'next/link';
import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * คอมโพเนนต์ Pagination แบบ Shadcn สำหรับแสดงตัวควบคุมการเปลี่ยนหน้า
 */
function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="Pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

/** คอนเทนเนอร์สำหรับจัดเรียงรายการใน Pagination */
function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
}

/** รายการแต่ละตำแหน่งของ Pagination */
function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<typeof Link>;

/** ลิงก์สำหรับเปลี่ยนไปยังหมายเลขหน้า */
function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({ variant: isActive ? 'outline' : 'ghost' }),
        'size-10 rounded-xl p-0',
        isActive && 'border-primary text-primary',
        className,
      )}
      {...props}
    />
  );
}

/** ปุ่มกลับไปหน้าก่อนหน้า */
function PaginationPrevious(
  props: React.ComponentProps<typeof PaginationLink>,
) {
  return (
    <PaginationLink
      aria-label="ไปหน้าก่อนหน้า"
      className="h-10 w-auto gap-1 rounded-xl px-3.5"
      {...props}
    >
      <ChevronLeft className="size-4" />
      <span>ก่อนหน้า</span>
    </PaginationLink>
  );
}

/** ปุ่มไปหน้าถัดไป */
function PaginationNext(props: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="ไปหน้าถัดไป"
      className="h-10 w-auto gap-1 rounded-xl px-3.5"
      {...props}
    >
      <span>ถัดไป</span>
      <ChevronRight className="size-4" />
    </PaginationLink>
  );
}

/** สัญลักษณ์แสดงว่ามีหน้าคั่นอยู่ */
function PaginationEllipsis() {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 items-center justify-center text-muted-foreground"
    >
      <MoreHorizontal className="size-4" />
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
