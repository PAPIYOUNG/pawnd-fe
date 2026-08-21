import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function HeroSection() {
  return (
    <section className="w-full bg-[#ECF5EE] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Heading, Description & Action Buttons */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#164E36] sm:text-4xl lg:text-5xl lg:leading-[1.2]">
              ช่วยสัตว์เลี้ยงกลับบ้านอย่างปลอดภัย
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[#2D5A47] sm:text-lg">
              แพลตฟอร์มศูนย์รวมการตามหาสัตว์เลี้ยงหายและช่วยสัตว์พลัดหลง พร้อมระบบค้นหาและจับคู่ภาพถ่ายด้วย AI อัจฉริยะ ช่วยให้การค้นหาและคืนสัตว์เลี้ยงของคุณมีโอกาสสำเร็จสูงสุด
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              {/* Primary CTA */}
              <Link
                href="/posts/create?type=LOST"
                className={cn(
                  buttonVariants({ variant: 'default', size: 'lg' }),
                  'rounded-2xl bg-primary px-6 py-6 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90'
                )}
              >
                <Plus className="size-5 stroke-[2.5]" />
                <span>แจ้งสัตว์เลี้ยงหาย</span>
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/posts"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-2xl border-2 border-primary/30 bg-white/80 px-6 py-6 text-base font-semibold text-primary shadow-2xs hover:bg-white hover:border-primary'
                )}
              >
                <Search className="size-4.5" />
                <span>ค้นหาสัตว์เลี้ยง</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Banner Image */}
          <div className="flex justify-center lg:col-span-5">
            <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-3xl bg-muted shadow-lg ring-4 ring-white/60">
              <Image
                src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=1000&auto=format&fit=crop"
                alt="สุนัขและแมวเพื่อนรักคู่ใจ"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
