import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Megaphone,
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  Plus,
  ArrowUpDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'รายการประกาศตามหาสัตว์เลี้ยง | PAWND',
  description: 'ค้นหาและกรองประกาศสัตว์เลี้ยงหายและพบสัตว์เลี้ยงหลงทางทั่วประเทศ',
};

// Mock รายการประกาศ
const MOCK_POSTS = [
  {
    id: 'post-1',
    type: 'LOST',
    petName: 'น้องลูน่า (Luna) แมววิเชียรมาศ',
    petType: 'CAT',
    breed: 'วิเชียรมาศ',
    province: 'กรุงเทพฯ',
    locationDetail: 'พญาไท, กรุงเทพฯ',
    timeAgo: '10 นาทีที่แล้ว',
    matchCount: 3,
    coverImageUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'post-2',
    type: 'FOUND',
    petName: 'พบเห็นสุนัขไซบีเรียน ฮัสกี้ ปลอกคอดำ',
    petType: 'DOG',
    breed: 'ไซบีเรียน ฮัสกี้',
    province: 'นนทบุรี',
    locationDetail: 'งามวงศ์วาน, นนทบุรี',
    timeAgo: '1 ชั่วโมงที่แล้ว',
    matchCount: 1,
    coverImageUrl:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'post-3',
    type: 'LOST',
    petName: 'ช็อกโก้ สุนัขพุดเดิลสีน้ำตาล',
    petType: 'DOG',
    breed: 'พุดเดิ้ลทอย',
    province: 'กรุงเทพฯ',
    locationDetail: 'ลาดพร้าว 101, กรุงเทพฯ',
    timeAgo: '3 ชั่วโมงที่แล้ว',
    matchCount: 2,
    coverImageUrl:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'post-4',
    type: 'LOST',
    petName: 'น้องส้มส้ม แมวลายเสือส้ม สวมกระดิ่งแดง',
    petType: 'CAT',
    breed: 'พันธุ์ไทยผสมเปอร์เซีย',
    province: 'กรุงเทพฯ',
    locationDetail: 'ดินแดง, กรุงเทพฯ',
    timeAgo: '5 ชั่วโมงที่แล้ว',
    matchCount: 4,
    coverImageUrl:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=600&auto=format&fit=crop',
  },
];

/**
 * PostsPage (Server Component - RSC)
 * - หน้ารายการประกาศตามหาสัตว์เลี้ยงทั้งหมด (Post List & Filter)
 */
export default function PostsPage() {
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
            ค้นหา ช่วยเหลือ หรือแจ้งเบาะแสสัตว์เลี้ยงพลัดหลงด้วยระบบ AI Smart Matching
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
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อสัตว์เลี้ยง สายพันธุ์ สี หรือสถานที่..."
            className="h-10 rounded-2xl pl-10 text-xs sm:text-sm"
          />
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
        {MOCK_POSTS.map((post) => {
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
                      isLost ? 'bg-destructive' : 'bg-emerald-600'
                    )}
                  >
                    {isLost ? 'ตามหา (LOST)' : 'พบเห็น (FOUND)'}
                  </span>
                </div>

                {/* ป้ายผลการจับคู่ AI */}
                {post.matchCount > 0 && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-emerald-400 backdrop-blur-xs">
                    <Sparkles className="size-3" />
                    <span>AI จับคู่ {post.matchCount} เคส</span>
                  </div>
                )}
              </div>

              {/* ข้อมูลประกาศ */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-foreground group-hover:text-primary line-clamp-1">
                  {post.petName}
                </h3>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {post.breed}
                </span>

                <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    {post.locationDetail}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary shrink-0" />
                    {post.timeAgo}
                  </span>
                </div>

                {/* ปุ่ม Action */}
                <div className="mt-5 flex items-center gap-2 border-t border-border/50 pt-4">
                  <Link href={`/posts/${post.id}`} className="flex-1">
                    <Button variant="outline" className="h-9 w-full rounded-xl text-xs font-semibold">
                      ดูรายละเอียด
                    </Button>
                  </Link>
                  <Link href={`/posts/${post.id}/flyer`}>
                    <Button variant="ghost" size="sm" className="h-9 rounded-xl text-xs text-primary font-semibold">
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
