'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Plus,
  Menu as MenuIcon,
  X,
  LayoutDashboard,
  User,
  Heart,
  Settings,
  LogOut,
} from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { UserAvatar } from '@/components/common/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { SessionUser } from '@/types/auth';
import { logoutAction } from '@/lib/action/logout.actions';

/** รายการลิงก์เมนูนำทางหลักของเว็บไซต์ (Main Navigation Links) */
const NAV_LINKS = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/posts', label: 'ประกาศ' },
  { href: '/map', label: 'แผนที่' },
  { href: '/community', label: 'ชุมชน' },
  { href: '/chat', label: 'แชท' },
];

/** Response shape ของ GET /api/auth/session (built-in endpoint จาก NextAuth) */
interface AuthSessionResponse {
  user?: SessionUser;
  error?: string;
}

/**
 * Header Component (Client Component)
 * - แถบส่วนหัวด้านบนแบบ Sticky Navigation (ติดอยู่ด้านบนเสมอขณะเลื่อนหน้าจอ)
 * - ฝั่งซ้าย: โลโก้แบรนด์ Pawnd
 * - ตรงกลาง: ลิงก์เมนูนำทางหลักบน Desktop (แสดงสถานะ Active Link ตาม pathname)
 *   รวมปุ่ม "แอดมิน" เพิ่มต่อท้ายเฉพาะบัญชีที่ role เป็น ADMIN
 * - ฝั่งขวา: ปุ่มสลับธีม (ThemeToggle), กระดิ่งแจ้งเตือน (Notification),
 *   ดรอปดาวน์เมนู avatar (แดชบอร์ด/โปรไฟล์/ตั้งค่า/ออกจากระบบ) และปุ่ม "+ แจ้งสัตว์เลี้ยงหาย"
 * - รองรับ Mobile Drawer Menu และ Touch Target ขนาด >= 40x40px ตามมาตรฐาน Mobile-First
 * - สถานะ login เช็คจาก NextAuth session จริงฝั่ง client หลัง mount ผ่าน /api/auth/session
 *   ตั้งค่าเริ่มต้นเป็น guest ไว้ก่อนเสมอเพื่อความปลอดภัย (กันไม่ให้ guest เห็น UI ของคน login แว้บหนึ่ง)
 * - ลิงก์ "หน้าแรก" ชี้ไปที่ / เสมอ ไม่สลับไป /dashboard ตามสถานะ login อีกต่อไป
 *   (ย้ายไปเป็นเมนู "แดชบอร์ด" ในดรอปดาวน์ avatar แทน)
 * - ดรอปดาวน์ avatar เขียนด้วย React state + CSS ล้วนๆ (ไม่ใช้ Base UI Menu/Portal)
 */
export default function Header() {
  const pathname = usePathname();
  // State สำหรับเปิด/ปิดเมนู Drawer บนมือถือ
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // State ว่ามีการแจ้งเตือนที่ยังไม่อ่านไหม ดึงฝั่ง client หลัง mount
  const [hasUnread, setHasUnread] = useState(false);
  // State สถานะ login จริง + ข้อมูลผู้ใช้ ดึงฝั่ง client หลัง mount เช่นกัน
  const [authState, setAuthState] = useState<{
    isLoggedIn: boolean;
    user: SessionUser | null;
  }>({ isLoggedIn: false, user: null });
  const { isLoggedIn, user } = authState;
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    let active = true;

    fetch('/api/auth/session', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((session: AuthSessionResponse | null) => {
        if (!active) return;
        // logic เดียวกับที่ src/middleware.ts ใช้เช็ค route protection —
        // session ที่ refresh token หมดอายุยังมี user object อยู่ แต่ถือว่า logged out
        const loggedIn =
          !!session?.user && session.error !== 'RefreshAccessTokenError';
        setAuthState({
          isLoggedIn: loggedIn,
          user: loggedIn ? session!.user! : null,
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;

    fetch('/api/notifications/unread-count', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { unreadCount: 0 }))
      .then((data: { unreadCount?: number }) => {
        if (active) setHasUnread((data.unreadCount ?? 0) > 0);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  const userName = user ? `${user.firstName} ${user.lastName}` : 'ผู้ใช้งาน';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 1. โลโก้และชื่อแบรนด์ Pawnd ทางซ้าย */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
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
                    : 'text-muted-foreground',
                )}
              >
                {link.label}
              </Link>
            );
          })}

          {/* ปุ่มแอดมิน แสดงเฉพาะบัญชีที่ role เป็น ADMIN เท่านั้น */}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname.startsWith('/admin')
                  ? 'font-semibold text-primary'
                  : 'text-muted-foreground',
              )}
            >
              แอดมิน
            </Link>
          )}
        </nav>

        {/* 3. ส่วนเครื่องมือและข้อมูลผู้ใช้บน Desktop (ทางขวา) */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* ปุ่มสลับโหมดมืด / โหมดสว่าง (Dark / Light Theme Toggle) */}
          <ThemeToggle />

          {isLoggedIn ? (
            <>
              {/* ปุ่มกระดิ่งแจ้งเตือนพร้อมจุดสีแดง (Notification Bell) */}
              <Link
                href="/notifications"
                aria-label="การแจ้งเตือน"
                className="relative flex size-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground active:scale-95"
              >
                <Bell className="size-5" />
                {hasUnread && (
                  <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
                )}
              </Link>

              {/* ดรอปดาวน์เมนู Avatar: แดชบอร์ด / โปรไฟล์ผู้ใช้ / โปรไฟล์สัตว์เลี้ยง / ตั้งค่า / ออกจากระบบ */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`เมนูผู้ใช้งาน: ${userName}`}
                  className="relative size-10 min-h-[40px] min-w-[40px] overflow-hidden rounded-full ring-2 ring-border transition-transform hover:scale-105 active:scale-95"
                >
                  <UserAvatar
                    src={user?.avatarUrl}
                    alt={userName}
                    sizes="40px"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem href="/dashboard">
                    <LayoutDashboard className="size-4" />
                    แดชบอร์ด
                  </DropdownMenuItem>
                  <DropdownMenuItem href="/profile">
                    <User className="size-4" />
                    โปรไฟล์ผู้ใช้
                  </DropdownMenuItem>
                  <DropdownMenuItem href="/profile/pets">
                    <Heart className="size-4" />
                    โปรไฟล์สัตว์เลี้ยง
                  </DropdownMenuItem>
                  <DropdownMenuItem href="/profile/settings">
                    <Settings className="size-4" />
                    ตั้งค่าระบบ
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      void logoutAction();
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ปุ่ม CTA: แจ้งสัตว์เลี้ยงหาย */}
              <Link
                href="/posts/create?type=LOST"
                className={cn(
                  buttonVariants({ variant: 'default', size: 'default' }),
                  'h-10 min-h-[40px] rounded-2xl gap-1.5 px-4 font-medium shadow-xs',
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
                  'h-10 min-h-[40px] rounded-xl px-4',
                )}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: 'default', size: 'sm' }),
                  'h-10 min-h-[40px] rounded-xl px-4',
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
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* 5. เมนู Drawer สำหรับหน้าจอมือถือ (เปิดขึ้นเมื่อกดปุ่ม Hamburger) */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-4 sm:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex min-h-[40px] items-center rounded-xl px-3 text-sm font-medium transition-colors hover:bg-muted',
                    isActive
                      ? 'bg-muted text-primary font-semibold'
                      : 'text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* ปุ่มแอดมินบนมือถือ แสดงเฉพาะบัญชีที่ role เป็น ADMIN เท่านั้น */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex min-h-[40px] items-center rounded-xl px-3 text-sm font-medium transition-colors hover:bg-muted',
                  pathname.startsWith('/admin')
                    ? 'bg-muted text-primary font-semibold'
                    : 'text-foreground',
                )}
              >
                แอดมิน
              </Link>
            )}

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
                  'h-11 w-full rounded-2xl gap-1.5 font-medium',
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
