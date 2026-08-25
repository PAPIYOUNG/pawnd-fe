'use client';

import { useState, useTransition } from 'react';

import {
  REPORT_STATUS_LABEL,
  REVIEWABLE_REPORT_STATUSES,
} from '../_lib/report-labels';
import { reviewReportAction } from '@/lib/action/admin.action';
import { ReportStatus } from '@/types/admin';

interface ReportReviewControlProps {
  reportId: string;
  hasReportedContent: boolean;
}

/**
 * ReportReviewControl (Client Component)
 * - ฟอร์มตรวจสอบรายงาน: เลือกสถานะผลตรวจสอบ (ตรวจสอบแล้ว / ยกคำร้อง / ดำเนินการแล้ว)
 *   พร้อมตัวเลือกซ่อนเนื้อหาที่ถูกรายงานทันที (แสดงเฉพาะเมื่อเลือก "ดำเนินการแล้ว" เพราะเป็น action เดียวที่มีผลต่อเนื้อหา)
 * - เรียก Server Action `reviewReportAction` (PATCH /admin/reports/:id ของ Backend)
 * - Backend อนุญาตให้ตรวจสอบได้เพียงครั้งเดียวต่อรายงาน (สถานะต้องเป็น PENDING เท่านั้น)
 *   ดังนั้นเมื่อบันทึกสำเร็จ ฟอร์มนี้จะหายไปและแทนที่ด้วย Badge สถานะแทน (ดูที่ ReportRow)
 */
export function ReportReviewControl({
  reportId,
  hasReportedContent,
}: ReportReviewControlProps) {
  const [status, setStatus] = useState<ReportStatus>('REVIEWED');
  const [hideContent, setHideContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canHideContent = hasReportedContent && status === 'ACTION_TAKEN';

  function handleStatusChange(next: ReportStatus) {
    setStatus(next);
    if (next !== 'ACTION_TAKEN') setHideContent(false);
  }

  function handleSubmit() {
    if (isPending) return;

    const confirmMessage = hideContent
      ? `ยืนยันบันทึกผลตรวจสอบเป็น "${REPORT_STATUS_LABEL[status].text}" และซ่อนเนื้อหาที่ถูกรายงานทันที?`
      : `ยืนยันบันทึกผลตรวจสอบเป็น "${REPORT_STATUS_LABEL[status].text}"?`;
    if (!window.confirm(confirmMessage)) return;

    setError(null);
    startTransition(async () => {
      const result = await reviewReportAction(reportId, {
        status,
        hideContent: canHideContent ? hideContent : undefined,
      });
      if ('success' in result) {
        setError(result.message);
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <span className="text-xs font-medium text-emerald-600">
        บันทึกผลตรวจสอบแล้ว
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <select
          aria-label="เลือกผลการตรวจสอบรายงาน"
          value={status}
          disabled={isPending}
          onChange={(event) =>
            handleStatusChange(event.target.value as ReportStatus)
          }
          className="h-8 rounded-2xl border border-transparent bg-input/50 px-2.5 text-xs text-foreground outline-none transition-[color,box-shadow] duration-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {REVIEWABLE_REPORT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {REPORT_STATUS_LABEL[value].text}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="flex h-8 items-center rounded-2xl bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'กำลังบันทึก...' : 'บันทึกผล'}
        </button>
      </div>

      {canHideContent && (
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={hideContent}
            disabled={isPending}
            onChange={(event) => setHideContent(event.target.checked)}
            className="size-3.5 rounded-[5px] border-border"
          />
          ซ่อนเนื้อหาที่ถูกรายงานทันที
        </label>
      )}

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
