<<<<<<< HEAD
import { CommunityFeed } from '@/components/community/community-feed';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ชุมชน',
  description: 'พูดคุย แลกเปลี่ยนความรู้ และเรื่องราวของคนรักสัตว์',
};

export default function CommunityPage() {
  return <CommunityFeed />;
=======
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  MessageSquare,
  Heart,
  Share2,
  Plus,
  Flame,
  Search,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'คอมมูนิตี้คนรักสัตว์ | PAWND',
  description: 'กระดานพูดคุย แลกเปลี่ยนข้อมูล แนะนำการตามหาสัตว์เลี้ยง และทีมจิตอาสา',
};

const MOCK_COMMUNITY_POSTS = [
  {
    id: 'comm-1',
    author: 'หมอโอ๊ต สัตวแพทย์',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    title: '5 วิธีเบื้องต้นในการตามหาแมวที่หลุดออกจากบ้านใน 24 ชั่วโมงแรก',
    excerpt: 'แมวมักจะหลบซ่อนตัวอยู่ในรัศมี 100-300 เมตรจากบ้านใน 24 ชม. แรก ควรวางทรายแมวหรือเสื้อผ้าที่มีกลิ่นเจ้าของไว้หน้าบ้าน...',
    likes: 128,
    comments: 24,
    tag: 'คำแนะนำ',
    timeAgo: '2 วันที่แล้ว',
  },
  {
    id: 'comm-2',
    author: 'กลุ่มจิตอาสาช่วยสัตว์สายไหม',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
    title: 'ประกาศรวมพลทีมค้นหาสุนัขหลงทาง โซนสายไหม-วัชรพล เสาร์นี้',
    excerpt: 'ใครสะดวกมาร่วมลงพื้นที่ช่วยกันค้นหาน้องหมาไซบีเรียน สามารถลงชื่อและรวมตัวกันที่สวนสาธารณะได้เลยครับ...',
    likes: 85,
    comments: 19,
    tag: 'รวมทีมจิตอาสา',
    timeAgo: '3 วันที่แล้ว',
  },
];

/**
 * CommunityPage (Server Component - RSC)
 * - หน้าเว็บบอร์ดคอมมูนิตี้คนรักสัตว์ (Community Board)
 */
export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      {/* ส่วนหัวของคอมมูนิตี้ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Users className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Community Board
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            คอมมูนิตี้คนรักสัตว์ PAWND
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            พูดคุย แลกเปลี่ยนประสบการณ์ ขอความช่วยเหลือ และแบ่งปันเรื่องราวอบอุ่น
          </p>
        </div>

        <Button className="h-10 gap-1.5 rounded-2xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md">
          <Plus className="size-4" />
          <span>ตั้งกระทู้ใหม่</span>
        </Button>
      </div>

      {/* รายการกระทู้ในคอมมูนิตี้ */}
      <div className="mt-8 flex flex-col gap-4">
        {MOCK_COMMUNITY_POSTS.map((post) => (
          <div
            key={post.id}
            className="group rounded-3xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md sm:p-6 dark:border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative size-10 overflow-hidden rounded-full border">
                  <Image src={post.avatar} alt={post.author} fill className="object-cover" />
                </div>
                <div>
                  <span className="font-bold text-sm text-foreground">{post.author}</span>
                  <span className="block text-[11px] text-muted-foreground">{post.timeAgo}</span>
                </div>
              </div>

              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {post.tag}
              </span>
            </div>

            <h3 className="mt-3.5 text-base font-bold text-foreground group-hover:text-primary sm:text-lg">
              {post.title}
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed sm:text-sm">
              {post.excerpt}
            </p>

            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
              <span className="flex items-center gap-1">
                <Heart className="size-4 text-rose-500" />
                {post.likes} ถูกใจ
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="size-4 text-primary" />
                {post.comments} ความคิดเห็น
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
>>>>>>> dev
}
