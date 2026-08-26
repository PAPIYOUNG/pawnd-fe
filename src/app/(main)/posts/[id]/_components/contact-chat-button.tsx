'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/api-error';
import { createOrGetChatRoom } from '@/services/chat.service';
import type { PostStatus } from '@/types/post';

interface ContactChatButtonProps {
  postId: string;
  postStatus: PostStatus;
  ownerId: string;
  currentUserId: string | null;
}

/** ปุ่มเปิดหรือสร้าง ChatRoom จากประกาศตาม Backend contract เดิม */
export function ContactChatButton({
  postId,
  postStatus,
  ownerId,
  currentUserId,
}: ContactChatButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUserId === ownerId;
  const isInactive = postStatus !== 'ACTIVE';

  /** ตรวจ session ก่อน แล้วให้ Backend เป็นผู้ยืนยันสิทธิ์และสร้างห้อง */
  async function handleOpenChat() {
    if (!currentUserId) {
      router.push('/login');
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      const { room } = await createOrGetChatRoom(postId);
      router.push(`/chat?room=${room.id}`);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.statusCode === 401) {
        router.replace('/login');
        return;
      }
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : 'ไม่สามารถเปิดห้องแชทได้ กรุณาลองใหม่อีกครั้ง',
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size="lg"
        className="w-full rounded-2xl"
        disabled={isPending || isOwner || isInactive}
        onClick={handleOpenChat}
      >
        <MessageCircle className="size-5" />
        {isPending
          ? 'กำลังเปิดห้องแชท...'
          : isOwner
            ? 'นี่คือประกาศของคุณ'
            : isInactive
              ? 'ประกาศนี้ปิดรับการติดต่อแล้ว'
              : 'แชทติดต่อเจ้าของประกาศ'}
      </Button>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
