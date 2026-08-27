import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  Pin,
  Eye,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'ผลการจับคู่ AI (AI-Matched Posts) | PAWND',
  description: 'รายการประกาศที่มีผลการจับคู่อัจฉริยะด้วย AI สูงสุด',
};

// Mock รายการประกาศที่จับคู่โดย AI
const MOCK_AI_MATCHES = [
  {
    id: 'match-1',
    sourcePet: {
      name: 'น้องลูน่า (ประกาศแจ้งหาย)',
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop',
      location: 'พญาไท, กรุงเทพฯ',
    },
    candidatePet: {
      name: 'พบแมววิเชียรมาศ (ประกาศพบเห็น)',
      imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=400&auto=format&fit=crop',
      location: 'ราชเทวี, กรุงเทพฯ (ห่าง 1.2 กม.)',
    },
    score: 94,
    featuresMatched: ['สีขนครีม ปลายหางเข้ม', 'ตาสีฟ้า', 'ระยะทางใกล้เคียง < 2 กม.'],
  },
  {
    id: 'match-2',
    sourcePet: {
      name: 'ช็อกโก้ (ประกาศแจ้งหาย)',
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400&auto=format&fit=crop',
      location: 'ลาดพร้าว 101, กรุงเทพฯ',
    },
    candidatePet: {
      name: 'พบสุนัขพุดเดิลสีน้ำตาล (ประกาศพบเห็น)',
      imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=400&auto=format&fit=crop',
      location: 'โชคชัย 4, กรุงเทพฯ (ห่าง 2.5 กม.)',
    },
    score: 88,
    featuresMatched: ['ขนหยิกสีน้ำตาลเข้ม', 'ขนาดตัวเล็ก', 'เวลาใกล้เคียงกัน'],
  },
];

/**
 * AiMatchedPostsPage (Server Component - RSC)
 * - หน้ารายการประกาศที่ AI ทำการจับคู่ (AI-Matched Post List)
 */
export default function AiMatchedPostsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      {/* ส่วนหัวหน้า */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            AI Smart Matching Engine
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          รายการประกาศที่ AI จับคู่สำเร็จ
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          วิเคราะห์ความคล้ายคลึงของภาพถ่ายและพิกัดภูมิศาสตร์ด้วย AI Model
        </p>
      </div>

      {/* รายการเปรียบเทียบคู่สัตว์เลี้ยง */}
      <div className="mt-8 flex flex-col gap-6">
        {MOCK_AI_MATCHES.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-3xl border border-emerald-500/40 bg-card p-5 shadow-md transition-all hover:shadow-xl sm:p-6 dark:border-emerald-500/30"
          >
            {/* ป้ายคะแนนความคล้ายคลึง */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 font-extrabold dark:text-emerald-400">
                  {item.score}%
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    ความคล้ายคลึงสูงมาก (High Match Confidence)
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    ตรวจพบด้วย AI Image Embedding Vector Analysis
                  </span>
                </div>
              </div>

              <span className="hidden rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 sm:inline-block dark:text-emerald-400">
                แนะนำให้ติดต่อทันที
              </span>
            </div>

            {/* การเปรียบเทียบภาพ 2 ฝั่ง (Source vs Candidate) */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* ฝั่งซ้าย: สัตว์เลี้ยงที่ตามหา */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-muted/30 p-3.5">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={item.sourcePet.imageUrl}
                    alt={item.sourcePet.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-destructive">
                    เคสแจ้งหาย (LOST)
                  </span>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">
                    {item.sourcePet.name}
                  </h4>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3 text-primary" />
                    {item.sourcePet.location}
                  </span>
                </div>
              </div>

              {/* ฝั่งขวา: สัตว์เลี้ยงที่พบเห็น */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-muted/30 p-3.5">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={item.candidatePet.imageUrl}
                    alt={item.candidatePet.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-emerald-600">
                    เคสพบเห็น (FOUND)
                  </span>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">
                    {item.candidatePet.name}
                  </h4>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3 text-emerald-500" />
                    {item.candidatePet.location}
                  </span>
                </div>
              </div>
            </div>

            {/* จุดเด่นที่ตรงกัน */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                จุดที่ตรงกัน:
              </span>
              {item.featuresMatched.map((feat, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"
                >
                  ✓ {feat}
                </span>
              ))}
            </div>

            {/* ปุ่มนำทาง Action */}
            <div className="mt-5 flex items-center justify-end gap-3 border-t border-border/50 pt-4">
              <Link href="/chat">
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                  แชทสอบถามเจ้าของ
                </Button>
              </Link>
              <Link href="/matches">
                <Button size="sm" className="rounded-xl bg-primary text-xs font-semibold text-primary-foreground">
                  ดูรายละเอียดผลการจับคู่ &rarr;
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
