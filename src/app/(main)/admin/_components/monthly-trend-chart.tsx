import { MonthlyTrendYearFilter } from './monthly-trend-year-filter';
import { MonthlyTrendPoint } from '@/types/admin';

const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const;

const SERIES = [
  { key: 'lost', label: 'Lost', barClass: 'bg-red-500' },
  { key: 'found', label: 'Found', barClass: 'bg-sky-500' },
  { key: 'reunited', label: 'Reunited', barClass: 'bg-emerald-500' },
] as const;

interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[];
  year: number;
  years: number[];
  errorMessage?: string;
}

/**
 * MonthlyTrendChart (Server Component)
 * - แสดงกราฟแท่งเปรียบเทียบจำนวนโพสต์ Lost / Found / Reunited รายเดือนของปีที่เลือก
 * - รับข้อมูลจริงจาก Backend ผ่าน props (ไม่มี Mock Data)
 */
export function MonthlyTrendChart({
  data,
  year,
  years,
  errorMessage,
}: MonthlyTrendChartProps) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((point) => [point.lost, point.found, point.reunited]),
  );

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            แนวโน้มการโพสต์รายเดือน ({year})
          </h2>
          <p className="text-xs text-muted-foreground">
            เปรียบเทียบจำนวนประกาศ Lost / Found / Reunited ในแต่ละเดือน
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {SERIES.map((series) => (
              <span key={series.key} className="flex items-center gap-1.5">
                <span className={`size-2.5 rounded-full ${series.barClass}`} />
                {series.label}
              </span>
            ))}
          </div>
          <MonthlyTrendYearFilter years={years} selectedYear={year} />
        </div>
      </div>

      {errorMessage ? (
        // Error State: ดึงข้อมูลกราฟไม่สำเร็จ
        <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-2xl bg-destructive/5 text-center">
          <span className="text-sm font-medium text-destructive">
            ไม่สามารถโหลดข้อมูลกราฟได้
          </span>
          <p className="text-xs text-muted-foreground">{errorMessage}</p>
        </div>
      ) : data.length === 0 ? (
        // Empty State: ยังไม่มีข้อมูลโพสต์ในปีที่เลือก
        <div className="flex h-56 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
          ยังไม่มีข้อมูลโพสต์ในปี {year}
        </div>
      ) : (
        <div className="flex h-56 items-end justify-between gap-2">
          {data.map((point) => {
            const monthLabel = THAI_MONTHS[point.month - 1] ?? point.month;

            return (
              <div
                key={point.month}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-full w-full max-w-10 items-end justify-center gap-0.5">
                  {SERIES.map((series) => {
                    const value = point[series.key];
                    const heightPercent =
                      value > 0 ? Math.max((value / maxValue) * 100, 4) : 0;

                    return (
                      <div
                        key={series.key}
                        className="group relative flex h-full flex-1 items-end"
                      >
                        <div
                          className={`pointer-events-none absolute -top-2 left-1/2 hidden -translate-x-1/2 -translate-y-full rounded-lg bg-foreground px-1.5 py-0.5 text-[10px] whitespace-nowrap text-primary-foreground group-hover:block`}
                        >
                          {series.label} {value}
                        </div>
                        <div
                          className={`w-full rounded-t-sm transition-colors ${series.barClass}`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <span className="text-xs text-muted-foreground">
                  {monthLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
