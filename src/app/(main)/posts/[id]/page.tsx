import { auth } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError } from '@/lib/api/api-error';
import { getPostById } from '@/services/post.service';
import { getPostEvents } from '@/services/post-event.service';
import { CalendarDays, MapPin, PawPrint, UserRound } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import type { PostEvent } from '@/types/posts-event';
import { ContactChatButton } from './_components/contact-chat-button';
import { PostEventsCard } from './_components/post-events-card';

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

const dateFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'long',
  timeStyle: 'short',
});

/**
 * หน้า public post detail และจุดเริ่มต้นของ In-app Chat
 * ดึงข้อมูล Timeline จาก Backend แยกจากข้อมูลประกาศ เพื่อให้ส่วนความคืบหน้า
 * แสดงสถานะว่างหรือข้อผิดพลาดได้โดยไม่ทำให้รายละเอียดประกาศทั้งหน้าหายไป
 */
export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  // เริ่มอ่าน session และ post พร้อมกันเพื่อลดเวลารอของหน้า detail
  const [session, post] = await Promise.all([auth(), getPostById(id)]);

  if (!post) notFound();

  // แยก error ของ Timeline ออกจาก post detail เพื่อให้ผู้ใช้ยังอ่านข้อมูลประกาศได้
  let events: PostEvent[] = [];
  let eventsError: string | null = null;
  try {
    events = await getPostEvents(id);
  } catch (error) {
    // 404/500 จาก endpoint นี้ไม่ควรเปิดเผยรายละเอียดระบบแก่ผู้ใช้
    eventsError =
      error instanceof ApiError && error.statusCode === 404
        ? 'ไม่พบข้อมูลความคืบหน้าของประกาศนี้'
        : 'ไม่สามารถโหลดความคืบหน้าของประกาศได้ในขณะนี้';
  }

  const primaryImage =
    post.images?.[0]?.imageUrl || post.pet?.profileImageUrl || undefined;
  const location = [post.subdistrict, post.district, post.province]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        {/* ภาพประกาศและรายละเอียดหลัก */}
        <section className="space-y-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={post.petName ?? 'รูปสัตว์เลี้ยงในประกาศ'}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <PawPrint className="size-16" aria-hidden="true" />
              </div>
            )}
          </div>

          <Card className="rounded-3xl">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={post.type === 'LOST' ? 'destructive' : 'default'}
                >
                  {post.type === 'LOST' ? 'ตามหา' : 'พบเห็น'}
                </Badge>
                <Badge variant="outline">{post.status}</Badge>
              </div>
              <CardTitle className="text-2xl">
                {post.petName ?? 'ไม่ระบุชื่อสัตว์เลี้ยง'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="leading-7 text-foreground/85">
                {post.description ?? 'เจ้าของประกาศยังไม่ได้เพิ่มรายละเอียด'}
              </p>
              {post.distinctiveFeatures && (
                <div>
                  <h2 className="font-semibold">ลักษณะเด่น</h2>
                  <p className="mt-1 text-muted-foreground">
                    {post.distinctiveFeatures}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ข้อมูลสรุปและปุ่มติดต่อ */}
        <aside className="space-y-4">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลประกาศ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <PawPrint className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-semibold">
                    {post.petType} {post.breed ? `· ${post.breed}` : ''}
                  </p>
                  <p className="text-muted-foreground">
                    {[post.gender, post.color].filter(Boolean).join(' · ') ||
                      'ไม่ระบุเพศและสี'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-semibold">
                    {location || 'ไม่ระบุพื้นที่'}
                  </p>
                  {post.locationDescription && (
                    <p className="text-muted-foreground">
                      {post.locationDescription}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-semibold">วันที่เกิดเหตุ</p>
                  <p className="text-muted-foreground">
                    {post.eventDate
                      ? dateFormatter.format(new Date(post.eventDate))
                      : 'ไม่ระบุวันที่'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <UserRound className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-semibold">ผู้ลงประกาศ</p>
                  <p className="text-muted-foreground">
                    {post.user
                      ? `${post.user.firstName} ${post.user.lastName}`
                      : 'ไม่ระบุชื่อผู้ลงประกาศ'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-primary/30 bg-primary/5">
            <CardContent className="space-y-3 pt-6">
              <div>
                <h2 className="font-semibold">
                  มีข้อมูลหรือพบเห็นสัตว์ตัวนี้?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  ติดต่อเจ้าของประกาศผ่านแชทภายใน PAWND
                </p>
              </div>
              <ContactChatButton
                postId={post.id}
                postStatus={post.status}
                ownerId={post.userId}
                currentUserId={session?.user?.id ?? null}
              />
            </CardContent>
            {/* กล่อง Timeline จาก GET /posts/:id/events */}
            <PostEventsCard events={events} errorMessage={eventsError} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
