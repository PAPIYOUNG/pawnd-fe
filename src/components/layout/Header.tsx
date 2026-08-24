'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Plus, Menu, X } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { cn } from '@/lib/utils';

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  userAvatar?: string;
}

/**
 * รายการลิงก์เมนูนำทางหลักของเว็บไซต์ (Main Navigation Links)
 */
const NAV_LINKS = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/posts', label: 'ประกาศ' },
  { href: '/map', label: 'แผนที่' },
  { href: '/community', label: 'ชุมชน' },
  { href: '/chat', label: 'แชท' },
];

/**
 * Header Component (Client Component)
 * - แถบส่วนหัวด้านบนแบบ Sticky Navigation (ติดอยู่ด้านบนเสมอขณะเลื่อนหน้าจอ)
 * - ฝั่งซ้าย: โลโก้แบรนด์ Pawnd
 * - ตรงกลาง: ลิงก์เมนูนำทางหลักบน Desktop (แสดงสถานะ Active Link ตาม pathname)
 * - ฝั่งขวา: ปุ่มสลับธีม (ThemeToggle), กระดิ่งแจ้งเตือน (Notification), รูปโปรไฟล์ผู้ใช้ และปุ่ม "+ แจ้งสัตว์เลี้ยงหาย"
 * - รองรับ Mobile Drawer Menu และ Touch Target ขนาด >= 40x40px ตามมาตรฐาน Mobile-First
 */
export default function Header({
  isLoggedIn = true,
  userName = 'ผู้ใช้งาน',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
}: HeaderProps) {
  const pathname = usePathname();
  // State สำหรับเปิด/ปิดเมนู Drawer บนมือถือ
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 1. โลโก้และชื่อแบรนด์ Pawnd ทางซ้าย */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <Image
            src="/logo.png"
            alt="PAWND Logo"
            width={34}
            height={34}
            className="size-8.5 rounded-full object-contain"
          />
          <span className="text-xl font-bold tracking-tight text-primary">
            Pawnd
          </span>
        </Link>

        {/* 2. เมนูนำทางบนหน้าจอ Desktop (กึ่งกลาง) */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive
                    ? 'font-semibold text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* 3. ส่วนเครื่องมือและข้อมูลผู้ใช้บน Desktop (ทางขวา) */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* ปุ่มสลับโหมดมืด / โหมดสว่าง (Dark / Light Theme Toggle) */}
          <ThemeToggle />

          {isLoggedIn ? (
            <>
              {/* ปุ่มกระดิ่งแจ้งเตือนพร้อมจุดสีแดง (Notification Bell) */}
              <button
                type="button"
                aria-label="การแจ้งเตือน"
                className="relative flex size-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground active:scale-95"
              >
                <Bell className="size-5" />
                <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
              </button>

              {/* รูปโปรไฟล์ Avatar ของผู้ใช้งาน (คลิกเพื่อเข้าสู่ระบบโปรไฟล์และจัดการสัตว์เลี้ยง) */}
              <Link
                href="/profile/pets"
                className="relative size-10 min-h-[40px] min-w-[40px] overflow-hidden rounded-full ring-2 ring-border transition-transform hover:scale-105 active:scale-95"
                title={`${userName} (โปรไฟล์สัตว์เลี้ยง)`}
              >
                <Image
                  src={userAvatar}
                  alt={userName}
                  fill
                  className="object-cover"
                />
              </Link>

              {/* ปุ่ม CTA: แจ้งสัตว์เลี้ยงหาย */}
              <Link
                href="/posts/create?type=LOST"
                className={cn(
                  buttonVariants({ variant: 'default', size: 'default' }),
                  'h-10 min-h-[40px] rounded-2xl gap-1.5 px-4 font-medium shadow-xs'
                )}
              >
                <Plus className="size-4 stroke-[2.5]" />
                <span>แจ้งสัตว์เลี้ยงหาย</span>
              </Link>
            </>
          ) : (
            /* กรณี Guest ยังไม่ได้เข้าสู่ระบบ */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'h-10 min-h-[40px] rounded-xl px-4'
                )}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: 'default', size: 'sm' }),
                  'h-10 min-h-[40px] rounded-xl px-4'
                )}
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>

        {/* 4. แถบเครื่องมือบนมือถือ (ปุ่มสลับธีม + ปุ่มเปิดเมนู Hamburger) */}
        <div className="flex sm:hidden items-center gap-1.5">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="เปิดเมนูนำทาง"
            className="flex size-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-foreground hover:bg-muted active:scale-95"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* 5. เมนู Drawer สำหรับหน้าจอมือถือ (เปิดขึ้นเมื่อกดปุ่ม Hamburger) */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-4 sm:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex min-h-[40px] items-center rounded-xl px-3 text-sm font-medium transition-colors hover:bg-muted',
                  pathname === link.href ? 'bg-muted text-primary font-semibold' : 'text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* แถวสลับธีมบนมือถือ */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-medium text-muted-foreground">
                ธีมการแสดงผล
              </span>
              <ThemeToggle showLabel={true} />
            </div>

            {/* ปุ่ม CTA แจ้งสัตว์หายบนมือถือ */}
            <div className="pt-2">
              <Link
                href="/posts/create?type=LOST"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'h-11 w-full rounded-2xl gap-1.5 font-medium'
                )}
              >
                <Plus className="size-4 stroke-[2.5]" />
                <span>แจ้งสัตว์เลี้ยงหาย</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
