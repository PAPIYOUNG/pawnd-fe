import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Flag,
  MessageSquare,
  PawPrint,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { UserStatusControl } from './_components/user-status-control';
import { getUserRoleLabel } from '../_lib/user-labels';
import { getUserByIdAction } from '@/lib/action/admin.action';
import { formatThaiShortDate } from '@/lib/utils';
import { StatCard } from '@/components/admin/stat-card';
import { AdminUserDetail } from '@/types/admin';

export const metadata: Metadata = {
  title: 'รายละเอียดผู้ใช้งาน | Admin',
};

interface AdminUserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { id } = await params;
  const result = await getUserByIdAction(id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <Link
        href="/admin/users"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        กลับไปหน้าจัดการผู้ใช้งาน
      </Link>

      {'success' in result ? (
        // Error State: ไม่พบผู้ใช้งาน หรือเรียก API ไม่สำเร็จ
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center">
          <span className="text-sm font-medium text-destructive">
            {result.code === 'NOT_FOUND'
              ? 'ไม่พบผู้ใช้งานนี้ อาจถูกลบไปแล้ว'
              : 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้'}
          </span>
          {result.code !== 'NOT_FOUND' && (
            <p className="text-xs text-muted-foreground">{result.message}</p>
          )}
        </div>
      ) : (
        <UserDetail user={result.user} />
      )}
    </div>
  );
}

function UserDetail({ user }: { user: AdminUserDetail }) {
  const roleLabel = getUserRoleLabel(user.role);

  return (
    <div className="flex flex-col gap-6">
      {/* การ์ดข้อมูลหลักของผู้ใช้งาน */}
      <div className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <UserRound className="size-8" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <h1 className="text-xl font-bold text-foreground">
            {user.firstName} {user.lastName}
          </h1>
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <span className="text-xs text-muted-foreground">
            บทบาท: {roleLabel} · สมัครเมื่อ{' '}
            {formatThaiShortDate(user.createdAt)}
          </span>
          <UserStatusControl userId={user.id} initialStatus={user.status} />
        </div>
      </div>

      {/* สถิติการใช้งานของผู้ใช้งาน */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="สัตว์เลี้ยงของผู้ใช้"
          value={`${user._count.pets.toLocaleString('th-TH')} ตัว`}
          icon={PawPrint}
          tone="amber"
        />
        <StatCard
          label="ประกาศสัตว์หาย/พบ"
          value={`${user._count.petPosts.toLocaleString('th-TH')} รายการ`}
          icon={Flag}
          tone="blue"
        />
        <StatCard
          label="โพสต์ในชุมชน"
          value={`${user._count.communityPosts.toLocaleString('th-TH')} โพสต์`}
          icon={MessageSquare}
          tone="emerald"
        />
        <StatCard
          label="รายงานที่แจ้งเข้ามา"
          value={`${user._count.submittedContentReports.toLocaleString('th-TH')} รายการ`}
          icon={ShieldCheck}
          tone="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ข้อมูลติดต่อ */}
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">
            ข้อมูลติดต่อ
          </h2>
          <InfoRow label="เบอร์โทรศัพท์" value={user.phone ?? '-'} />
          <InfoRow label="ที่อยู่" value={user.address ?? '-'} />
          <InfoRow label="LINE ID" value={user.lineId ?? '-'} />
        </div>

        {/* สถานะบัญชี */}
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">
            สถานะบัญชี
          </h2>
          <InfoRow
            label="ยืนยันอีเมล"
            value={
              user.emailVerifiedAt
                ? `ยืนยันแล้วเมื่อ ${formatThaiShortDate(user.emailVerifiedAt)}`
                : 'ยังไม่ยืนยัน'
            }
          />
          <InfoRow
            label="การแจ้งเตือน"
            value={user.notificationEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          />
          <InfoRow
            label="ยืนยันตัวตน 2 ชั้น (2FA)"
            value={user.twoFactorEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          />
          <InfoRow
            label="เข้าสู่ระบบล่าสุด"
            value={
              user.lastLoginAt
                ? formatThaiShortDate(user.lastLoginAt)
                : 'ยังไม่เคยเข้าสู่ระบบ'
            }
          />
          <InfoRow
            label="แก้ไขล่าสุด"
            value={formatThaiShortDate(user.updatedAt)}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
