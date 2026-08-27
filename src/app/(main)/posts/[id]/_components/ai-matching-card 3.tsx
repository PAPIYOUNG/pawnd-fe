'use client';

import { useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  Loader2,
  MapPin,
  PawPrint,
  Pin,
  PinOff,
  Sparkles,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatThaiShortDate } from '@/lib/utils';
import type { PetType, PostStatus } from '@/types/post';
import type { AiMatchItem } from '@/types/ai-match';
import {
  getPostMatchesAction,
  toggleDismissMatchAction,
  togglePinMatchAction,
  triggerPostMatchAction,
} from '../_actions/ai-matching.actions';

interface AiMatchingCardProps {
  postId: string;
  postStatus: PostStatus;
  /** true เฉพาะเจ้าของประกาศเท่านั้น เพราะ Backend อนุญาตให้ดู/สั่งจับคู่ได้เฉพาะเจ้าของ */
  isOwner: boolean;
  /** ผลการจับคู่ล่าสุดที่ดึงมาจาก Server Component ตอนโหลดหน้าครั้งแรก */
  initialMatches: AiMatchItem[];
}

/** ป้ายชื่อประเภทสัตว์เลี้ยงภาษาไทย สำหรับแสดงผลในการ์ดนี้เท่านั้น */
const PET_TYPE_LABEL_TH: Record<PetType, string> = {
  DOG: 'สุนัข',
  CAT: 'แมว',
  BIRD: 'นก',
  HAMSTER: 'แฮมสเตอร์',
  EXOTIC: 'สัตว์พิเศษ',
  OTHER: 'สัตว์เลี้ยง',
};

// สถานะ Pin/Dismiss ต่อ 1 การจับคู่ — GET /ai/posts/:postId/matches ไม่ได้ส่งค่านี้มาด้วย
// จึงเก็บไว้เองฝั่ง Client โดยเริ่มจาก false ทั้งหมด แล้วอัปเดตตามผลลัพธ์ที่ปุ่ม Pin/Dismiss ส่งกลับมา
interface MatchActionState {
  isPinned: boolean;
  isDismissed: boolean;
}

/**
 * AiMatchingCard (Client Component)
 * - แสดงส่วน AI Smart Matching บนหน้ารายละเอียดประกาศ (public post detail)
 * - เจ้าของประกาศกดปุ่มเพื่อสั่งให้ AI ค้นหาคู่ที่ตรงกัน (POST /ai/match/:postId)
 *   ซึ่ง Backend จะคำนวณ Vector Similarity (จาก Image Embedding ที่สร้างไว้ตอนสร้างประกาศแล้ว)
 *   ร่วมกับคะแนนลักษณะภายนอก ระยะทาง และวันที่ แล้วบันทึกผลเป็น AiMatch ให้อัตโนมัติ
 * - แสดงรายการประกาศที่จับคู่ได้ พร้อมปุ่ม Pin (สนใจเป็นพิเศษ) และ Dismiss (ไม่ใช่ตัวที่ตามหา)
 * - ผู้ชมทั่วไปที่ไม่ใช่เจ้าของประกาศจะเห็นเพียงข้อความแนะนำฟีเจอร์เท่านั้น
 */
export function AiMatchingCard({
  postId,
  postStatus,
  isOwner,
  initialMatches,
}: AiMatchingCardProps) {
  // รายการผลการจับคู่ล่าสุดที่แสดงอยู่บนหน้าจอ
  const [matches, setMatches] = useState<AiMatchItem[]>(initialMatches);
  // สถานะ Pin/Dismiss ของแต่ละ match (key = matchId)
  const [actionState, setActionState] = useState<
    Record<string, MatchActionState>
  >({});
  // matchId ที่กำลังกด Pin หรือ Dismiss อยู่ (ใช้ disable ปุ่มระหว่างรอผล)
  const [pendingMatchId, setPendingMatchId] = useState<string | null>(null);
  // ข้อความสรุปหลังสั่งจับคู่ใหม่ล่าสุด เช่น "ตรวจสอบ 12 ประกาศ พบคู่ที่ตรงกัน 3 รายการ"
  const [summary, setSummary] = useState<string | null>(null);
  // ข้อความ Error State เมื่อสั่งจับคู่ไม่สำเร็จ
  const [error, setError] = useState<string | null>(null);
  const [isMatching, startMatchTransition] = useTransition();

  const isInactive = postStatus !== 'ACTIVE';

  // เรียงรายการที่ Pin ไว้ขึ้นก่อน (คงลำดับคะแนนเดิมของแต่ละกลุ่ม) และตัดรายการที่ถูก Dismiss ออก
  const visibleMatches = useMemo(() => {
    return matches
      .filter((match) => !actionState[match.matchId]?.isDismissed)
      .slice()
      .sort((a, b) => {
        const aPinned = actionState[a.matchId]?.isPinned ? 1 : 0;
        const bPinned = actionState[b.matchId]?.isPinned ? 1 : 0;
        return bPinned - aPinned;
      });
  }, [matches, actionState]);

  // ปุ่มสั่งให้ AI ค้นหาคู่ที่ตรงกันใหม่ทั้งหมด แล้วดึงรายการผลลัพธ์ล่าสุดมาแสดง
  function handleTriggerMatch() {
    setError(null);
    startMatchTransition(async () => {
      const triggerResult = await triggerPostMatchAction(postId);
      if ('success' in triggerResult) {
        setError(triggerResult.message);
        return;
      }

      setSummary(
        `ตรวจสอบประกาศที่เป็นไปได้ ${triggerResult.totalCandidates} รายการ พบคู่ที่ตรงกัน ${triggerResult.totalMatches} รายการ`,
      );

      const matchesResult = await getPostMatchesAction(postId);
      if ('success' in matchesResult) {
        setError(matchesResult.message);
        return;
      }
      setMatches(matchesResult.matches);
      // เคลียร์สถานะ Pin/Dismiss เดิม เพราะรายการอาจเปลี่ยนไปหลังคำนวณใหม่
      setActionState({});
    });
  }

  // ปุ่ม Pin/Dismiss ของแต่ละรายการ
  async function handleToggle(matchId: string, action: 'pin' | 'dismiss') {
    setPendingMatchId(matchId);
    setError(null);

    const result =
      action === 'pin'
        ? await togglePinMatchAction(postId, matchId)
        : await toggleDismissMatchAction(postId, matchId);

    setPendingMatchId(null);

    if ('success' in result) {
      setError(result.message);
      return;
    }

    setActionState((prev) => ({
      ...prev,
      [matchId]: { isPinned: result.isPinned, isDismissed: result.isDismissed },
    }));
  }

  if (!isOwner) {
    // ผู้ชมทั่วไป: แสดงเฉพาะข้อความแนะนำฟีเจอร์ ไม่มีสิทธิ์ดู/สั่งจับคู่ (Backend อนุญาตเฉพาะเจ้าของ)
    return (
      <Card className="rounded-3xl border-primary/30 bg-primary/5">
        <CardContent className="space-y-3 pt-6">
          <div>
            <h2 className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="size-4 text-primary" />
              AI Matching
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              อาจไม่ใช่น้อง เเต่อย่าเพิ่งหมดหวัง
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-1.5 text-base">
              <Sparkles className="size-4 text-primary" />
              AI Matching
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              ให้ AI ช่วยค้นหาประกาศที่ลักษณะตรงกับน้องของคุณ
            </p>
          </div>

          {/* ปุ่มสั่งให้ AI ค้นหาคู่จับคู่ใหม่ */}
          <Button
            type="button"
            size="sm"
            className="gap-1.5 rounded-2xl"
            disabled={isMatching || isInactive}
            onClick={handleTriggerMatch}
          >
            {isMatching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {isMatching ? 'กำลังค้นหาคู่ด้วย AI...' : 'ค้นหาคู่ด้วย AI'}
          </Button>
        </div>

        {isInactive && (
          <p className="mt-1 text-xs text-muted-foreground">
            ประกาศนี้ไม่ได้อยู่ในสถานะ &quot;กำลังตามหา&quot; จึงไม่สามารถสั่งจับคู่ใหม่ได้
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Error State: สั่งจับคู่ หรือ Pin/Dismiss ไม่สำเร็จ */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {summary && !error && (
          <p className="text-xs font-medium text-primary">{summary}</p>
        )}

        {/* Empty State: ยังไม่เคยสั่งจับคู่ หรือสั่งแล้วแต่ไม่พบคู่ที่ตรงกัน */}
        {visibleMatches.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-background/60 px-4 py-8 text-center">
            <PawPrint className="size-8 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">
              ยังไม่มีผลการจับคู่จาก AI สำหรับประกาศนี้
            </p>
            <p className="text-xs text-muted-foreground">
              กดปุ่ม &quot;ค้นหาคู่ด้วย AI&quot; ด้านบนเพื่อเริ่มค้นหา
            </p>
          </div>
        ) : (
          // Success State: รายการประกาศที่ AI จับคู่ได้ เรียงคะแนนสูงไปต่ำ (Pin ไว้ก่อนเสมอ)
          <div className="flex flex-col gap-2.5">
            {visibleMatches.map((match) => (
              <AiMatchRow
                key={match.matchId}
                match={match}
                isPinned={actionState[match.matchId]?.isPinned ?? false}
                isPending={pendingMatchId === match.matchId}
                onPin={() => handleToggle(match.matchId, 'pin')}
                onDismiss={() => handleToggle(match.matchId, 'dismiss')}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AiMatchRow({
  match,
  isPinned,
  isPending,
  onPin,
  onDismiss,
}: {
  match: AiMatchItem;
  isPinned: boolean;
  isPending: boolean;
  onPin: () => void;
  onDismiss: () => void;
}) {
  const post = match.matchedPost;
  const cover = post.images[0]?.imageUrl ?? null;
  const location = [post.subdistrict, post.district, post.province]
    .filter(Boolean)
    .join(', ');
  const finalPercent = Math.round(match.scores.finalScore * 100);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-3 sm:flex-row sm:items-center">
      {/* รูปปกของประกาศที่ AI จับคู่มาให้ */}
      <Link
        href={`/posts/${post.id}`}
        className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted"
      >
        {cover ? (
          <Image
            src={cover}
            alt={post.petName ?? 'ประกาศที่จับคู่ได้'}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <PawPrint className="size-5" />
          </div>
        )}
      </Link>

      {/* ข้อมูลของประกาศที่จับคู่ได้ */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={post.type === 'LOST' ? 'lost' : 'found'}>
            {post.type === 'LOST' ? 'ตามหา' : 'พบเห็น'}
          </Badge>
          <Link
            href={`/posts/${post.id}`}
            className="truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
          >
            {post.petName ?? PET_TYPE_LABEL_TH[post.petType]}
          </Link>
        </div>
        <span className="truncate text-xs text-muted-foreground">
          {PET_TYPE_LABEL_TH[post.petType]}
          {post.breed && ` · ${post.breed}`}
          {post.color && ` · สี${post.color}`}
        </span>
        {location && (
          <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0 text-primary" />
            {location}
            {' · '}
            {match.scores.distanceKm.toLocaleString('th-TH', {
              maximumFractionDigits: 1,
            })}{' '}
            กม.
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          วันที่เกิดเหตุ {formatThaiShortDate(post.eventDate)}
        </span>
      </div>

      {/* คะแนนความเหมือนรวม */}
      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
        <span className="rounded-xl bg-primary/10 px-2.5 py-1 text-sm font-extrabold text-primary">
          {finalPercent}%
        </span>

        {/* ปุ่ม Pin / Dismiss */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={isPinned ? 'default' : 'outline'}
            size="icon-sm"
            className="rounded-full"
            disabled={isPending}
            aria-label={isPinned ? 'ยกเลิกปักหมุด' : 'ปักหมุดรายการนี้'}
            onClick={onPin}
          >
            {isPinned ? (
              <PinOff className="size-3.5" />
            ) : (
              <Pin className="size-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={isPending}
            aria-label="ไม่ใช่ตัวที่ตามหา ซ่อนรายการนี้"
            onClick={onDismiss}
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <X className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
