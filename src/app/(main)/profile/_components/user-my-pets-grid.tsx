import Link from 'next/link';
import Image from 'next/image';
import { QrCode } from 'lucide-react';

import { PetProfile } from '@/types/pet';

interface UserMyPetsGridProps {
  pets?: PetProfile[];
}

/**
 * UserMyPetsGrid Component (Server Component)
 * - ส่วนแสดงรายการย่อ "สัตว์เลี้ยงของฉัน" (My Pets Grid) ในหน้าโปรไฟล์ผู้ใช้
 * - แสดงการ์ดย่อพร้อมรูปภาพ, ชื่อ, สายพันธุ์, อายุ และป้าย "QR Tag"
 * - มีปุ่มคลิกนำทางไปยังหน้ารายละเอียดโปรไฟล์สัตว์เลี้ยง (/profile/pets)
 */
export function UserMyPetsGrid({ pets = [] }: UserMyPetsGridProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          สัตว์เลี้ยงของฉัน
        </h3>
        <Link
          href="/profile/pets"
          className="text-xs font-semibold text-primary transition-colors hover:underline sm:text-sm"
        >
          จัดการสัตว์เลี้ยงทั้งหมด &rarr;
        </Link>
      </div>

      {/* Grid การ์ดสัตว์เลี้ยงขนาดกะทัดรัด */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet) => (
          <Link
            key={pet.id}
            href="/profile/pets"
            className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs transition-all hover:border-primary/50 hover:shadow-md dark:border-border/60"
          >
            <div className="flex items-center gap-3">
              {/* รูปโปรไฟล์สัตว์เลี้ยง */}
              <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={
                    pet.profileImageUrl ||
                    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200&auto=format&fit=crop'
                  }
                  alt={pet.name}
                  fill
                  sizes="48px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>

              {/* ข้อมูลสัตว์เลี้ยง */}
              <div className="flex flex-col">
                <span className="font-bold text-foreground group-hover:text-primary">
                  {pet.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {pet.breed || 'พันธุ์ไทย'} • {pet.age || 1} ปี
                </span>
              </div>
            </div>

            {/* ป้าย QR Tag สีเขียว */}
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <QrCode className="size-3" />
              QR Tag
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
