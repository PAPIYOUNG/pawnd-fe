'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
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

type SeriesKey = (typeof SERIES)[number]['key'];

interface MonthlyTrendBarsProps {
  data: MonthlyTrendPoint[];
}

/**
 * MonthlyTrendBars (Client Component)
 * - แสดง Legend แบบกดสลับ (Toggle) เพื่อซ่อน/แสดงแต่ละ series (Lost / Found / Reunited)
 * - และแท่งกราฟที่ปรับสเกลตาม series ที่กำลังแสดงอยู่เท่านั้น
 */
export function MonthlyTrendBars({ data }: MonthlyTrendBarsProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<SeriesKey>>(new Set());

  function toggleSeries(key: SeriesKey) {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const visibleSeries = SERIES.filter(
    (series) => !hiddenSeries.has(series.key),
  );
  const maxValue = Math.max(
    1,
    ...data.flatMap((point) =>
      visibleSeries.map((series) => point[series.key]),
    ),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {SERIES.map((series) => {
          const isHidden = hiddenSeries.has(series.key);

          return (
            <button
              key={series.key}
              type="button"
              aria-pressed={!isHidden}
              onClick={() => toggleSeries(series.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                isHidden
                  ? 'border-border text-muted-foreground opacity-50'
                  : 'border-transparent bg-muted text-foreground',
              )}
            >
              <span className={cn('size-2.5 rounded-full', series.barClass)} />
              {series.label}
            </button>
          );
        })}
      </div>

      {visibleSeries.length === 0 ? (
        // Empty State: ปิดทุก series ไม่มีอะไรให้แสดง
        <div className="flex h-56 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
          เลือกอย่างน้อย 1 รายการเพื่อแสดงกราฟ
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
                  {visibleSeries.map((series) => {
                    const value = point[series.key];
                    const heightPercent =
                      value > 0 ? Math.max((value / maxValue) * 100, 4) : 0;

                    return (
                      <div
                        key={series.key}
                        className="group relative flex h-full flex-1 items-end"
                      >
                        <div className="pointer-events-none absolute -top-2 left-1/2 hidden -translate-x-1/2 -translate-y-full rounded-lg bg-foreground px-1.5 py-0.5 text-[10px] whitespace-nowrap text-primary-foreground group-hover:block">
                          {series.label} {value}
                        </div>
                        <div
                          className={cn(
                            'w-full rounded-t-sm transition-colors',
                            series.barClass,
                          )}
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
