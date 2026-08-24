'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * ThemeToggle Component (Client Component)
 * - ปุ่มสลับโหมดมืด/โหมดสว่าง (Dark Mode / Light Mode)
 * - ใช้ CSS-driven Transitions (dark:* classes) ป้องกันปัญหา Hydration Mismatch ระหว่าง Server และ Client
 * - Touch target ขนาดอย่างน้อย 40x40px ตามมาตรฐาน Accessibility ของโปรเจกต์
 */
export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="สลับโหมดมืด/สว่าง"
      className={cn(
        'relative flex size-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-foreground/80 transition-all hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95',
        showLabel && 'w-auto px-3 gap-2 rounded-xl',
        className
      )}
    >
      <div className="relative flex size-5 items-center justify-center">
        {/* Sun Icon for Light Mode (CSS-driven เพื่อป้องกัน Server/Client Hydration Mismatch) */}
        <Sun
          className="size-5 transition-all duration-300 text-amber-500 scale-100 rotate-0 opacity-100 dark:scale-0 dark:rotate-90 dark:opacity-0"
        />
        {/* Moon Icon for Dark Mode (CSS-driven เพื่อป้องกัน Server/Client Hydration Mismatch) */}
        <Moon
          className="absolute size-5 transition-all duration-300 text-emerald-400 scale-0 -rotate-90 opacity-0 dark:scale-100 dark:rotate-0 dark:opacity-100"
        />
      </div>

      {showLabel && (
        <span className="text-sm font-medium">
          {resolvedTheme === 'dark' ? 'โหมดมืด (Dark)' : 'โหมดสว่าง (Light)'}
        </span>
      )}
    </button>
  );
}
