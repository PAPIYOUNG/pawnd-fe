import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, PawPrint } from 'lucide-react';

import { PetsFilterBar } from './_components/pets-filter-bar';
import { PetsPagination } from './_components/pets-pagination';
import { PET_GENDER_LABEL, PET_TYPE_LABEL } from '../posts/_lib/post-labels';
import { getPetsAction } from '@/lib/action/admin.action';
import { formatThaiShortDate } from '@/lib/utils';
import { AdminPetListItem } from '@/types/admin';
import { PetType } from '@/types/post';

export const metadata: Metadata = {
  title: 'จัดการสัตว์เลี้ยง | Admin',
};

const PAGE_SIZE = 20;

interface AdminPetsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
  }>;
}

// หน้าจัดการสัตว์เลี้ยง (Server Component) สำหรับแอดมิน
// ดึงรายการสัตว์เลี้ยงทั้งหมดในระบบแบบแบ่งหน้า พร้อมรองรับค้นหาและกรองตามประเภท
export default async function PetManage({ searchParams }: AdminPetsPageProps) {
  const sp = await searchParams;

  const requestedPage = Number(sp.page);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const search = sp.search?.trim() || '';
  const type =
    sp.type && sp.type in PET_TYPE_LABEL ? (sp.type as PetType) : undefined;

  const result = await getPetsAction({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    type,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">จัดการสัตว์เลี้ยง</h1>
        <p className="text-sm text-muted-foreground">
          รายชื่อสัตว์เลี้ยงทั้งหมดที่ลงทะเบียนไว้ในระบบ Pawnd
        </p>
      </div>

      <PetsFilterBar defaultSearch={search} defaultType={type ?? ''} />

      {'success' in result ? (
        // Error State: เรียก API รายการสัตว์เลี้ยงไม่สำเร็จ
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center">
          <span className="text-sm font-medium text-destructive">
            ไม่สามารถโหลดรายชื่อสัตว์เลี้ยงได้
          </span>
          <p className="text-xs text-muted-foreground">{result.message}</p>
        </div>
      ) : result.pets.length === 0 ? (
        // Empty State: ไม่พบสัตว์เลี้ยงตามเงื่อนไข หรือยังไม่มีสัตว์เลี้ยงในระบบ
        <div className="flex h-40 items-center justify-center rounded-3xl border border-border bg-card text-sm text-muted-foreground">
          ไม่พบสัตว์เลี้ยงที่ตรงกับเงื่อนไขที่ค้นหา
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">สัตว์เลี้ยง</th>
                  <th className="py-3 pr-4 font-medium">ประเภท</th>
                  <th className="py-3 pr-4 font-medium">เพศ</th>
                  <th className="py-3 pr-4 font-medium">เจ้าของ</th>
                  <th className="py-3 pr-4 font-medium">วันที่ลงทะเบียน</th>
                  <th className="py-3 pl-4 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {result.pets.map((pet) => (
                  <PetRow key={pet.id} pet={pet} />
                ))}
              </tbody>
            </table>
          </div>

          <PetsPagination
            pagination={result.pagination}
            shownCount={result.pets.length}
            queryParams={{ search: search || undefined, type }}
          />
        </div>
      )}
    </div>
  );
}

function PetRow({ pet }: { pet: AdminPetListItem }) {
  const typeLabel = PET_TYPE_LABEL[pet.type];
  const genderLabel = pet.gender ? PET_GENDER_LABEL[pet.gender] : '-';

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-3 pr-4 font-semibold text-foreground">
        <Link
          href={`/admin/pets/${pet.id}`}
          className="flex items-center gap-3 hover:text-primary hover:underline"
        >
          <span className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            {pet.profileImageUrl ? (
              <Image
                src={pet.profileImageUrl}
                alt={pet.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-muted-foreground">
                <PawPrint className="size-4" />
              </span>
            )}
          </span>
          <span>
            {pet.name}
            {pet.breed && (
              <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                {pet.breed}
              </p>
            )}
          </span>
        </Link>
      </td>
      <td className="py-3 pr-4">{typeLabel}</td>
      <td className="py-3 pr-4 text-muted-foreground">{genderLabel}</td>
      <td className="py-3 pr-4 text-muted-foreground">
        {pet.owner.firstName} {pet.owner.lastName}
      </td>
      <td className="py-3 pr-4 text-muted-foreground">
        {formatThaiShortDate(pet.createdAt)}
      </td>
      <td className="py-3 pl-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/pets/${pet.id}`}
            title="ดูรายละเอียดสัตว์เลี้ยง"
            aria-label={`ดูรายละเอียด ${pet.name}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/70"
          >
            <Eye className="size-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
