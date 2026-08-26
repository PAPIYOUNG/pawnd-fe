'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

import { PET_TYPE_LABEL } from '../../posts/_lib/post-labels';
import { PetType } from '@/types/post';

interface PetsFilterBarProps {
  defaultSearch: string;
  defaultType: PetType | '';
}

/**
 * PetsFilterBar (Client Component)
 * - แถบค้นหา + ตัวกรองประเภทสัตว์เลี้ยง สำหรับตาราง "จัดการสัตว์เลี้ยง"
 * - เมื่อเปลี่ยนค่า จะ sync กลับไปที่ query string ของหน้า (?search=&type=)
 *   ผ่าน router.replace และรีเซ็ตกลับไปหน้า 1 เสมอ เพื่อไม่ให้ค้างอยู่หน้าที่ไม่มีข้อมูล
 */
export function PetsFilterBar({
  defaultSearch,
  defaultType,
}: PetsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // เก็บ timer ของการ debounce ช่องค้นหาไว้ข้าม render เพื่อยกเลิกของเดิมได้เมื่อพิมพ์ต่อ
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // อัปเดต query string ทีละ key แล้วส่งกลับไปหน้าเดิมพร้อมรีเซ็ต page เป็น 1
  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  }

  // ดีบาวน์ช่องค้นหา 400ms กันยิง request ถี่เกินไปขณะพิมพ์
  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ search: value });
    }, 400);
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      {/* ช่องค้นหาด้วยชื่อสัตว์เลี้ยง / สายพันธุ์ / ชื่อเจ้าของ */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          defaultValue={defaultSearch}
          onChange={handleSearchChange}
          placeholder="ค้นหาด้วยชื่อสัตว์เลี้ยง, สายพันธุ์, ชื่อเจ้าของ..."
          aria-label="ค้นหาสัตว์เลี้ยง"
          className="h-10 w-full rounded-2xl border border-transparent bg-input/50 pr-3 pl-9 text-sm text-foreground outline-none transition-[color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </div>

      {/* ตัวกรองประเภทสัตว์เลี้ยง */}
      <select
        aria-label="กรองตามประเภทสัตว์เลี้ยง"
        defaultValue={defaultType}
        onChange={(event) => updateParams({ type: event.target.value })}
        className="h-10 rounded-2xl border border-transparent bg-input/50 px-3 text-sm text-foreground outline-none transition-[color,box-shadow] duration-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <option value="">ประเภท: ทั้งหมด</option>
        {(Object.keys(PET_TYPE_LABEL) as PetType[]).map((value) => (
          <option key={value} value={value}>
            ประเภท: {PET_TYPE_LABEL[value]}
          </option>
        ))}
      </select>
    </div>
  );
}
