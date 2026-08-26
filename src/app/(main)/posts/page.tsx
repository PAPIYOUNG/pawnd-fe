import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Megaphone,
  Search,
  MapPin,
  Calendar,
  Plus,
  PawPrint,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getPosts, searchPosts } from '@/services/post.service';
import type { PetType, PostType } from '@/types/post';

export const metadata: Metadata = {
  title: 'รายการประกาศตามหาสัตว์เลี้ยง | PAWND',
  description:
    'ค้นหาและกรองประกาศสัตว์เลี้ยงหายและพบสัตว์เลี้ยงหลงทางทั่วประเทศ',
};

const postDateFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
});

/**
 * PostsPage (Server Component - RSC)
 * - หน้ารายการประกาศตามหาสัตว์เลี้ยงทั้งหมด (Post List & Filter)
 */
interface PostsPageProps {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
    petType?: string | string[];
  }>;
}

const postTypes = new Set<PostType>(['LOST', 'FOUND']);
const petTypes = new Set<PetType>([
  'DOG',
  'CAT',
  'BIRD',
  'HAMSTER',
  'EXOTIC',
  'OTHER',
]);

function firstQueryValue(value?: string | string[]): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const q = firstQueryValue(params.q).trim();
  const requestedType = firstQueryValue(params.type);
  const requestedPetType = firstQueryValue(params.petType);
  const type = postTypes.has(requestedType as PostType)
    ? (requestedType as PostType)
    : undefined;
  const petType = petTypes.has(requestedPetType as PetType)
    ? (requestedPetType as PetType)
    : undefined;
  let posts = [] as Awaited<ReturnType<typeof getPosts>>['data'];
  let loadError = false;

  try {
    const response = q
      ? await searchPosts({ q, type, petType, limit: 20 })
      : await getPosts({ type, petType, limit: 20 });
    posts = response.data;
  } catch {
    loadError = true;
  }

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
      <form
        action="/posts"
        method="get"
        className="mt-6 flex flex-col gap-3 rounded-3xl border border-border/80 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="ค้นหาชื่อสัตว์เลี้ยง สายพันธุ์ สี หรือสถานที่..."
            className="h-10 rounded-2xl pl-10 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            name="type"
            defaultValue={type ?? 'ALL'}
            className="h-10 rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm"
          >
            <option value="ALL">ทุกประเภท (ทั้งหมด)</option>
            <option value="LOST">ตามหา (LOST)</option>
            <option value="FOUND">พบเห็น (FOUND)</option>
          </select>

          <select
            name="petType"
            defaultValue={petType ?? 'ALL'}
            className="h-10 rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm"
          >
            <option value="ALL">สัตว์ทุกชนิด</option>
            <option value="DOG">สุนัข</option>
            <option value="CAT">แมว</option>
            <option value="BIRD">นก</option>
            <option value="HAMSTER">แฮมสเตอร์</option>
            <option value="EXOTIC">สัตว์พิเศษ</option>
            <option value="OTHER">อื่นๆ</option>
          </select>
          <Button type="submit" className="h-10 rounded-2xl px-5">
            ค้นหา
          </Button>
        </div>
      </form>

      {/* 3. รายการการ์ดประกาศ */}
      {loadError && (
        <div className="mt-8 rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="font-semibold text-destructive">
            โหลดรายการประกาศไม่สำเร็จ
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            กรุณารีเฟรชหน้าแล้วลองใหม่อีกครั้ง
          </p>
        </div>
      )}
      {!loadError && posts.length === 0 && (
        <div className="mt-8 rounded-3xl border border-border bg-card p-10 text-center">
          <PawPrint className="mx-auto size-12 text-muted-foreground/50" />
          <p className="mt-3 font-semibold">
            {q || type || petType
              ? 'ไม่พบประกาศที่ตรงกับการค้นหา'
              : 'ยังไม่มีประกาศที่กำลังเปิดอยู่'}
          </p>
        </div>
      )}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => {
          const isLost = post.type === 'LOST';
          const coverImageUrl = post.images[0]?.imageUrl;
          const petName = post.petName ?? 'ไม่ระบุชื่อสัตว์เลี้ยง';
          const location = [post.district, post.province]
            .filter(Boolean)
            .join(', ');

          return (
            <div
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:shadow-xl dark:border-border/60"
            >
              {/* ภาพหน้าปก */}
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                {coverImageUrl ? (
                  <Image
                    src={coverImageUrl}
                    alt={petName}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PawPrint className="size-12 text-muted-foreground/50" />
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
              </div>

              {/* ข้อมูลประกาศ */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-foreground group-hover:text-primary line-clamp-1">
                  {petName}
                </h3>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {post.breed ?? 'ไม่ระบุสายพันธุ์'}
                </span>

                <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    {location || 'ไม่ระบุพื้นที่'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary shrink-0" />
                    {postDateFormatter.format(new Date(post.eventDate))}
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
    </div>
  );
}
