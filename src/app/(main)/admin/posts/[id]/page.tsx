import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Coins, Eye, ImageIcon, PawPrint } from 'lucide-react';

import { PostStatusControl } from '../_components/post-status-control';
import {
  PET_GENDER_LABEL,
  PET_TYPE_LABEL,
  POST_STATUS_LABEL,
  POST_TYPE_LABEL,
} from '../_lib/post-labels';
import { getPostByIdAction } from '@/lib/action/admin.action';
import { formatThaiShortDate } from '@/lib/utils';
import { StatCard } from '@/components/admin/stat-card';
import GoogleMapsEmbed from '@/components/map/GoogleMapsEmbed';
import { AdminPostDetail } from '@/types/admin';

export const metadata: Metadata = {
  title: 'รายละเอียดประกาศ | Admin',
};

interface AdminPostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPostDetailPage({
  params,
}: AdminPostDetailPageProps) {
  const { id } = await params;
  const result = await getPostByIdAction(id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <Link
        href="/admin/posts"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        กลับไปหน้าจัดการประกาศ
      </Link>

      {'success' in result ? (
        // Error State: ไม่พบประกาศ หรือเรียก API ไม่สำเร็จ
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center">
          <span className="text-sm font-medium text-destructive">
            {result.code === 'NOT_FOUND'
              ? 'ไม่พบประกาศนี้ อาจถูกลบไปแล้ว'
              : 'ไม่สามารถโหลดข้อมูลประกาศได้'}
          </span>
          {result.code !== 'NOT_FOUND' && (
            <p className="text-xs text-muted-foreground">{result.message}</p>
          )}
        </div>
      ) : (
        <PostDetail post={result.post} />
      )}
    </div>
  );
}

function PostDetail({ post }: { post: AdminPostDetail }) {
  const typeLabel = POST_TYPE_LABEL[post.type];
  const statusLabel = POST_STATUS_LABEL[post.status];
  const cover = post.images[0]?.imageUrl ?? null;
  const hasCoordinates = post.latitude !== null && post.longitude !== null;

  return (
    <div className="flex flex-col gap-6">
      {/* การ์ดข้อมูลหลักของประกาศ: รูปปก, ชื่อสัตว์, ป้ายประเภท/สถานะ, ตัวควบคุมสถานะ */}
      <div className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-muted sm:size-40 sm:w-40">
          {cover ? (
            <Image
              src={cover}
              alt={post.petName}
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
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeLabel.className}`}
            >
              {typeLabel.text}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusLabel.className}`}
            >
              {statusLabel.text}
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground">{post.petName}</h1>
          <span className="text-sm text-muted-foreground">
            {PET_TYPE_LABEL[post.petType]}
            {post.breed && ` · ${post.breed}`}
            {post.gender && ` · ${PET_GENDER_LABEL[post.gender]}`}
            {post.color && ` · สี${post.color}`}
          </span>
          <span className="text-xs text-muted-foreground">
            โพสต์เมื่อ {formatThaiShortDate(post.createdAt)}
            {post.eventDate &&
              ` · วันที่เกิดเหตุ ${formatThaiShortDate(post.eventDate)}`}
            {post.reunitedAt &&
              ` · พากลับบ้านเมื่อ ${formatThaiShortDate(post.reunitedAt)}`}
          </span>
          <PostStatusControl postId={post.id} initialStatus={post.status} />
        </div>
      </div>

      {/* สถิติของประกาศ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="ยอดเข้าชม"
          value={`${post.viewCount.toLocaleString('th-TH')} ครั้ง`}
          icon={Eye}
          tone="blue"
        />
        <StatCard
          label="รูปภาพประกาศ"
          value={`${post.images.length.toLocaleString('th-TH')} รูป`}
          icon={ImageIcon}
          tone="amber"
        />
        <StatCard
          label="ค่าตอบแทน"
          value={
            post.rewardAmount
              ? `${Number(post.rewardAmount).toLocaleString('th-TH')} บาท`
              : 'ไม่ระบุ'
          }
          icon={Coins}
          tone="emerald"
        />
      </div>

      {/* รูปภาพประกอบประกาศทั้งหมด */}
      {post.images.length > 0 && (
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">
            รูปภาพประกาศ
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {post.images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted"
              >
                <Image
                  src={image.imageUrl}
                  alt={`${post.petName} รูปที่ ${image.sortOrder + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
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
          <InfoRow label="ลักษณะเด่น" value={post.distinctiveFeatures ?? '-'} />
          <InfoRow label="รายละเอียดประกาศ" value={post.description ?? '-'} />
          {post.pet && (
            <InfoRow label="ผูกกับสัตว์เลี้ยงในระบบ" value={post.pet.name} />
          )}
        </div>

        {/* ข้อมูลติดต่อ */}
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">
            ข้อมูลติดต่อ
          </h2>
          <InfoRow label="เบอร์โทรศัพท์" value={post.contactPhone ?? '-'} />
          <InfoRow label="LINE ID" value={post.contactLineId ?? '-'} />
          <InfoRow label="อีเมล" value={post.contactEmail ?? '-'} />
          <InfoRow
            label="ผู้โพสต์"
            value={`${post.user.firstName} ${post.user.lastName} (${post.user.email})`}
          />
        </div>
      </div>

      {/* สถานที่ */}
      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">สถานที่</h2>
        <InfoRow
          label="จังหวัด / อำเภอ / ตำบล"
          value={
            [post.province, post.district, post.subdistrict]
              .filter(Boolean)
              .join(' / ') || '-'
          }
        />
        <InfoRow
          label="รายละเอียดสถานที่"
          value={post.locationDescription ?? '-'}
        />
        <InfoRow
          label="ตำแหน่งล่าสุดที่พบเห็น"
          value={post.currentLocation ?? '-'}
        />
        {hasCoordinates && (
          <GoogleMapsEmbed
            centerAddress={`${post.latitude},${post.longitude}`}
            heightClass="h-[240px]"
          />
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium break-words text-foreground">
        {value}
      </span>
    </div>
  );
}
