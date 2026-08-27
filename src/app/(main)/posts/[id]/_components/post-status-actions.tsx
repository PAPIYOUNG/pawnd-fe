'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CircleX, Home, Loader2, RotateCcw, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { PostStatus } from '@/types/post';
import {
  changePostStatusAction,
  deletePostDetailAction,
} from '../_actions/post-status.actions';

interface PostStatusActionsProps {
  postId: string;
  status: PostStatus;
}

type PendingAction = 'reunite' | 'reopen' | 'close' | 'delete' | null;

/**
 * ปุ่มควบคุมสถานะประกาศ 4 ปุ่ม สำหรับเจ้าของประกาศเท่านั้น (Client Component)
 * - Home: เปลี่ยนเป็นกลับบ้านแล้ว (ACTIVE -> REUNITED)
 * - RotateCcw: เปิดประกาศอีกครั้ง (REUNITED -> ACTIVE)
 * - CircleX: ปิดประกาศ (-> CLOSED)
 * - Trash2: ลบประกาศถาวร แล้วพากลับหน้า Dashboard
 * Backend เป็นผู้ตรวจสิทธิ์ความเป็นเจ้าของซ้ำเสมอ (assertOwnedPost)
 */
export function PostStatusActions({ postId, status }: PostStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  const runChangeStatus = (action: PendingAction, nextStatus: PostStatus) => {
    setError(null);
    setPendingAction(action);
    startTransition(async () => {
      const result = await changePostStatusAction(postId, nextStatus);
      setPendingAction(null);
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm('ยืนยันลบประกาศนี้ถาวร? การลบไม่สามารถย้อนกลับได้')) return;
    setError(null);
    setPendingAction('delete');
    startTransition(async () => {
      // สำเร็จแล้ว deletePostDetailAction จะ redirect ออกจากหน้านี้ทันที จึงไม่มี return value ให้เช็ก
      const result = await deletePostDetailAction(postId);
      if (result && !result.success) {
        setPendingAction(null);
        setError(result.message);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="เปลี่ยนเป็นกลับบ้านแล้ว"
          title="กลับบ้านแล้ว (Reunited)"
          disabled={isPending || status !== 'ACTIVE'}
          onClick={() => runChangeStatus('reunite', 'REUNITED')}
        >
          {pendingAction === 'reunite' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Home className="size-4" />
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="เปิดประกาศอีกครั้ง"
          title="เปิดประกาศอีกครั้ง (Active)"
          disabled={isPending || status !== 'REUNITED'}
          onClick={() => runChangeStatus('reopen', 'ACTIVE')}
        >
          {pendingAction === 'reopen' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RotateCcw className="size-4" />
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="ปิดประกาศ"
          title="ปิดประกาศ (Closed)"
          disabled={isPending || status === 'CLOSED'}
          onClick={() => runChangeStatus('close', 'CLOSED')}
        >
          {pendingAction === 'close' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CircleX className="size-4" />
          )}
        </Button>

        <Button
          type="button"
          variant="destructive"
          size="icon"
          aria-label="ลบประกาศถาวร"
          title="ลบประกาศ"
          disabled={isPending}
          onClick={handleDelete}
        >
          {pendingAction === 'delete' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
