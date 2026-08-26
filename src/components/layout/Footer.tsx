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
      </div>
    </footer>
  );
}
