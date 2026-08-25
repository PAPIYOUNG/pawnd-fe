import { Metadata } from 'next';
import Link from 'next/link';
import { Check, Eye, Trash2 } from 'lucide-react';

import { UsersPagination } from './_components/users-pagination';
import { getUserRoleLabel, USER_STATUS_LABEL } from './_lib/user-labels';
import { getUsersAction } from '@/lib/action/admin.action';
import { formatThaiShortDate } from '@/lib/utils';
import { AdminUserListItem } from '@/types/admin';

export const metadata: Metadata = {
  title: 'จัดการผู้ใช้งาน | Admin',
};

const PAGE_SIZE = 20;

interface AdminUsersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const requestedPage = Number((await searchParams).page);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const result = await getUsersAction({ page, limit: PAGE_SIZE });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">จัดการผู้ใช้งาน</h1>
        <p className="text-sm text-muted-foreground">
          รายชื่อผู้ใช้งานทั้งหมดในระบบ Pawnd
        </p>
      </div>

      {'success' in result ? (
        // Error State: เรียก API รายชื่อผู้ใช้งานไม่สำเร็จ
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center">
          <span className="text-sm font-medium text-destructive">
            ไม่สามารถโหลดรายชื่อผู้ใช้งานได้
          </span>
          <p className="text-xs text-muted-foreground">{result.message}</p>
        </div>
      ) : result.users.length === 0 ? (
        // Empty State: ยังไม่มีผู้ใช้งานในระบบ
        <div className="flex h-40 items-center justify-center rounded-3xl border border-border bg-card text-sm text-muted-foreground">
          ยังไม่มีผู้ใช้งานในระบบ
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">ID</th>
                  <th className="py-3 pr-4 font-medium">ชื่อผู้ใช้งาน</th>
                  <th className="py-3 pr-4 font-medium">อีเมล</th>
                  <th className="py-3 pr-4 font-medium">บทบาท</th>
                  <th className="py-3 pr-4 font-medium">สถานะ</th>
                  <th className="py-3 pr-4 font-medium">วันที่สมัคร</th>
                  <th className="py-3 pl-4 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {result.users.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          </div>

          <UsersPagination
            pagination={result.pagination}
            shownCount={result.users.length}
          />
        </div>
      )}
    </div>
  );
}

function UserRow({ user }: { user: AdminUserListItem }) {
  const status = USER_STATUS_LABEL[user.status];
  const roleLabel = getUserRoleLabel(user.role);

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td
        className="py-3 pr-4 font-mono text-xs text-muted-foreground"
        title={user.id}
      >
        {user.id.slice(0, 8)}
      </td>
      <td className="py-3 pr-4 font-semibold text-foreground">
        <Link
          href={`/admin/users/${user.id}`}
          className="hover:text-primary hover:underline"
        >
          {user.firstName} {user.lastName}
        </Link>
      </td>
      <td className="py-3 pr-4 text-muted-foreground">{user.email}</td>
      <td className="py-3 pr-4 text-muted-foreground">{roleLabel}</td>
      <td className="py-3 pr-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
        >
          {status.text}
        </span>
      </td>
      <td className="py-3 pr-4 text-muted-foreground">
        {formatThaiShortDate(user.createdAt)}
      </td>
      <td className="py-3 pl-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/users/${user.id}`}
            title="ดูรายละเอียดผู้ใช้งาน"
            aria-label={`ดูรายละเอียด ${user.firstName} ${user.lastName}`}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/70"
          >
            <Eye className="size-4" />
          </Link>
          {/* ยังไม่มี API สำหรับเปิดใช้งาน/ลบผู้ใช้งาน ปุ่มนี้จึงเป็น UI เตรียมไว้ก่อน (disabled) */}
          <button
            type="button"
            disabled
            title="ยังไม่รองรับ (รอ API จาก Backend)"
            aria-label={`เปิดใช้งาน ${user.firstName} ${user.lastName}`}
            className="flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check className="size-4" />
          </button>
          <button
            type="button"
            disabled
            title="ยังไม่รองรับ (รอ API จาก Backend)"
            aria-label={`ลบ ${user.firstName} ${user.lastName}`}
            className="flex size-8 items-center justify-center rounded-full bg-destructive/15 text-destructive disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
