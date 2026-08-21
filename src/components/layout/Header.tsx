'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Plus, Menu, X } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  userAvatar?: string;
}

const NAV_LINKS = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/posts', label: 'ประกาศ' },
  { href: '/map', label: 'แผนที่' },
  { href: '/community', label: 'ชุมชน' },
  { href: '/chat', label: 'แชท' },
];

export default function Header({
  isLoggedIn = true,
  userName = 'ผู้ใช้งาน',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
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

        {/* Center: Desktop Navigation Links */}
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

        {/* Right: Actions & User Session */}
        <div className="hidden sm:flex items-center gap-3.5">
          {isLoggedIn ? (
            <>
              {/* Notification Bell */}
              <button
                type="button"
                aria-label="การแจ้งเตือน"
                className="relative flex size-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Bell className="size-4.5" />
                <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
              </button>

              {/* User Profile Avatar */}
              <Link
                href="/profile"
                className="relative size-9 overflow-hidden rounded-full ring-2 ring-border transition-transform hover:scale-105"
                title={userName}
              >
                <Image
                  src={userAvatar}
                  alt={userName}
                  fill
                  className="object-cover"
                />
              </Link>

              {/* + แจ้งสัตว์เลี้ยงหาย CTA */}
              <Link
                href="/posts/create?type=LOST"
                className={cn(
                  buttonVariants({ variant: 'default', size: 'default' }),
                  'rounded-2xl gap-1.5 px-4 font-medium shadow-xs'
                )}
              >
                <Plus className="size-4 stroke-[2.5]" />
                <span>แจ้งสัตว์เลี้ยงหาย</span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'rounded-xl'
                )}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: 'default', size: 'sm' }),
                  'rounded-xl'
                )}
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="เปิดเมนู"
            className="flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-4 sm:hidden">
          <nav className="flex flex-col gap-2.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                  pathname === link.href ? 'bg-muted text-primary font-semibold' : 'text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-border pt-3">
              <Link
                href="/posts/create?type=LOST"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'w-full rounded-2xl gap-1.5'
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
