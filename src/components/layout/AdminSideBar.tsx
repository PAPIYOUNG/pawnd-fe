'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileWarning,
  LayoutGrid,
  PawPrint,
  Settings,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'จัดการผู้ใช้งาน', href: '/admin/users', icon: Users },
  { label: 'จัดการประกาศสัตว์หาย', href: '/admin/posts', icon: FileWarning },
  { label: 'จัดการสัตว์เลี้ยง', href: '/admin/pets', icon: PawPrint },
  { label: 'รายงานความไม่เหมาะสม', href: '/admin/reports', icon: FileWarning },
  { label: 'ตั้งค่าระบบ', href: '/admin/settings', icon: Settings },
] as const;

export default function AdminSideBar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col justify-between bg-primary p-4 text-primary-foreground">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 rounded-2xl bg-primary-foreground/10 px-3 py-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary-foreground/15">
            <LayoutGrid className="size-4" />
          </span>
          <span className="text-sm font-semibold">แดชบอร์ดภาพรวม</span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary-foreground/15 font-medium text-primary-foreground'
                    : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-0.5 px-3 text-xs text-primary-foreground/50">
        <span>เวอร์ชันล่าสุดปัจจุบัน 2.4.0</span>
        <span>© 2026 Pawnd Thailand</span>
      </div>
    </aside>
  );
}
