import { cn } from '@/lib/utils';

const MONTHLY_POSTS = [
  { month: 'ม.ค.', posts: 210 },
  { month: 'ก.พ.', posts: 260 },
  { month: 'มี.ค.', posts: 300 },
  { month: 'เม.ย.', posts: 340 },
  { month: 'พ.ค.', posts: 380 },
  { month: 'มิ.ย.', posts: 410 },
  { month: 'ก.ค.', posts: 360 },
  { month: 'ส.ค.', posts: 440 },
  { month: 'ก.ย.', posts: 512 },
] as const;

const MAX_POSTS = Math.max(...MONTHLY_POSTS.map((item) => item.posts));

export function MonthlyTrendChart() {
  return (
    <div className="flex h-full flex-col gap-6 rounded-3xl border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          แนวโน้มการโพสต์รายเดือน (2026)
        </h2>
        <p className="text-xs text-muted-foreground">
          เปรียบเทียบสถิติการสร้างประกาศสัตว์หาย/พบในช่วงที่ผ่านมา
        </p>
      </div>

      <div className="flex h-56 items-end justify-between gap-2">
        {MONTHLY_POSTS.map(({ month, posts }, index) => {
          const isLast = index === MONTHLY_POSTS.length - 1;
          const heightPercent = Math.max((posts / MAX_POSTS) * 100, 8);

          return (
            <div
              key={month}
              className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                className={cn(
                  'pointer-events-none absolute -top-2 -translate-y-full rounded-lg px-2 py-1 text-[11px] font-medium whitespace-nowrap text-primary-foreground opacity-0 transition-opacity',
                  isLast ? 'bg-primary opacity-100' : 'bg-foreground group-hover:opacity-100'
                )}
              >
                {posts} โพสต์
              </div>
              <div
                className={cn(
                  'w-full max-w-8 rounded-t-md transition-colors',
                  isLast ? 'bg-primary' : 'bg-muted group-hover:bg-primary/40'
                )}
                style={{ height: `${heightPercent}%` }}
              />
              <span className="text-xs text-muted-foreground">{month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
