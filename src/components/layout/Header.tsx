'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';

const availableLinks = [
  { label: 'หน้าแรก', href: '/' },
  { label: 'ชุมชน', href: '/community' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 grid h-14 grid-cols-3 items-center bg-background px-4 shadow-sm">
      {/* sticky ให้ header มันอยู่กับที่ ,inset =top:0,right:0,left:0,b:0 */}
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Pawnd"
            width={38}
            height={38}
            className="rounded-xl"
          />
          <span className="text-xl font-bold text-primary">Pawnd</span>
        </Link>

        <nav className="mx-auto hidden items-center gap-8 md:flex">
          {availableLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? 'font-semibold text-primary'
                  : 'font-medium text-foreground hover:text-primary'
              }
            >
              {item.label}
            </Link>
          ))}

          <span className="font-medium text-muted-foreground">
            แผนที่สัตว์เลี้ยง
          </span>
          <span className="font-medium text-muted-foreground">
            ประกาศทั้งหมด
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/login?returnTo=/community"
            aria-label="การแจ้งเตือน"
            className="flex size-10 items-center justify-center rounded-full border"
          >
            <Bell className="size-5" />
          </Link>

          <Link
            href="/login"
            className="hidden h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground sm:flex"
          >
            <Plus className="size-5" />
            แจ้งสัตว์เลี้ยงหาย
          </Link>
        </div>
      </div>
    </header>
  );
}
