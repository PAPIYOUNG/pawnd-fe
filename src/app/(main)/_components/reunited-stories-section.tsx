import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { ReunitedStory } from '@/types/home';

interface ReunitedStoriesSectionProps {
  stories: ReunitedStory[];
}

/**
 * ReunitedStoriesSection Component
 * - ส่วนแสดงเรื่องราวความสำเร็จในการช่วยเหลือและพาสัตว์เลี้ยงกลับบ้าน (Reunited Success Stories)
 * - แสดงภาพถ่ายจริงของสัตว์เลี้ยงคู่กับเจ้าของ พร้อมข้อความรีวิว/ความประทับใจ
 * - รองรับ Dark Mode และ Responsive Grid (1 คอลัมน์บนมือถือ, 3 คอลัมน์บนจอแท็บเล็ต/เดสก์ท็อป)
 */
export function ReunitedStoriesSection({
  stories,
}: ReunitedStoriesSectionProps) {
  // หากยังไม่มีเรื่องราวความสำเร็จในระบบ ให้ซ่อน Section นี้ ไม่แสดงข้อมูลจำลอง
  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#ECF5EE] py-12 transition-colors duration-300 sm:py-16 dark:bg-[#071E14]/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* หัวข้อประจำ Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#164E36] sm:text-3xl dark:text-[#6EE7B7]">
            เรื่องราวความสำเร็จพากลับบ้าน
          </h2>
          <p className="mt-2 text-sm text-[#2D5A47] sm:text-base dark:text-[#D1FAE5]/80">
            ความหวังมีเสมอ
            เสียงขอบคุณจากครอบครัวที่ได้สัตว์เลี้ยงสุดที่รักกลับมาสู่อ้อมกอด
          </p>
        </div>

        {/* Stories Grid: วนลูปแสดงการ์ดความสำเร็จ 3 รายการ */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {stories.map((story) => (
            <Card
              key={story.id}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-white/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-border/60 dark:bg-card"
            >
              <div>
                {/* ภาพถ่ายคู่ระหว่างเจ้าของและสัตว์เลี้ยง */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={story.coverImageUrl}
                    alt={`${story.petName} และ ${story.ownerName}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>

                {/* รายละเอียดเรื่องราว: ชื่อสัตว์เลี้ยง, ชื่อเจ้าของ และข้อความคำบอกเล่า */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-foreground">
                    {story.petName} และ {story.ownerName}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* ลิงก์สำหรับกดเข้าไปอ่านเรื่องราวฉบับเต็ม */}
              <div className="p-5 pt-0">
                <Link
                  href={story.detailUrl || `/posts/${story.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline"
                >
                  <span>อ่านเรื่องราวของ {story.ownerName} เพิ่มเติม</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
