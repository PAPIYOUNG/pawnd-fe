import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Brain, ArrowRight, ShieldCheck, Filter, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'ระบบจับคู่อัจฉริยะ AI Matching | PAWND',
  description: 'ระบบค้นหาและจับคู่สัตว์เลี้ยงด้วย Deep Learning & Vector Similarity',
};

/**
 * AiMatchesPage (Server Component - RSC)
 * - หน้าศูนย์กลางระบบจับคู่อัจฉริยะ AI (AI Matching Center)
 * - ตรงตาม Backend ai.controller.ts
 */
export default function AiMatchesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* ส่วนหัว */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Smart Vision AI Matching
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            ระบบจับคู่อัจฉริยะ AI Matching
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            วิเคราะห์อัตลักษณ์ ลายขน ดวงตา และโครงสร้างร่างกายเพื่อจับคู่สัตว์เลี้ยงหายกับสัตว์เลี้ยงที่พบ
          </p>
        </div>

        <Link href="/posts/ai-matched">
          <Button className="rounded-2xl bg-primary text-xs font-semibold text-primary-foreground shadow-md">
            ดูรายการที่ AI จับคู่สำเร็จ &rarr;
          </Button>
        </Link>
      </div>

      {/* แบนเนอร์เทคโนโลยี AI */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Brain className="size-5" />
          </div>
          <h3 className="mt-4 font-bold text-foreground">
            Image Feature Extraction
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            แปลงภาพถ่ายสัตว์เลี้ยงเป็น 512-dimension vector embedding เพื่อเปรียบเทียบลักษณะ
          </p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <Sparkles className="size-5" />
          </div>
          <h3 className="mt-4 font-bold text-foreground">
            Cosine Similarity Scoring
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            คำนวณคะแนนความเหมือนแบบ Multi-modal ทั้งภาพ สีขน สายพันธุ์ และระยะทางพิกัด
          </p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <ShieldCheck className="size-5" />
          </div>
          <h3 className="mt-4 font-bold text-foreground">
            24/7 Background Matching
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            ประมวลผลจับคู่อัตโนมัติทุกครั้งที่มีการสร้างประกาศใหม่หรืออัปโหลดภาพเพิ่มเติม
          </p>
        </div>
      </div>
    </div>
  );
}
