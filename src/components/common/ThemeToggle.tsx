'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

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
        {/* Sun Icon for Light Mode */}
        <Sun
          className={cn(
            'size-5 transition-all duration-300',
            resolvedTheme === 'dark'
              ? 'scale-0 rotate-90 opacity-0'
              : 'scale-100 rotate-0 opacity-100 text-amber-500'
          )}
        />
        {/* Moon Icon for Dark Mode */}
        <Moon
          className={cn(
            'absolute size-5 transition-all duration-300',
            resolvedTheme === 'dark'
              ? 'scale-100 rotate-0 opacity-100 text-emerald-400'
              : 'scale-0 -rotate-90 opacity-0'
          )}
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
