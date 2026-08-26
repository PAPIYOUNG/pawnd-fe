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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* ส่วนเนื้อหาหลัก: Desktop วาง 4 กลุ่มในแถวเดียวเพื่อลดความสูงและน้ำหนักทางสายตาของ Footer */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-8 lg:grid-cols-4 lg:items-start lg:gap-8 xl:gap-12">
          {/* กลุ่มแบรนด์: ลดขนาดโลโก้และคำอธิบายให้เป็นข้อมูลรองของหน้า */}
          <section className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:gap-4 lg:text-left">
            <Link
              href="/"
              aria-label="กลับสู่หน้าแรก PAWND"
              className="shrink-0 transition-opacity hover:opacity-90"
            >
              <Image
                src="/logo.png"
                alt="โลโก้ PAWND"
                width={1376}
                height={1143}
                className="h-auto w-16 object-contain"
              />
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70 lg:mt-0 lg:max-w-52">
              ศูนย์กลางช่วยค้นหาสัตว์เลี้ยงหาย
              เพราะทุกชีวิตควรได้กลับบ้านอย่างปลอดภัย
            </p>
          </section>

          {/* กลุ่มเมนูลัด: ใช้ลิงก์ขนาดกระชับโดยไม่ห่อด้วยการ์ดขนาดใหญ่ */}
          <nav
            aria-label="เมนูลัดส่วนท้ายเว็บ"
            className="text-center lg:justify-self-center lg:text-left"
          >
            <h3 className="text-sm font-semibold tracking-wide text-white">
              สิทธิ์ลัด
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/70 lg:grid-cols-1">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link
                  href="/posts"
                  className="transition-colors hover:text-white"
                >
                  ประกาศทั้งหมด
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="transition-colors hover:text-white"
                >
                  ค้นหาบนแผนที่
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="transition-colors hover:text-white"
                >
                  รายงานชุมชน
                </Link>
              </li>
            </ul>
          </nav>

          {/* กลุ่มสนับสนุน: ลด QR ให้เป็นภาพประกอบและวางคู่ข้อความเพื่อคงความสูงแบบกระชับ */}
          <section className="flex flex-col items-center text-center lg:items-start lg:justify-self-center lg:text-left">
            <h3 className="text-sm font-semibold tracking-wide text-white">
              เลี้ยงชานมผู้พัฒนา
            </h3>
            <div className="mt-3 flex items-center gap-4">
              <div className="shrink-0 overflow-hidden rounded-xl bg-white p-1.5">
                <Image
                  src="/images/support-promptpay.png"
                  alt="QR Code PromptPay สำหรับสนับสนุนค่าชานมให้ผู้พัฒนา PAWND"
                  width={564}
                  height={564}
                  className="size-20 rounded-lg object-contain"
                />
              </div>
              <p className="max-w-36 text-sm leading-relaxed text-white/70">
                สแกน PromptPay เพื่อเติมพลังให้ทีม PAWND
              </p>
            </div>
          </section>

          {/* กลุ่มโซเชียล: เก็บไอคอนไว้ด้านขวาโดยใช้ Touch Target ที่กดได้สะดวก */}
          <section className="flex flex-col items-center text-center lg:items-start lg:justify-self-end lg:text-left">
            <h3 className="text-sm font-semibold tracking-wide text-white">
              ติดตามเราได้ที่
            </h3>
            <div className="mt-3 flex items-center justify-center gap-2 lg:justify-start">
              {/* Telegram */}
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-white/20"
              >
                <TelegramIcon className="size-4" />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-white/20"
              >
                <InstagramIcon className="size-4" />
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-white/20"
              >
                <FacebookIcon className="size-4" />
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-white/20"
              >
                <TwitterIcon className="size-4" />
              </a>
            </div>
          </section>
        </div>

        {/* แถบลิขสิทธิ์ด้านล่างสุด (Bottom Bar) */}
        <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-center text-xs text-white/50 sm:flex-row sm:text-left">
          <p>© 2026 Pawnd Thailand. All rights reserved.</p>
          <p className="flex items-center gap-1">
            สร้างขึ้นด้วยความรักต่อเพื่อนร่วมโลก 💚
          </p>
        </div>
      </div>
    </footer>
  );
}
