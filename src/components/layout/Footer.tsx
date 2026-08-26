import Link from 'next/link';
import Image from 'next/image';

import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  TwitterIcon,
} from '@/components/auth/BrandIcons';

/**
 * Footer Component
 * - ส่วนท้ายของเว็บไซต์ (Global Footer) ธีมเขียวเข้มของ PAWND (#133E2B)
 * - ประกอบด้วย 4 ส่วนหลัก:
 *   1. โลโก้แบรนด์ และคำแถลงพันธกิจของแพลตฟอร์ม
 *   2. ลิงก์สิทธิ์ลัด (Quick Links)
 *   3. ส่วนสนับสนุนค่าชานมพร้อม QR PromptPay
 *   4. ช่องทางโซเชียลมีเดีย (Telegram, Instagram, Facebook, Twitter/X)
 * - แถบลิขสิทธิ์และข้อความปิดท้ายอยู่ด้านล่างสุด
 */
export default function Footer() {
  return (
    <footer className="w-full bg-[#133E2B] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        {/* ส่วนแบรนด์ด้านบน: วางโลโก้และพันธกิจกึ่งกลางเพื่อสร้างแกนสมมาตรของ Footer */}
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Link
            href="/"
            aria-label="กลับสู่หน้าแรก PAWND"
            className="transition-opacity hover:opacity-90"
          >
            <Image
              src="/logo.png"
              alt="โลโก้ PAWND"
              width={1376}
              height={1143}
              className="h-auto w-32 object-contain sm:w-36"
            />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
            ศูนย์กลางการช่วยเหลือและค้นหาสัตว์เลี้ยงหายของไทย
            เพราะสัตว์ทุกตัวมีค่า และควรได้กลับบ้านอย่างปลอดภัย
          </p>
        </div>

        {/* ส่วนเนื้อหาหลัก: แบ่ง 3 คอลัมน์เท่ากันบน Desktop และเรียงแนวตั้งบน Mobile */}
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {/* การ์ดเมนูลัด: จัดลิงก์เป็นตารางเพื่อให้น้ำหนักภาพสมดุลกับอีกสองการ์ด */}
          <section className="flex h-full flex-col justify-center rounded-3xl border border-white/10 bg-white/5 p-6 text-center md:min-h-72">
            <h3 className="text-base font-semibold tracking-wide text-white">
              สิทธิ์ลัด
            </h3>
            <ul className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/75">
              <li>
                <Link
                  href="/"
                  className="block rounded-xl bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10 hover:text-white"
                >
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link
                  href="/posts"
                  className="block rounded-xl bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10 hover:text-white"
                >
                  ประกาศทั้งหมด
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="block rounded-xl bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10 hover:text-white"
                >
                  ค้นหาบนแผนที่
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="block rounded-xl bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10 hover:text-white"
                >
                  รายงานชุมชน
                </Link>
              </li>
            </ul>
          </section>

          {/* การ์ดสนับสนุน: วางเป็นแกนกลางของ Desktop และแสดง QR ในขนาดที่สแกนได้ชัดเจน */}
          <section className="flex h-full flex-col items-center justify-center rounded-3xl border border-white/15 bg-white/10 p-6 text-center md:min-h-72">
            <h3 className="text-base font-semibold tracking-wide text-white">
              สนับสนุนค่าชานมให้ผู้พัฒนา
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              สแกน QR PromptPay เพื่อเติมพลังให้ทีม PAWND
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
              <Image
                src="/images/support-promptpay.png"
                alt="QR Code PromptPay สำหรับสนับสนุนค่าชานมให้ผู้พัฒนา PAWND"
                width={564}
                height={564}
                className="size-36 rounded-xl object-contain sm:size-40"
              />
            </div>
          </section>

          {/* การ์ดโซเชียล: จัดไอคอนกึ่งกลางและใช้ขนาด Touch Target ที่กดได้สะดวก */}
          <section className="flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 text-center md:min-h-72">
            <h3 className="text-base font-semibold tracking-wide text-white">
              ติดตามเราได้ที่
            </h3>
            <p className="mt-2 text-sm text-white/70">
              ร่วมติดตามข่าวสารและเรื่องราวจากชุมชน
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {/* Telegram */}
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-white/20"
              >
                <TelegramIcon className="size-5" />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-white/20"
              >
                <InstagramIcon className="size-5" />
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-white/20"
              >
                <FacebookIcon className="size-5" />
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-white/20"
              >
                <TwitterIcon className="size-5" />
              </a>
            </div>
          </section>
        </div>

        {/* แถบลิขสิทธิ์ด้านล่างสุด (Bottom Bar) */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-xs text-white/60 sm:flex-row sm:text-left">
          <p>© 2026 Pawnd Thailand. All rights reserved.</p>
          <p className="flex items-center gap-1">
            สร้างขึ้นด้วยความรักต่อเพื่อนร่วมโลก 💚
          </p>
        </div>
      </div>
    </footer>
  );
}
