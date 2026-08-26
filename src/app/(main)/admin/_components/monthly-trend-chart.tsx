import { MonthlyTrendBars } from './monthly-trend-bars';
import { MonthlyTrendYearFilter } from './monthly-trend-year-filter';
import { MonthlyTrendPoint } from '@/types/admin';

interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[];
  year: number;
  years: number[];
  errorMessage?: string;
}

/**
 * MonthlyTrendChart (Server Component)
 * - Container ของกราฟแนวโน้มการโพสต์รายเดือน รับข้อมูลจริงจาก Backend ผ่าน props (ไม่มี Mock Data)
 * - ส่วน Legend/แท่งกราฟที่ต้องกดสลับซ่อน-แสดงได้ แยกไปเป็น Client Component (MonthlyTrendBars)
 */
export function MonthlyTrendChart({
  data,
  year,
  years,
  errorMessage,
}: MonthlyTrendChartProps) {
  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            แนวโน้มการโพสต์รายเดือน ({year})
          </h2>
          <p className="text-xs text-muted-foreground">
            เปรียบเทียบจำนวนประกาศ Lost / Found / Reunited ในแต่ละเดือน
            (คลิกป้ายกำกับเพื่อซ่อน/แสดง)
          </p>
        </div>
        <MonthlyTrendYearFilter years={years} selectedYear={year} />
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
        <MonthlyTrendBars data={data} />
      )}
    </div>
  );
}
