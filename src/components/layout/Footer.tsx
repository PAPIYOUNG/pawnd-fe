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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* คอลัมน์ที่ 1: โลโก้แบรนด์และสโลแกน (กว้าง 2 คอลัมน์บน Desktop) */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link
              href="/"
              aria-label="กลับสู่หน้าแรก PAWND"
              className="w-fit transition-opacity hover:opacity-90"
            >
              <Image
                src="/logo.png"
                alt="โลโก้ PAWND"
                width={884}
                height={956}
                className="h-auto w-28 object-contain"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/80">
              ศูนย์กลางการช่วยเหลือและค้นหาสัตว์เลี้ยงหายอันดับหนึ่งของไทย
              สัตว์ทุกตัวมีค่า ร่วมสร้างเครือข่ายสังคมเพื่อสัตว์เลี้ยงไปด้วยกัน
            </p>
          </div>

          {/* คอลัมน์ที่ 2: ลิงก์เมนูลัด (Quick Links) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wider text-white">
              สิทธิ์ลัด
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-white/75">
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
          </div>

          {/* คอลัมน์ที่ 3: ช่องทางสนับสนุนค่าชานมให้ทีมพัฒนาผ่าน PromptPay */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wider text-white">
              สนับสนุนค่าชานมให้ผู้พัฒนา
            </h3>
            <p className="max-w-xs text-sm leading-relaxed text-white/75">
              ร่วมเติมพลังให้ทีมพัฒนา PAWND ด้วยค่าชานมสักแก้ว สแกน QR PromptPay
              ด้านล่างได้เลย
            </p>
            <div className="w-fit overflow-hidden rounded-2xl border border-white/15 bg-white p-2 shadow-sm">
              <Image
                src="/images/support-promptpay.jpg"
                alt="QR Code PromptPay สำหรับสนับสนุนค่าชานมให้ผู้พัฒนา PAWND"
                width={885}
                height={1200}
                className="h-auto w-40 rounded-xl object-contain sm:w-44"
              />
            </div>
          </div>

          {/* คอลัมน์ที่ 4: ช่องทางโซเชียลมีเดีย (Social Media Icons) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wider text-white">
              ติดตามเราได้ที่
            </h3>
            <div className="flex items-center gap-2.5">
              {/* Telegram */}
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="flex size-8.5 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-white/20"
              >
                <TelegramIcon className="size-4" />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex size-8.5 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-white/20"
              >
                <InstagramIcon className="size-4" />
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex size-8.5 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-white/20"
              >
                <FacebookIcon className="size-4" />
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="flex size-8.5 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-white/20"
              >
                <TwitterIcon className="size-4" />
              </a>
            </div>
          </div>
        </div>

        {/* แถบลิขสิทธิ์ด้านล่างสุด (Bottom Bar) */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row">
          <p>© 2026 Pawnd Thailand. All rights reserved.</p>
          <p className="flex items-center gap-1">
            สร้างขึ้นด้วยความรักต่อเพื่อนร่วมโลก 💚
          </p>
        </div>
      </div>
    </footer>
  );
}
