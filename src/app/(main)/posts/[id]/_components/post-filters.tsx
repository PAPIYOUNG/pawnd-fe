'use client';

import type { ChangeEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { PetType, PostStatus, PostType } from '@/types/post';

interface PostFiltersProps {
  selectedType?: PostType;
  selectedPetType?: PetType;
  selectedStatus: PostStatus;
}

type FilterName = 'type' | 'petType' | 'status';

/**
 * Client Component สำหรับเปลี่ยน query string ของตัวกรองประกาศ
 * เมื่อเปลี่ยนค่า จะรีเซ็ต Pagination กลับไปหน้าแรก
 */
export function PostFilters({
  selectedType,
  selectedPetType,
  selectedStatus,
}: PostFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * อัปเดต filter ที่เลือก โดยคงค่า filter ตัวอื่น
   * ACTIVE เป็นค่าเริ่มต้นของ Backend จึงลบ status ออกจาก URL ได้
   */
  const handleFilterChange =
    (filterName: FilterName) => (event: ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      const value = event.target.value;

      const shouldRemoveFilter =
        value === 'ALL' || (filterName === 'status' && value === 'ACTIVE');

      if (shouldRemoveFilter) {
        params.delete(filterName);
      } else {
        params.set(filterName, value);
      }

      // เมื่อ filter เปลี่ยน ต้องเริ่มแสดงผลจากหน้าแรก
      params.delete('page');

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* ตัวกรองประเภทประกาศ */}
      <label className="sr-only" htmlFor="post-type-filter">
        ประเภทประกาศ
      </label>
      <select
        id="post-type-filter"
        value={selectedType ?? 'ALL'}
        onChange={handleFilterChange('type')}
        className="h-10 cursor-pointer rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm"
      >
        <option value="ALL">ทุกประเภท</option>
        <option value="LOST">ตามหา (LOST)</option>
        <option value="FOUND">พบเห็น (FOUND)</option>
      </select>

      {/* ตัวกรองชนิดสัตว์ */}
      <label className="sr-only" htmlFor="pet-type-filter">
        ชนิดสัตว์
      </label>
      <select
        id="pet-type-filter"
        value={selectedPetType ?? 'ALL'}
        onChange={handleFilterChange('petType')}
        className="h-10 cursor-pointer rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm"
      >
        <option value="ALL">สัตว์ทุกชนิด</option>
        <option value="DOG">สุนัข</option>
        <option value="CAT">แมว</option>
        <option value="BIRD">นก</option>
        <option value="HAMSTER">แฮมสเตอร์</option>
        <option value="EXOTIC">สัตว์พิเศษ</option>
        <option value="OTHER">อื่นๆ</option>
      </select>

      {/* ตัวกรองสถานะประกาศ */}
      <label className="sr-only" htmlFor="post-status-filter">
        สถานะประกาศ
      </label>
      <select
        id="post-status-filter"
        value={selectedStatus}
        onChange={handleFilterChange('status')}
        className="h-10 cursor-pointer rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm"
      >
        <option value="ACTIVE">กำลังเปิดประกาศ</option>
        <option value="REUNITED">กลับบ้านแล้ว</option>
        <option value="CLOSED">ปิดประกาศ</option>
      </select>
    </div>
  );
}
