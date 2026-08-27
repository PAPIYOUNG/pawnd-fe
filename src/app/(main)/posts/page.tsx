import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Megaphone,
  Search,
  MapPin,
  Calendar,
  Sparkles,
  Plus,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import {
  getAllPosts,
  mapPostToLatestItem,
  MOCK_POSTS,
} from '@/services/post.service';

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
 * - แสดงสถานะ LOST / FOUND, พิกัดสถานที่, วันที่เวลา และจำนวนเคสที่ AI ตรวจจับได้
 */

// ดึงรายการประกาศจริงจาก Backend
// อ่านเลขหน้าจาก URL และดึงข้อมูลครั้งละ 8 รายการ
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

  // แปลงข้อมูล Backend เป็น Format ที่ UI Card ใช้งาน (ถ้าไม่มีข้อมูลให้ใช้ Mock เพื่อ UX)
  const posts =
    backendPosts.length > 0
      ? backendPosts.map(mapPostToLatestItem)
      : MOCK_POSTS;

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
            ค้นหา ช่วยเหลือ หรือแจ้งเบาะแสสัตว์เลี้ยงพลัดหลงด้วยระบบ AI Smart
            Matching
          </p>
        </div>

        <Link href="/posts/create">
          <Button className="h-11 w-full gap-2 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground shadow-md hover:bg-primary/90 sm:w-auto">
            <Plus className="size-5 stroke-[2.5]" />
            <span>สร้างประกาศใหม่</span>
          </Button>
        </Link>
      </div>

      {/* 2. แถบตัวกรองและการค้นหา */}
      <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-border/80 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="ค้นหาชื่อสัตว์เลี้ยง สายพันธุ์ สี หรือสถานที่..."
            className="h-10 rounded-2xl pl-10 text-xs sm:text-sm"
          />
          {/* ปุ่ม UI สำหรับ AI Search — ยังไม่มี logic/API */}
          <Button
            type="button"
            variant="secondary"
            aria-label="ค้นหาด้วย AI"
            title="ค้นหาด้วย AI"
            className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-xl bg-background px-2.5 text-xs font-semibold text-foreground shadow-xs hover:bg-muted sm:h-9 sm:px-3"
          >
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            <span className="hidden sm:inline">ค้นหาด้วย AI</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select className="h-10 rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm">
            <option value="ALL">ทุกประเภท (ทั้งหมด)</option>
            <option value="LOST">ตามหา (LOST)</option>
            <option value="FOUND">พบเห็น (FOUND)</option>
          </select>

          <select className="h-10 rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm">
            <option value="ALL">สัตว์ทุกชนิด</option>
            <option value="DOG">สุนัข</option>
            <option value="CAT">แมว</option>
            <option value="OTHER">อื่นๆ</option>
          </select>
        </div>
      </div>

      {/* 3. รายการการ์ดประกาศ */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => {
          const isLost = post.type === 'LOST';

          return (
            <div
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:shadow-xl dark:border-border/60"
            >
              {/* ภาพหน้าปก */}
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <Image
                  src={post.coverImageUrl}
                  alt={post.petName}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* ป้ายประเภทประกาศ */}
                <div className="absolute top-3 left-3">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-bold shadow-xs text-white',
                      isLost ? 'bg-destructive' : 'bg-emerald-600',
                    )}
                  >
                    {isLost ? 'ตามหา (LOST)' : 'พบเห็น (FOUND)'}
                  </span>
                </div>

                {/* ป้ายผลการจับคู่ AI (ถ้ามี) */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-emerald-400 backdrop-blur-xs">
                  <Sparkles className="size-3" />
                  <span>AI Smart Match</span>
                </div>
              </div>

              {/* ข้อมูลประกาศ */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-foreground group-hover:text-primary line-clamp-1">
                  {post.petName}
                </h3>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {post.breed || 'ไม่ระบุสายพันธุ์'}
                </span>

                <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    {post.locationDetail || post.province || 'ไม่ระบุสถานที่'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary shrink-0" />
                    {post.timeAgo}
                  </span>
                </div>

                {/* ปุ่ม Action */}
                <div className="mt-5 flex items-center gap-2 border-t border-border/50 pt-4">
                  <Link href={`/posts/${post.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="h-9 w-full rounded-xl text-xs font-semibold"
                    >
                      ดูรายละเอียด
                    </Button>
                  </Link>
                  <Link href={`/posts/${post.id}/flyer`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-xl text-xs text-primary font-semibold"
                    >
                      ใบปลิว
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
