'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  CircleX,
  Home,
  Loader2,
  RotateCcw,
  Trash2,
  type LucideIcon,
} from 'lucide-react';

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

type ActionKey = 'reunite' | 'reopen' | 'close' | 'delete';

/**
 * ปุ่มควบคุมสถานะประกาศ 4 ปุ่ม พร้อมคำบรรยายสั้นๆ ใต้ไอคอนบอกหน้าที่ของแต่ละปุ่ม
 * สำหรับเจ้าของประกาศเท่านั้น (Client Component)
 * Backend เป็นผู้ตรวจสิทธิ์ความเป็นเจ้าของซ้ำเสมอ (assertOwnedPost)
 */
export function PostStatusActions({ postId, status }: PostStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<ActionKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runChangeStatus = (action: ActionKey, nextStatus: PostStatus) => {
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

  // นิยามปุ่มทั้ง 4 พร้อมคำบรรยายอธิบายหน้าที่ของแต่ละปุ่ม (แสดงเป็น label ใต้ไอคอน + title ตอน hover)
  const actions: {
    key: ActionKey;
    icon: LucideIcon;
    label: string;
    description: string;
    variant: 'outline' | 'destructive';
    disabled: boolean;
    onClick: () => void;
  }[] = [
    {
      key: 'reunite',
      icon: Home,
      label: 'กลับบ้านแล้ว',
      description:
        'เปลี่ยนสถานะประกาศเป็น "กลับบ้านแล้ว" เมื่อเจอตัวสัตว์เลี้ยงแล้ว',
      variant: 'outline',
      disabled: isPending || status !== 'ACTIVE',
      onClick: () => runChangeStatus('reunite', 'REUNITED'),
    },
    {
      key: 'reopen',
      icon: RotateCcw,
      label: 'เปิดอีกครั้ง',
      description:
        'เปิดประกาศให้กลับมาตามหาอีกครั้ง (ยกเลิกสถานะกลับบ้านแล้ว)',
      variant: 'outline',
      disabled: isPending || status !== 'REUNITED',
      onClick: () => runChangeStatus('reopen', 'ACTIVE'),
    },
    {
      key: 'close',
      icon: CircleX,
      label: 'ปิดประกาศ',
      description:
        'ปิดประกาศนี้ ไม่รับการติดต่อหรือแสดงผลในรายการค้นหาอีกต่อไป',
      variant: 'outline',
      disabled: isPending || status === 'CLOSED',
      onClick: () => runChangeStatus('close', 'CLOSED'),
    },
    {
      key: 'delete',
      icon: Trash2,
      label: 'ลบประกาศ',
      description: 'ลบประกาศนี้ออกจากระบบถาวร ไม่สามารถย้อนกลับได้',
      variant: 'destructive',
      disabled: isPending,
      onClick: handleDelete,
    },
  ];

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-1.5">
        {actions.map(
          ({ key, icon: Icon, label, description, variant, disabled, onClick }) => (
            <Button
              key={key}
              type="button"
              variant={variant}
              aria-label={description}
              title={description}
              disabled={disabled}
              onClick={onClick}
              className="h-auto min-w-14 flex-col gap-1 px-2 py-1.5 text-[10px] leading-tight whitespace-normal"
            >
              {pendingAction === key ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Icon className="size-4" />
              )}
              <span>{label}</span>
            </Button>
          ),
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
