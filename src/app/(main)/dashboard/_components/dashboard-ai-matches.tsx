'use client';

import Image from 'next/image';
import Link from 'next/link';

export interface AiMatchSummaryItem {
  id: string;
  petName: string;
  matchScore: number;
  petType: string;
  color: string;
  imageUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'DISMISSED';
}

const DEFAULT_AI_MATCHES: AiMatchSummaryItem[] = [
  {
    id: 'match-1',
    petName: 'ส้มส้ม',
    matchScore: 94,
    petType: 'แมวไทย',
    color: 'สีส้ม',
    imageUrl:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=300&auto=format&fit=crop',
    status: 'PENDING',
  },
  {
    id: 'match-2',
    petName: 'คุกกี้',
    matchScore: 82,
    petType: 'พูเดิล',
    color: 'สีน้ำตาลอ่อน',
    imageUrl:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=300&auto=format&fit=crop',
    status: 'PENDING',
  },
];

/**
 * DashboardAiMatches Component (Client Component)
 * - การ์ดสรุปผลการจับคู่ AI (AI Matching Summary) ในหน้า Dashboard ตรงตาม UI Mockup
 * - แสดงคะแนนความเหมือน (% Match Score), รูปสัตว์เลี้ยง, สายพันธุ์ และปุ่มสถานะ "รอตรวจสอบ"
 */
export function DashboardAiMatches({
  initialMatches = DEFAULT_AI_MATCHES,
}: {
  initialMatches?: AiMatchSummaryItem[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* กล่องการ์ดสรุป AI Matching */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-2xs">
        {/* หัวข้อการ์ด */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
          <h2 className="text-base font-bold text-foreground sm:text-lg">
            สรุป AI Matching
          </h2>
          <Link
            href="/matches"
            className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            ดูทั้งหมด
          </Link>
        </div>

        {/* รายการผลการจับคู่ */}
        <div className="mt-4 flex flex-col gap-3">
          {initialMatches.map((item) => {
            const isHighMatch = item.matchScore >= 90;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 p-3 transition-colors hover:bg-muted/40"
              >
                {/* ฝั่งซ้าย: รูปภาพ + ชื่อ + เปอร์เซ็นต์ + รายละเอียด */}
                <div className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted shadow-2xs">
                    <Image
                      src={item.imageUrl}
                      alt={item.petName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {item.petName}
                      </span>
                      {/* แท็กเปอร์เซ็นต์คะแนน AI (สีเขียว >= 90%, สีส้ม/เหลือง < 90%) */}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          isHighMatch
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {item.matchScore}%
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.petType} • {item.color}
                    </span>
                  </div>
                </div>

                {/* ฝั่งขวา: ปุ่มแท็กสถานะ "รอตรวจสอบ" */}
                <Link
                  href={`/posts/ai-matched`}
                  className="rounded-full border border-amber-500/60 bg-amber-50/60 px-3 py-1 text-[11px] font-bold text-amber-700 transition-all hover:bg-amber-100 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-400"
                >
                  รอตรวจสอบ
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
