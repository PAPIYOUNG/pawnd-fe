import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Sparkles,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PostEvent, PostEventType } from '@/types/posts-event';

interface PostEventsCardProps {
  events: PostEvent[];
  /** ข้อความที่แสดงเมื่อเรียก API Timeline ไม่สำเร็จ */
  errorMessage?: string | null;
  /** โหมดเต็มสำหรับหน้า progress หรือโหมดย่อสำหรับ sidebar ของ post detail */
  compact?: boolean;
}

/** ข้อมูลการนำเสนอของแต่ละ event type ตาม enum ที่ Backend กำหนด */
const EVENT_CONTENT: Record<
  PostEventType,
  {
    title: string;
    fallbackDescription: string;
    Icon: LucideIcon;
    iconClassName: string;
  }
> = {
  POST_CREATED: {
    title: 'สร้างประกาศแล้ว',
    fallbackDescription: 'ระบบบันทึกประกาศเข้าสู่ PAWND เรียบร้อยแล้ว',
    Icon: FileText,
    iconClassName: 'bg-primary/10 text-primary',
  },
  AI_MATCHES_FOUND: {
    title: 'AI พบเคสที่อาจตรงกัน',
    fallbackDescription: 'ระบบพบประกาศที่มีลักษณะใกล้เคียงจากการวิเคราะห์ AI',
    Icon: Sparkles,
    iconClassName: 'bg-primary/10 text-primary',
  },
  AI_MATCH_CONFIRMED: {
    title: 'ยืนยันผลการจับคู่ AI',
    fallbackDescription: 'มีการยืนยันผลการจับคู่ของประกาศนี้',
    Icon: CheckCircle2,
    iconClassName: 'bg-primary/10 text-primary',
  },
  REUNITED: {
    title: 'สัตว์เลี้ยงกลับบ้านแล้ว',
    fallbackDescription:
      'เจ้าของประกาศยืนยันว่าสัตว์เลี้ยงกลับบ้านอย่างปลอดภัย',
    Icon: Heart,
    iconClassName: 'bg-primary text-primary-foreground',
  },
  POST_CLOSED: {
    title: 'ปิดประกาศแล้ว',
    fallbackDescription: 'ประกาศนี้ถูกปิดการติดตามแล้ว',
    Icon: XCircle,
    iconClassName: 'bg-destructive/10 text-destructive',
  },
};

/** เนื้อหาสำรองเพื่อป้องกันหน้าแตก หาก Backend เพิ่ม event type ใหม่ในอนาคต */
const UNKNOWN_EVENT_CONTENT = {
  title: 'มีความคืบหน้าใหม่',
  fallbackDescription: 'ระบบบันทึกเหตุการณ์ใหม่ของประกาศนี้แล้ว',
  Icon: Clock,
  iconClassName: 'bg-primary/10 text-primary',
};

/** ใช้รูปแบบวันที่ภาษาไทยในรายการ Timeline */
const eventDateFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
  // Backend เก็บเวลาเป็น UTC จึงแสดงผลเป็นเวลาประเทศไทยที่ชั้น UI
  timeZone: 'Asia/Bangkok',
});

/**
 * เรียง event จากเก่าไปใหม่ให้สอดคล้องกับลำดับที่ Backend ส่งกลับ
 * และคงลำดับเดิมไว้สำหรับข้อมูลที่มีวันที่ไม่ถูกต้อง
 */
function sortEvents(events: PostEvent[]): PostEvent[] {
  return events
    .map((event, index) => ({ event, index }))
    .sort((left, right) => {
      const leftTime = Date.parse(left.event.createdAt);
      const rightTime = Date.parse(right.event.createdAt);
      const leftIsValid = Number.isFinite(leftTime);
      const rightIsValid = Number.isFinite(rightTime);

      if (leftIsValid && rightIsValid && leftTime !== rightTime) {
        return leftTime - rightTime;
      }

      if (leftIsValid !== rightIsValid) {
        return leftIsValid ? -1 : 1;
      }

      return left.index - right.index;
    })
    .map(({ event }) => event);
}

/** แปลงวันที่ ISO จาก Backend เป็นวันที่ภาษาไทย โดยไม่ให้วันที่เสียทำให้หน้า render ล้ม */
function formatEventDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'ไม่ระบุเวลา'
    : eventDateFormatter.format(date);
}

/**
 * PostEventsCard (Server Component)
 * - แสดง Post Event Timeline ใน sidebar ของ post detail หรือหน้า progress แบบเต็ม
 * - ใช้ข้อมูลจริงจาก GET /posts/:id/events
 * - รองรับ loading ผ่าน route boundary และรองรับ error/empty state ของ API
 */
export function PostEventsCard({
  events,
  errorMessage,
  compact = true,
}: PostEventsCardProps) {
  // Backend เรียง event จากเก่าไปใหม่อยู่แล้ว แต่เรียงซ้ำเพื่อป้องกัน caller อื่นส่งลำดับมาไม่ตรงกัน
  const orderedEvents = sortEvents(events);

  return (
    <Card
      className={cn(
        'flex flex-col border-border/80 bg-card',
        compact ? 'rounded-lg' : 'rounded-3xl',
      )}
    >
      {/* หัวข้อของกล่อง Timeline */}
      <CardHeader
        className={cn(
          'flex flex-row items-center justify-between gap-3',
          compact ? 'p-4 pb-3' : 'p-5 pb-4',
        )}
      >
        <div>
          <CardTitle className={compact ? 'text-base' : 'text-xl'}>
            ความคืบหน้าประกาศ
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            เหตุการณ์ล่าสุดจากระบบ PAWND
          </p>
        </div>

        <span
          className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
          aria-label={`มี ${events.length} เหตุการณ์`}
        >
          {events.length} เหตุการณ์
        </span>
      </CardHeader>

      {/* เนื้อหา Timeline: แสดง error ก่อนข้อมูล, จากนั้นจึงเลือก empty หรือรายการ event */}
      <CardContent className={cn(compact ? 'p-4 pt-0' : 'p-5 pt-0')}>
        {errorMessage ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle
              className="mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />
            <p>{errorMessage}</p>
          </div>
        ) : orderedEvents.length > 0 ? (
          <ol
            aria-label="ลำดับความคืบหน้าประกาศ"
            className={cn(
              'space-y-0',
              compact && 'max-h-96 overflow-y-auto pr-1',
            )}
          >
            {orderedEvents.map((event, index) => {
              // ใช้ fallback เพื่อให้ event type ใหม่จาก Backend ยังแสดงผลได้อย่างปลอดภัย
              const content =
                EVENT_CONTENT[event.eventType] ?? UNKNOWN_EVENT_CONTENT;
              const Icon = content.Icon;
              const isLatest = index === orderedEvents.length - 1;

              return (
                <li
                  key={event.id}
                  className={cn(
                    'relative flex gap-3 pb-5 last:pb-0',
                    !compact && 'gap-4',
                  )}
                >
                  {/* เส้นเชื่อมแสดงลำดับเหตุการณ์จากเก่าไปใหม่ */}
                  {!isLatest && (
                    <span
                      className={cn(
                        'absolute top-8 bottom-0 left-4 w-px bg-border',
                        !compact && 'left-5 top-10',
                      )}
                      aria-hidden="true"
                    />
                  )}

                  {/* ไอคอนของ Event */}
                  <div
                    className={cn(
                      'relative z-10 flex shrink-0 items-center justify-center rounded-full',
                      compact ? 'size-8' : 'size-10',
                      content.iconClassName,
                      isLatest && 'ring-2 ring-primary/20 ring-offset-2',
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </div>

                  {/* เนื้อหา Event */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-0.5">
                      <h3
                        className={cn(
                          'font-semibold text-foreground',
                          compact ? 'text-sm' : 'text-base',
                        )}
                      >
                        {content.title}
                      </h3>

                      <time
                        dateTime={event.createdAt}
                        className="text-xs text-muted-foreground"
                      >
                        {formatEventDate(event.createdAt)}
                      </time>
                    </div>

                    <p
                      className={cn(
                        'mt-1 leading-5 text-muted-foreground',
                        compact ? 'text-xs' : 'text-sm',
                      )}
                    >
                      {event.description ?? content.fallbackDescription}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          /* Empty State เมื่อยังไม่มีเหตุการณ์ */
          <div
            role="status"
            className="flex items-center gap-3 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground"
          >
            <Clock
              className="size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p>ยังไม่มีความคืบหน้าเพิ่มเติมสำหรับประกาศนี้</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
