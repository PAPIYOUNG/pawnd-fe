'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface MonthlyTrendYearFilterProps {
  years: number[];
  selectedYear: number;
}

/**
 * MonthlyTrendYearFilter (Client Component)
 * - Dropdown เลือกปีสำหรับกราฟแนวโน้มการโพสต์รายเดือน
 * - เมื่อเลือกปีใหม่ จะอัปเดต query string `?year=` แล้วให้หน้า (Server Component) fetch ข้อมูลใหม่
 */
export function MonthlyTrendYearFilter({
  years,
  selectedYear,
}: MonthlyTrendYearFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleYearChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', event.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      aria-label="เลือกปีที่ต้องการแสดงกราฟ"
      value={selectedYear}
      onChange={handleYearChange}
      className="h-8 rounded-2xl border border-transparent bg-input/50 px-2.5 text-sm text-foreground outline-none transition-[color,box-shadow] duration-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
    >
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
}
