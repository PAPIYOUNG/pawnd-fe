import { Metadata } from 'next';
import Link from 'next/link';
import { Megaphone, Search, Plus } from 'lucide-react';
import { redirect } from 'next/navigation';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllPosts, mapPostToLatestItem } from '@/services/post.service';

import { AiMatchUploadDialog } from './_components/ai-match-upload-dialog';
import { PostCard } from './_components/post-card';

export const metadata: Metadata = {
  title: 'รายการประกาศตามหาสัตว์เลี้ยง | PAWND',
  description:
    'ค้นหาและกรองประกาศสัตว์เลี้ยงหายและพบสัตว์เลี้ยงหลงทางทั่วประเทศ',
};

/** จำนวนประกาศที่ต้องการแสดงในหนึ่งหน้า */
const POSTS_PER_PAGE = 8;

type PostsPageSearchParams = {
  page?: string | string[];
};

type PostsPageProps = {
  searchParams: Promise<PostsPageSearchParams>;
};

/**
 * แปลงค่า page จาก URL ให้เป็นเลขหน้าที่ปลอดภัย โดยเริ่มต้นที่หน้า 1
 */
function parsePage(value: string | string[] | undefined): number {
  const pageValue = Array.isArray(value) ? value[0] : value;
  const page = Number(pageValue);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

/**
 * สร้างรายการหมายเลขหน้าสำหรับ UI โดยย่อหน้าที่อยู่ห่างออกไปด้วย ellipsis
 */
function buildPageItems(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ];
}

/**
 * PostsPage (Server Component - RSC)
 * - หน้ารายการประกาศตามหาสัตว์เลี้ยงทั้งหมด (Post List & Filter)
 * - ดึงข้อมูลประกาศจริงจาก Backend ผ่าน getAllPosts()
 * - แสดงสถานะ LOST / FOUND, พิกัดสถานที่, วันที่เวลา
 */
export default async function PostsPage({ searchParams }: PostsPageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parsePage(resolvedSearchParams.page);

  const response = await getAllPosts({
    page: currentPage,
    limit: POSTS_PER_PAGE,
  });

  const backendPosts = response.data || [];

  // ป้องกัน URL ที่ระบุเลขหน้ามากกว่าหน้าที่มีอยู่จริง
  if (response.meta.totalPages > 0 && currentPage > response.meta.totalPages) {
    redirect(`/posts?page=${response.meta.totalPages}`);
  }

  // แปลงข้อมูล Backend เป็น Format ที่ UI Card ใช้งานจริง
  const posts = backendPosts.map(mapPostToLatestItem);

  const totalPages = response.meta.totalPages;
  const pageItems = buildPageItems(currentPage, totalPages);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* 1. ส่วนหัวของหน้าประกาศ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Megaphone className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Lost & Found Feed
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            ประกาศสัตว์เลี้ยงหาย & พบสัตว์เลี้ยง
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            ศูนย์รวมประกาศตามหาและช่วยเหลือสัตว์เลี้ยงพลัดหลงแบบเรียลไทม์
          </p>
        </div>

        {/* ปุ่ม CTA อัปโหลดรูปค้นหา และสร้างประกาศ */}
        <div className="flex items-center gap-3">
          <AiMatchUploadDialog />

          <Link href="/posts/create">
            <Button className="h-10 rounded-2xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] sm:text-sm">
              <Plus className="mr-1.5 size-4" />
              สร้างประกาศใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. เครื่องมือค้นหาและฟิลเตอร์ */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* กล่องค้นหา */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาตามชื่อสัตว์เลี้ยง, สายพันธุ์, ปลอกคอ หรือพิกัดสถานที่..."
            className="h-10 rounded-2xl pl-9 text-xs sm:text-sm"
          />
        </div>

        {/* ตัวกรองแบบด่วน (Quick Filters) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select className="h-10 rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm">
            <option value="ALL">ทุกประเภท (ทั้งหมด)</option>
            <option value="LOST">เฉพาะสัตว์หาย (LOST)</option>
            <option value="FOUND">เฉพาะพบเห็น (FOUND)</option>
          </select>

          <select className="h-10 rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm">
            <option value="ALL">สัตว์ทุกชนิด</option>
            <option value="DOG">สุนัข</option>
            <option value="CAT">แมว</option>
            <option value="OTHER">อื่นๆ</option>
          </select>
        </div>
      </div>

      {/* 3. รายการการ์ดประกาศ หรือ Empty State */}
      {posts.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Megaphone className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">
            ยังไม่มีรายการประกาศในระบบ
          </h3>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            เมื่อมีประกาศตามหาหรือพบสัตว์เลี้ยงใหม่ๆ จะแสดงขึ้นที่นี่
          </p>
          <Link href="/posts/create" className="mt-5">
            <Button className="rounded-2xl bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
              <Plus className="mr-1.5 size-4" />
              สร้างประกาศใหม่
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} priority={index === 0} />
          ))}
        </div>
      )}

      {/* วาง Pagination ตรงนี้ */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              {currentPage > 1 ? (
                <PaginationPrevious href={`/posts?page=${currentPage - 1}`} />
              ) : (
                <span className="inline-flex h-10 items-center rounded-xl px-3.5 text-sm text-muted-foreground/50">
                  ก่อนหน้า
                </span>
              )}
            </PaginationItem>

            {pageItems.map((item, index) => (
              <PaginationItem key={`${item}-${index}`}>
                {item === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href={`/posts?page=${item}`}
                    isActive={item === currentPage}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              {currentPage < totalPages ? (
                <PaginationNext href={`/posts?page=${currentPage + 1}`} />
              ) : (
                <span className="inline-flex h-10 items-center rounded-xl px-3.5 text-sm text-muted-foreground/50">
                  ถัดไป
                </span>
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
