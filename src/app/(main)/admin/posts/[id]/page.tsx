import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Coins,
  Eye,
  ImageIcon,
  PawPrint,
  Sparkles,
} from 'lucide-react';

import { PostStatusControl } from '../_components/post-status-control';
import { TriggerAiMatchButton } from '../_components/trigger-ai-match-button';
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
import { AdminAiMatchItem, AdminPostDetail } from '@/types/admin';

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
        <PostDetail post={result.post} aiMatches={result.aiMatches ?? []} />
      )}
    </div>
  );
}

function PostDetail({
  post,
  aiMatches,
}: {
  post: AdminPostDetail;
  aiMatches: AdminAiMatchItem[];
}) {
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

      {/* ผลการจับคู่ของ AI (AI Smart Matching Results) */}
      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-foreground">
            <Sparkles className="size-4 text-primary" />
            ผลการจับคู่ของ AI
          </h2>
          <TriggerAiMatchButton postId={post.id} />
        </div>

        {aiMatches.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
            ยังไม่มีผลการจับคู่จาก AI สำหรับประกาศนี้
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {aiMatches.map((match) => (
              <AiMatchRow key={match.matchId} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AiMatchRow({ match }: { match: AdminAiMatchItem }) {
  const matched = match.matchedPost;
  const cover = matched?.images[0]?.imageUrl ?? null;
  const typeLabel = matched ? POST_TYPE_LABEL[matched.type] : null;
  const statusLabel = matched ? POST_STATUS_LABEL[matched.status] : null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center">
      {/* รูปปกของประกาศที่ถูกจับคู่ */}
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={matched?.petName ?? 'ประกาศที่จับคู่'}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <PawPrint className="size-5" />
          </div>
        )}
      </div>

      {/* ข้อมูลประกาศที่ถูกจับคู่ */}
      <div className="flex flex-1 flex-col gap-1">
        {matched ? (
          <Link
            href={`/admin/posts/${matched.id}`}
            className="font-semibold text-foreground hover:text-primary hover:underline"
          >
            {matched.petName}
          </Link>
        ) : (
          <span className="font-semibold text-muted-foreground">
            ประกาศนี้ถูกลบไปแล้ว
          </span>
        )}
        {matched && (
          <div className="flex flex-wrap items-center gap-1.5">
            {typeLabel && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${typeLabel.className}`}
              >
                {typeLabel.text}
              </span>
            )}
            {statusLabel && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusLabel.className}`}
              >
                {statusLabel.text}
              </span>
            )}
            {matched.breed && (
              <span className="text-xs text-muted-foreground">
                {matched.breed}
              </span>
            )}
          </div>
        )}
        <span className="text-xs text-muted-foreground">
          {match.distanceKm !== null
            ? `ห่างกัน ${match.distanceKm.toLocaleString('th-TH')} กม.`
            : 'ไม่ทราบระยะทาง'}
          {' · '}
          {match.isNotified ? 'แจ้งเตือนผู้ใช้แล้ว' : 'ยังไม่ได้แจ้งเตือน'}
          {' · '}
          จับคู่เมื่อ {formatThaiShortDate(match.createdAt)}
        </span>
      </div>

      <MatchScoreBadge match={match} />
    </div>
  );
}

function MatchScoreBadge({ match }: { match: AdminAiMatchItem }) {
  const finalPercent = Math.round(match.finalScore * 100);

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5 sm:w-44">
      <span className="text-lg font-bold text-primary">{finalPercent}%</span>
      <div className="flex w-full flex-col gap-1">
        <ScoreBar label="ภาพ" value={match.vectorSimilarity} />
        <ScoreBar label="ลักษณะ" value={match.featureScore} />
        <ScoreBar label="ระยะทาง" value={match.locationScore} />
        <ScoreBar label="วันที่" value={match.dateScore} />
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)));

  return (
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
      <span className="w-11 shrink-0">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary/70"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right">{percent}%</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="w-44 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium break-words text-foreground">{value}</span>
    </div>
  );
}
