'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  MessageCircle,
  FileText,
  Sparkles,
  Settings,
  Zap,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { UserProfile } from '@/types/user';

interface PostSidebarProps {
  user?: UserProfile;
}

/**
 * รายการเมนูหลักใน Sidebar หน้าสร้างประกาศและพอร์ทัล
 * ตรงตามดีไซน์ในภาพตัวอย่าง:
 * 1. แดชบอร์ด
 * 2. แจ้งสัตว์เลี้ยงหาย (Active)
 * 3. ข้อความแชท
 * 4. ประกาศของฉัน
 * 5. สถิติและการจับคู่ AI
 * 6. ตั้งค่าโปรไฟล์
 */
const POST_PORTAL_NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'แดชบอร์ด',
    icon: LayoutDashboard,
  },
  {
    href: '/posts/create',
    label: 'แจ้งสัตว์เลี้ยงหาย',
    icon: PlusCircle,
  },
  {
    href: '/chat',
    label: 'ข้อความแชท',
    icon: MessageCircle,
  },
  {
    href: '/profile',
    label: 'ประกาศของฉัน',
    icon: FileText,
  },
  {
    href: '/matches',
    label: 'สถิติและการจับคู่ AI',
    icon: Sparkles,
  },
  {
    href: '/profile/settings',
    label: 'ตั้งค่าโปรไฟล์',
    icon: Settings,
  },
];

/**
 * PostSidebar Component (Client Component)
 * - แถบเมนูด้านข้างสำหรับหน้าสร้างประกาศและพอร์ทัลจัดการ (Post Portal Sidebar)
 * - มีข้อมูลผู้ใช้ ("สุดาพร ใจดี • สมาชิกทั่วไป")
 * - รายการเมนู 6 รายการ พร้อมการเน้นสถานะ Active
 * - แบนเนอร์สีม่วงระบบจับคู่ด้วยภาพถ่าย AI (AI Image Matching Hint Box)
 * - รองรับ Responsive: Drawer บนมือถือ และ Sidebar ย่อ-ขยายได้บนคอมพิวเตอร์
 */
export function PostSidebar({ user }: PostSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // State ย่อ-ขยาย Sidebar บนหน้าจอคอมพิวเตอร์
  const [isExpanded, setIsExpanded] = useState(true);

  // State เปิด-ปิด Drawer บนหน้าจอมือถือ
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const userName = user ? `คุณ${user.firstName} ${user.lastName}` : 'สุดาพร ใจดี';
  const userRole = user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'สมาชิกทั่วไป';
  const avatarUrl =
    user?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop';

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. ปุ่มเปิดเมนู Drawer บน Mobile (< md) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-border/70 bg-card/90 px-4 py-2.5 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="relative size-8.5 overflow-hidden rounded-full ring-2 ring-primary/30">
            <Image src={avatarUrl} alt={userName} fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground line-clamp-1">{userName}</span>
            <span className="text-[10px] text-muted-foreground">{userRole}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex size-9 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:bg-muted"
          aria-label="เปิดเมนูข้าง"
        >
          <Menu className="size-4.5" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. Mobile Drawer สไลด์ออกบนหน้าจอมือถือ */}
      {/* ========================================================================= */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div
            className="relative flex h-full w-[280px] max-w-[80vw] flex-col border-r border-border bg-card p-5 shadow-2xl animate-in slide-in-from-left duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ปุ่มปิด Drawer */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="size-5" />
            </button>

            {/* ข้อมูลโปรไฟล์ผู้ใช้ */}
            <div className="flex items-center gap-3 border-b border-border/60 pb-4 pt-2">
              <div className="relative size-12 overflow-hidden rounded-full ring-2 ring-primary/30">
                <Image src={avatarUrl} alt={userName} fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{userName}</span>
                <span className="text-xs text-muted-foreground">{userRole}</span>
              </div>
            </div>

            {/* เมนูนำทาง */}
            <nav className="mt-4 flex flex-1 flex-col gap-1.5 overflow-y-auto">
              {POST_PORTAL_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/posts/create'
                    ? pathname === '/posts/create'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/15 font-semibold text-primary'
                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    )}
                  >
                    <Icon className="size-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* แบนเนอร์สีม่วงระบบจับคู่ด้วยภาพถ่าย AI ใน Drawer */}
            <div className="mt-auto rounded-2xl bg-purple-500/10 p-3.5 border border-purple-500/20 text-purple-950 dark:text-purple-200">
              <div className="flex items-center gap-1.5 font-bold text-xs text-purple-700 dark:text-purple-300">
                <Zap className="size-3.5 fill-current" />
                <span>ระบบจับคู่ด้วยภาพถ่าย AI</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                อัปโหลดรูปภาพที่ชัดเจนเพื่อช่วยให้ AI ตรวจจับลักษณะใบหน้า ลายทาง และสีขนได้แม่นยำถึง 94%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Sidebar ด้านซ้ายเต็มรูปแบบบน Desktop (>= md) */}
      {/* ========================================================================= */}
      <aside
        className={cn(
          'relative hidden md:flex min-h-[calc(100vh-4rem)] flex-col border-r border-border/70 bg-card/60 transition-all duration-300 ease-in-out dark:bg-card/40 backdrop-blur-xs',
          isExpanded ? 'w-64 sm:w-72 p-5' : 'w-20 p-3 items-center'
        )}
        aria-label="เมนูข้างระบบประกาศ"
      >
        {/* ปุ่ม Toggle ย่อ-ขยาย Sidebar */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="absolute -right-3.5 top-7 z-20 flex size-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-transform hover:scale-110 hover:text-foreground"
          aria-label={isExpanded ? 'ย่อเมนู' : 'ขยายเมนู'}
        >
          {isExpanded ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        {/* ข้อมูลโปรไฟล์ผู้ใช้ด้านบน */}
        <div
          className={cn(
            'flex items-center border-b border-border/60 pb-5 transition-all',
            isExpanded ? 'gap-3' : 'justify-center pb-4'
          )}
        >
          <div
            className={cn(
              'relative shrink-0 overflow-hidden rounded-full ring-2 ring-primary/30 transition-all',
              isExpanded ? 'size-12' : 'size-10'
            )}
          >
            <Image src={avatarUrl} alt={userName} fill className="object-cover" priority />
          </div>

          {isExpanded && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground line-clamp-1">{userName}</span>
              <span className="text-xs text-muted-foreground">{userRole}</span>
            </div>
          )}
        </div>

        {/* รายการเมนู 6 รายการ */}
        <nav className="mt-5 flex flex-1 flex-col gap-1.5">
          {POST_PORTAL_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/posts/create'
                ? pathname === '/posts/create'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-2xl transition-all duration-200',
                  isExpanded ? 'gap-3 px-4 py-3 text-sm font-medium' : 'justify-center p-3',
                  isActive
                    ? 'bg-emerald-500/15 font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'shrink-0 transition-transform group-hover:scale-110',
                    isExpanded ? 'size-5' : 'size-5.5',
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {isExpanded && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* แบนเนอร์สีม่วงระบบจับคู่ด้วยภาพถ่าย AI ด้านล่าง (แสดงเมื่อขยาย) */}
        {isExpanded ? (
          <div className="mt-auto rounded-3xl bg-purple-500/10 p-4 border border-purple-500/20 text-purple-950 dark:text-purple-200">
            <div className="flex items-center gap-1.5 font-bold text-xs text-purple-700 dark:text-purple-300">
              <Zap className="size-4 fill-current text-purple-600" />
              <span>ระบบจับคู่ด้วยภาพถ่าย AI</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              อัปโหลดรูปภาพที่ชัดเจนเพื่อช่วยให้ AI ตรวจจับลักษณะใบหน้า ลายทาง และสีขนของน้องได้อย่างแม่นยำยิ่งขึ้นถึง 94%
            </p>
          </div>
        ) : (
          <div
            className="mt-auto flex size-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-500/20"
            title="ระบบจับคู่ด้วยภาพถ่าย AI (แม่นยำ 94%)"
          >
            <Zap className="size-5 fill-current" />
          </div>
        )}
      </aside>
    </>
  );
}
