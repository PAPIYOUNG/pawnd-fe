import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PostFilters } from './[id]/_components/post-filters';

import type { PetType, PostStatus, PostType } from '@/types/post';
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
  type?: string | string[];
  petType?: string | string[];
  status?: string | string[];
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
 * คืนค่าแรกของ query parameter กรณี URL มีค่า key เดิมมากกว่าหนึ่งค่า
 */
function getSingleSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** ตรวจสอบ PostType ที่อนุญาตจาก URL */
function parsePostType(
  value: string | string[] | undefined,
): PostType | undefined {
  const type = getSingleSearchParam(value);

  return type === 'LOST' || type === 'FOUND' ? type : undefined;
}

/** ตรวจสอบ PetType ที่อนุญาตจาก URL */
function parsePetType(
  value: string | string[] | undefined,
): PetType | undefined {
  const petType = getSingleSearchParam(value);

  return petType === 'DOG' ||
    petType === 'CAT' ||
    petType === 'BIRD' ||
    petType === 'HAMSTER' ||
    petType === 'EXOTIC' ||
    petType === 'OTHER'
    ? petType
    : undefined;
}

/** คืนสถานะที่หน้า posts อนุญาต โดยกำหนด ACTIVE เป็นค่าเริ่มต้น */
function parsePostStatus(value: string | string[] | undefined): PostStatus {
  const status = getSingleSearchParam(value);

  return status === 'REUNITED' || status === 'CLOSED' || status === 'ACTIVE'
    ? status
    : 'ACTIVE';
}

/** สร้าง URL Pagination โดยคง filter ทั้งสามตัวไว้ */
function createPostsHref(
  page: number,
  type: PostType | undefined,
  petType: PetType | undefined,
  status: PostStatus,
): string {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set('page', String(page));
  }

  if (type) {
    params.set('type', type);
  }

  if (petType) {
    params.set('petType', petType);
  }

  if (status !== 'ACTIVE') {
    params.set('status', status);
  }

  const queryString = params.toString();

  return queryString ? `/posts?${queryString}` : '/posts';
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
  const selectedType = parsePostType(resolvedSearchParams.type);
  const selectedPetType = parsePetType(resolvedSearchParams.petType);
  const selectedStatus = parsePostStatus(resolvedSearchParams.status);

  /** เรียก API พร้อมตัวกรองทั้ง 3 ค่า */
  const response = await getAllPosts({
    page: currentPage,
    limit: POSTS_PER_PAGE,
    type: selectedType,
    petType: selectedPetType,
    status: selectedStatus,
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

        <div className="flex flex-wrap items-center gap-2">
          <PostFilters
            selectedType={selectedType}
            selectedPetType={selectedPetType}
            selectedStatus={selectedStatus}
          />
        </div>
      </div>

      {/* 3. รายการการ์ดประกาศ */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => {
          const isLost = post.type === 'LOST';
          const isReunited = post.status === 'REUNITED';
          const isClosed = post.status === 'CLOSED' && post.type === 'FOUND';

          return (
            <div
              key={post.id}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md',
                isReunited && 'opacity-80',
                isClosed && 'border-muted-foreground/40 bg-muted grayscale',
              )}
            >
              {/* แถบคาดสำหรับประกาศ FOUND ที่ปิดแล้ว */}
              {isClosed && (
                <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-muted-foreground py-2 text-center text-xs font-bold tracking-widest text-background">
                  CLOSED
                </div>
              )}

              {/* ภาพหน้าปก */}
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <Image
                  src={post.coverImageUrl}
                  alt={post.petName}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* วางแถบสถานะตรงนี้ */}
                {isReunited && (
                  <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-primary py-2 text-center text-xs font-bold tracking-widest text-primary-foreground">
                    กลับบ้านแล้ว
                  </div>
                )}

                {isClosed && (
                  <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-foreground py-2 text-center text-xs font-bold tracking-widest text-background">
                    CLOSED
                  </div>
                )}

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
                <PaginationPrevious
                  href={createPostsHref(
                    currentPage - 1,
                    selectedType,
                    selectedPetType,
                    selectedStatus,
                  )}
                />
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
                    href={createPostsHref(
                      item,
                      selectedType,
                      selectedPetType,
                      selectedStatus,
                    )}
                    isActive={item === currentPage}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              {currentPage < totalPages ? (
                <PaginationNext
                  href={createPostsHref(
                    currentPage + 1,
                    selectedType,
                    selectedPetType,
                    selectedStatus,
                  )}
                />
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
