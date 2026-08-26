import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, ImageIcon, PawPrint, QrCode } from 'lucide-react';

import { PET_GENDER_LABEL, PET_TYPE_LABEL } from '../../posts/_lib/post-labels';
import { getPetByIdAction } from '@/lib/action/admin.action';
import { formatThaiShortDate } from '@/lib/utils';
import { StatCard } from '@/components/admin/stat-card';
import { AdminPetDetail } from '@/types/admin';

export const metadata: Metadata = {
  title: 'รายละเอียดสัตว์เลี้ยง | Admin',
};

interface AdminPetDetailPageProps {
  params: Promise<{ id: string }>;
}

// หน้ารายละเอียดสัตว์เลี้ยง (Server Component) สำหรับแอดมิน
// ดึงข้อมูลสัตว์เลี้ยง 1 ตัวแบบละเอียดจาก getPetByIdAction แล้วแสดงผล
export default async function AdminPetDetailPage({
  params,
}: AdminPetDetailPageProps) {
  const { id } = await params;
  const result = await getPetByIdAction(id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <Link
        href="/admin/pets"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        กลับไปหน้าจัดการสัตว์เลี้ยง
      </Link>

      {'success' in result ? (
        // Error State: ไม่พบสัตว์เลี้ยง หรือเรียก API ไม่สำเร็จ
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center">
          <span className="text-sm font-medium text-destructive">
            {result.code === 'NOT_FOUND'
              ? 'ไม่พบสัตว์เลี้ยงนี้ อาจถูกลบไปแล้ว'
              : 'ไม่สามารถโหลดข้อมูลสัตว์เลี้ยงได้'}
          </span>
          {result.code !== 'NOT_FOUND' && (
            <p className="text-xs text-muted-foreground">{result.message}</p>
          )}
        </div>
      ) : (
        <PetDetail pet={result.pet} />
      )}
    </div>
  );
}

function PetDetail({ pet }: { pet: AdminPetDetail }) {
  const typeLabel = PET_TYPE_LABEL[pet.type];
  const genderLabel = pet.gender ? PET_GENDER_LABEL[pet.gender] : '-';

  return (
    <div className="flex flex-col gap-6">
      {/* การ์ดข้อมูลหลักของสัตว์เลี้ยง: รูปโปรไฟล์, ชื่อ, ป้ายประเภท/เพศ */}
      <div className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-muted sm:size-40 sm:w-40">
          {pet.profileImageUrl ? (
            <Image
              src={pet.profileImageUrl}
              alt={pet.name}
              fill
              sizes="160px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <PawPrint className="size-8" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {typeLabel}
            </span>
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {genderLabel}
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground">{pet.name}</h1>
          <span className="text-sm text-muted-foreground">
            {pet.breed && `${pet.breed}`}
            {pet.color && ` · สี${pet.color}`}
            {pet.age !== null && ` · อายุ ${pet.age} ปี`}
          </span>
          <span className="text-xs text-muted-foreground">
            ลงทะเบียนเมื่อ {formatThaiShortDate(pet.createdAt)}
            {' · '}
            อัปเดตล่าสุด {formatThaiShortDate(pet.updatedAt)}
          </span>
        </div>
      </div>

      {/* สถิติของสัตว์เลี้ยง */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="รูปภาพทั้งหมด"
          value={`${pet.images.length.toLocaleString('th-TH')} รูป`}
          icon={ImageIcon}
          tone="amber"
        />
        <StatCard
          label="อายุ"
          value={pet.age !== null ? `${pet.age} ปี` : 'ไม่ระบุ'}
          icon={Calendar}
          tone="blue"
        />
        <StatCard
          label="QR Code ประจำตัว"
          value={
            pet.qrCode ? (pet.qrCode.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน') : 'ยังไม่มี'
          }
          icon={QrCode}
          tone={pet.qrCode?.isActive ? 'emerald' : 'red'}
        />
      </div>

      {/* รูปภาพทั้งหมดของสัตว์เลี้ยง */}
      {pet.images.length > 0 && (
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">
            รูปภาพทั้งหมด
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {pet.images.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted"
              >
                <Image
                  src={image.imageUrl}
                  alt={`${pet.name} รูปที่ ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                {image.isProfile && (
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    รูปโปรไฟล์
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* รายละเอียดสัตว์เลี้ยง */}
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">
            รายละเอียดสัตว์เลี้ยง
          </h2>
          <InfoRow label="ลักษณะเด่น" value={pet.distinctiveFeatures ?? '-'} />
          <InfoRow label="คำอธิบาย" value={pet.description ?? '-'} />
        </div>

        {/* ข้อมูลเจ้าของ */}
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">
            ข้อมูลเจ้าของ
          </h2>
          <InfoRow
            label="ชื่อเจ้าของ"
            value={
              <Link
                href={`/admin/users/${pet.owner.id}`}
                className="font-medium text-primary hover:underline"
              >
                {pet.owner.firstName} {pet.owner.lastName}
              </Link>
            }
          />
          <InfoRow label="อีเมล" value={pet.owner.email} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium break-words text-foreground">{value}</span>
    </div>
  );
}
