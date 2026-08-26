'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';

import {
  POST_STATUS_LABEL,
  SELECTABLE_POST_STATUSES,
} from '../_lib/post-labels';
import { updatePostStatusAction } from '@/lib/action/admin.action';
import { PostStatus } from '@/types/post';

// ข้อความยืนยันก่อนเปลี่ยนสถานะ เพราะการซ่อน/ลบประกาศกระทบการมองเห็นของผู้ใช้งานทันที
const CONFIRM_MESSAGE: Partial<Record<PostStatus, string>> = {
  DELETED: 'ยืนยันลบประกาศนี้อย่างถาวร? การกระทำนี้ไม่สามารถย้อนกลับได้',
  HIDDEN: 'ยืนยันซ่อนประกาศนี้? ผู้ใช้งานทั่วไปจะไม่เห็นประกาศนี้อีก',
  REUNITED: 'ยืนยันทำเครื่องหมายว่า "พากลับบ้านแล้ว"?',
  CLOSED: 'ยืนยันปิดประกาศนี้?',
  ACTIVE: 'ยืนยันเปิดใช้งานประกาศนี้อีกครั้ง?',
};

interface PostStatusControlProps {
  postId: string;
  initialStatus: PostStatus;
}

/**
 * PostStatusControl (Client Component)
 * - Dropdown เปลี่ยนสถานะประกาศ + ปุ่มลบด่วน (ตั้งสถานะเป็น DELETED)
 * - เรียก Server Action `updatePostStatusAction` (PATCH /admin/posts/:id ของ Backend)
 * - มีขั้นตอนยืนยันก่อนบันทึกทุกครั้ง เพราะผลกระทบต่อการมองเห็นประกาศย้อนกลับไม่ได้ทันที
 */
export function PostStatusControl({
  postId,
  initialStatus,
}: PostStatusControlProps) {
  const [status, setStatus] = useState<PostStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function changeStatus(next: PostStatus) {
    if (next === status || isPending) return;

    const confirmMessage =
      CONFIRM_MESSAGE[next] ??
      `ยืนยันเปลี่ยนสถานะเป็น "${POST_STATUS_LABEL[next].text}"?`;
    if (!window.confirm(confirmMessage)) return;

    setError(null);
    startTransition(async () => {
      const result = await updatePostStatusAction(postId, next);
      if ('success' in result) {
        setError(result.message);
        return;
      }
      setStatus(result.post.status);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-2">
        <select
          aria-label="เปลี่ยนสถานะประกาศ"
          value={status}
          disabled={isPending}
          onChange={(event) => changeStatus(event.target.value as PostStatus)}
          className="h-8 rounded-2xl border border-transparent bg-input/50 px-2.5 text-xs text-foreground outline-none transition-[color,box-shadow] duration-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {SELECTABLE_POST_STATUSES.map((value) => (
            <option key={value} value={value}>
              {POST_STATUS_LABEL[value].text}
            </option>
          ))}
        </select>

        <button
          type="button"
          title="ลบประกาศ"
          aria-label="ลบประกาศ"
          disabled={isPending || status === 'DELETED'}
          onClick={() => changeStatus('DELETED')}
          className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
