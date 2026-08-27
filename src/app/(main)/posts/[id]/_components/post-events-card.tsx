import {
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Sparkles,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PostEvent, PostEventType } from '@/types/posts-event';

interface PostEventsCardProps {
  events: PostEvent[];
}

/** ข้อความและไอคอนที่แสดงสำหรับแต่ละ event type */
const EVENT_CONTENT: Record<
  PostEventType,
  {
    title: string;
    fallbackDescription: string;
    Icon: LucideIcon;
  }
> = {
  POST_CREATED: {
    title: 'สร้างประกาศแล้ว',
    fallbackDescription: 'ระบบบันทึกประกาศเข้าสู่ PAWND เรียบร้อยแล้ว',
    Icon: FileText,
  },
  AI_MATCHES_FOUND: {
    title: 'AI พบเคสที่อาจตรงกัน',
    fallbackDescription: 'ระบบกำลังวิเคราะห์ประกาศที่มีลักษณะใกล้เคียง',
    Icon: Sparkles,
  },
  AI_MATCH_CONFIRMED: {
    title: 'ยืนยันผลการจับคู่ AI',
    fallbackDescription: 'มีการยืนยันผลการจับคู่ของประกาศนี้',
    Icon: CheckCircle2,
  },
  REUNITED: {
    title: 'สัตว์เลี้ยงกลับบ้านแล้ว',
    fallbackDescription:
      'เจ้าของประกาศยืนยันว่าสัตว์เลี้ยงกลับบ้านอย่างปลอดภัย',
    Icon: Heart,
  },
  POST_CLOSED: {
    title: 'ปิดประกาศแล้ว',
    fallbackDescription: 'ประกาศนี้ถูกปิดการติดตามแล้ว',
    Icon: XCircle,
  },
};

/** ใช้รูปแบบวันที่ภาษาไทยในรายการ Timeline */
const eventDateFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/**
 * PostEventsCard (Server Component)
 * - แสดง Timeline แบบย่อของประกาศใน sidebar ด้านขวา
 * - ใช้ข้อมูลจริงจาก GET /posts/:id/events
 * - แสดงสามเหตุการณ์ล่าสุดเพื่อให้พอดีกับพื้นที่มุมขวาล่าง
 */
export function PostEventsCard({ events }: PostEventsCardProps) {
  // Backend เรียง event จากเก่าไปใหม่ จึงนำสามรายการท้ายสุดมาเรียงใหม่
  const recentEvents = [...events].slice(-3).reverse();

  return (
    <Card className="flex flex-col rounded-lg border-border/80 bg-card">
      {/* หัวข้อของกล่อง Timeline */}
      <CardHeader className="flex flex-row items-center justify-between gap-3 p-4 pb-3">
        <div>
          <CardTitle className="text-base">ความคืบหน้าประกาศ</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            เหตุการณ์ล่าสุดจากระบบ PAWND
          </p>
        </div>

        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {events.length} เหตุการณ์
        </span>
      </CardHeader>

      {/* รายการ Event ล่าสุด */}
      <CardContent className="p-4 pt-0">
        {recentEvents.length > 0 ? (
          <ol className="space-y-3">
            {recentEvents.map((event) => {
              const content = EVENT_CONTENT[event.eventType];
              const Icon = content.Icon;

              return (
                <li key={event.id} className="flex gap-3">
                  {/* ไอคอนของ Event */}
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>

                  {/* เนื้อหา Event */}
                  <div className="min-w-0 flex-1 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-sm font-semibold text-foreground">
                        {content.title}
                      </h3>

                      <time
                        dateTime={event.createdAt}
                        className="text-xs text-muted-foreground"
                      >
                        {eventDateFormatter.format(new Date(event.createdAt))}
                      </time>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {event.description ?? content.fallbackDescription}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          /* Empty State เมื่อยังไม่มีเหตุการณ์ */
          <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
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
