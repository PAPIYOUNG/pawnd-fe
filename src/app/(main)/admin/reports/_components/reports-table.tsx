'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

import { ReportReviewControl } from './report-review-control';
import { REPORT_STATUS_LABEL } from '../_lib/report-labels';
import { formatThaiShortDate } from '@/lib/utils';
import { AdminReportListItem, ReportStatus } from '@/types/admin';

interface ReportsTableProps {
  reports: AdminReportListItem[];
}

// แท็บกรองสถานะ: 'ALL' หมายถึงแสดงทุกรายงาน (ไม่ใช่ค่าใน ReportStatus enum ของ Backend)
const STATUS_TABS: { value: ReportStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'PENDING', label: REPORT_STATUS_LABEL.PENDING.text },
  { value: 'REVIEWED', label: REPORT_STATUS_LABEL.REVIEWED.text },
  { value: 'REJECTED', label: REPORT_STATUS_LABEL.REJECTED.text },
  { value: 'ACTION_TAKEN', label: REPORT_STATUS_LABEL.ACTION_TAKEN.text },
];

/**
 * ReportsTable (Client Component)
 * - แสดงตารางรายงาน (Content Report) พร้อมแท็บกรองสถานะฝั่ง Client
 * - หมายเหตุ: Backend endpoint `GET /admin/reports` ยังไม่รองรับ filter/pagination
 *   จึงกรองข้อมูลจากรายการที่ดึงมาทั้งหมดในเบราว์เซอร์แทนการยิง request ใหม่
 */
export function ReportsTable({ reports }: ReportsTableProps) {
  const [filter, setFilter] = useState<ReportStatus | 'ALL'>('ALL');

  const filteredReports = useMemo(
    () =>
      filter === 'ALL'
        ? reports
        : reports.filter((report) => report.status === filter),
    [reports, filter],
  );

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={`rounded-2xl px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredReports.length === 0 ? (
        // Empty State: ไม่มีรายงานตามสถานะที่เลือก
        <div className="flex h-40 items-center justify-center rounded-3xl border border-border text-sm text-muted-foreground">
          ไม่พบรายงานตามสถานะที่เลือก
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="py-3 pr-4 font-medium">ID</th>
                <th className="py-3 pr-4 font-medium">เนื้อหาที่ถูกรายงาน</th>
                <th className="py-3 pr-4 font-medium">ผู้รายงาน</th>
                <th className="py-3 pr-4 font-medium">เหตุผล</th>
                <th className="py-3 pr-4 font-medium">สถานะ</th>
                <th className="py-3 pr-4 font-medium">วันที่รายงาน</th>
                <th className="py-3 pl-4 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <ReportRow key={report.id} report={report} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReportRow({ report }: { report: AdminReportListItem }) {
  const statusLabel = REPORT_STATUS_LABEL[report.status];
  const content = report.communityPost ?? report.comment;
  const contentType = report.communityPost ? 'โพสต์ชุมชน' : 'คอมเมนต์';
  const coverImage = report.communityPost?.images[0]?.imageUrl;

  return (
    <tr className="border-b border-border/60 last:border-0 align-top">
      <td
        className="py-3 pr-4 font-mono text-xs text-muted-foreground"
        title={report.id}
      >
        {report.id.slice(0, 8)}
      </td>
      <td className="py-3 pr-4">
        {content ? (
          <div className="flex items-start gap-2">
            {coverImage && (
              <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={coverImage}
                  alt={`ภาพประกอบ${contentType}ที่ถูกรายงาน`}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                {contentType} ของ {content.user.firstName}{' '}
                {content.user.lastName}
              </span>
              <p className="line-clamp-2 max-w-xs text-sm text-foreground">
                {content.content}
              </p>
              {content.isHidden && (
                <span className="w-fit rounded-full bg-zinc-500/10 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                  ซ่อนอยู่
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">
            เนื้อหาถูกลบไปแล้ว
          </span>
        )}
      </td>
      <td className="py-3 pr-4 text-muted-foreground">
        {report.reporter.firstName} {report.reporter.lastName}
      </td>
      <td className="py-3 pr-4 text-muted-foreground">
        <p className="max-w-[180px]">{report.reason}</p>
      </td>
      <td className="py-3 pr-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusLabel.className}`}
        >
          {statusLabel.text}
        </span>
        {report.reviewer && (
          <p className="mt-1 text-xs text-muted-foreground">
            โดย {report.reviewer.firstName} {report.reviewer.lastName}
          </p>
        )}
      </td>
      <td className="py-3 pr-4 text-muted-foreground">
        {formatThaiShortDate(report.createdAt)}
      </td>
      <td className="py-3 pl-4">
        <div className="flex justify-end">
          {report.status === 'PENDING' ? (
            <ReportReviewControl
              reportId={report.id}
              hasReportedContent={content !== null}
            />
          ) : (
            <span className="text-xs text-muted-foreground">
              {report.reviewedAt && formatThaiShortDate(report.reviewedAt)}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
