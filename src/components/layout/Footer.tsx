<<<<<<< HEAD
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#17643f] px-6 py-14 text-white/75">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Pawnd"
              width={42}
              height={42}
              className="rounded-xl"
            />
            <span className="text-2xl font-bold text-white">Pawnd</span>
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-6">
            ร่วมเดินทางเพื่อสังคมที่ผู้ช่วยบอกที่แสนอบอุ่น บริการด้วยใจ
            ร่วมพลังจากใจเพื่อคนรักสัตว์ไทยทุกคน
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-white">ลิงก์ด่วน</h2>
          <nav className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/" className="hover:text-white">
              หน้าแรก
            </Link>
            <Link href="/community" className="hover:text-white">
              กระดานชุมชน
            </Link>

            {/* เปิดเป็น Link เมื่อ route พร้อม */}
            <span aria-disabled="true">ประกาศทั้งหมด</span>
            <span aria-disabled="true">ค้นหาบนแผนที่</span>
          </nav>
        </div>

        <div>
          <h2 className="font-semibold text-white">ช่วยเหลือ</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <span>วิธีการแจ้งสัตว์หาย</span>
            <span>การตรวจหาสัตว์ด้วย AI</span>
            <span>นโยบายความเป็นส่วนตัว</span>
            <span>ติดต่อทีมงาน</span>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-white">ติดตามเราได้ที่</h2>

          <div className="mt-4 flex gap-3">
            {['f', '◎', '𝕏'].map((label) => (
              <span
                key={label}
                className="flex size-9 items-center justify-center rounded-full bg-white/15 font-semibold text-white"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-3 border-t border-white/15 pt-7 text-xs sm:flex-row sm:justify-between">
        <span>© 2026 Pawnd Thailand. All rights reserved.</span>
        <span>สร้างขึ้นด้วยความรักต่อเพื่อนร่วมโลก 🐾</span>
=======
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
 *   3. เมนูช่วยเหลือและเครื่องมือ (Help & Tools)
 *   4. ช่องทางโซเชียลมีเดีย (Telegram, Instagram, Facebook, Twitter/X)
 *   5. แถบลิขสิทธิ์และข้อความปิดท้ายด้านล่าง
 */
export default function Footer() {
  return (
    <footer className="w-full bg-[#133E2B] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* คอลัมน์ที่ 1: โลโก้แบรนด์และสโลแกน (กว้าง 2 คอลัมน์บน Desktop) */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="PAWND Logo"
                width={32}
                height={32}
                className="size-8 rounded-full brightness-0 invert"
              />
              <span className="text-2xl font-bold tracking-tight text-white">
                Pawnd
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/80">
              ศูนย์กลางการช่วยเหลือและค้นหาสัตว์เลี้ยงหายอันดับหนึ่งของไทย สัตว์ทุกตัวมีค่า ร่วมสร้างเครือข่ายสังคมเพื่อสัตว์เลี้ยงไปด้วยกัน
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
                <Link href="/posts" className="transition-colors hover:text-white">
                  ประกาศทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/map" className="transition-colors hover:text-white">
                  ค้นหาบนแผนที่
                </Link>
              </li>
              <li>
                <Link href="/community" className="transition-colors hover:text-white">
                  รายงานชุมชน
                </Link>
              </li>
            </ul>
          </div>

          {/* คอลัมน์ที่ 3: เมนูช่วยเหลือและแนะนำการใช้งาน (Help & Tools) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wider text-white">
              ช่วยเหลือ
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-white/75">
              <li>
                <Link href="/guide/lost-pet" className="transition-colors hover:text-white">
                  วิธีการแจ้งสัตว์หาย
                </Link>
              </li>
              <li>
                <Link href="/ai-matching" className="transition-colors hover:text-white">
                  ระบบตรวจหาด้วย AI
                </Link>
              </li>
              <li>
                <Link href="/stats" className="transition-colors hover:text-white">
                  สถิติการตามสัตว์หาย
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-white">
                  ติดต่อทีมงาน
                </Link>
              </li>
            </ul>
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
>>>>>>> dev
      </div>
    </footer>
  );
}
