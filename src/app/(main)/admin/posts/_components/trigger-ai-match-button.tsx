'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

import { triggerAiMatchAction } from '@/lib/action/admin.action';

interface TriggerAiMatchButtonProps {
  postId: string;
}

/**
 * TriggerAiMatchButton (Client Component)
 * - ปุ่มสั่งให้ AI ค้นหาคู่จับคู่ใหม่สำหรับประกาศนี้ (re-run matching engine)
 * - เรียก Server Action `triggerAiMatchAction` (POST /admin/posts/:postId/ai-match ของ Backend)
 * - เมื่อสำเร็จจะเรียก router.refresh() เพื่อดึงรายการ AI Matches ล่าสุดจาก Server Component มาแสดง
 */
export function TriggerAiMatchButton({ postId }: TriggerAiMatchButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await triggerAiMatchAction(postId);
      if ('success' in result) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-2xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Sparkles className="size-3.5" />
        {isPending ? 'กำลังค้นหาคู่จับคู่...' : 'สั่งให้ AI ค้นหาคู่ใหม่'}
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
