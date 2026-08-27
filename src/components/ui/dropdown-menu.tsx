'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
  null,
);

function useDropdownMenuContext() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenu.* ต้องอยู่ภายใน <DropdownMenu> เท่านั้น');
  }
  return context;
}

/**
 * DropdownMenu Root — เก็บสถานะเปิด/ปิดด้วย useState ธรรมดา ไม่ใช้ Portal/Floating UI
 * ปิดเมนูอัตโนมัติเมื่อคลิกนอกกรอบ หรือกด Escape
 */
function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = useDropdownMenuContext();

  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { open } = useDropdownMenuContext();

  if (!open) return null;

  return (
    <div
      role="menu"
      data-slot="dropdown-menu-content"
      className={cn(
        'absolute top-full right-0 z-50 mt-2 min-w-56 rounded-2xl border border-border/80 bg-card p-1.5 shadow-lg',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps extends HTMLAttributes<HTMLDivElement> {
  /** ถ้าใส่ href จะ render เป็น next/link แทน div ธรรมดา สำหรับรายการที่เป็นลิงก์นำทาง */
  href?: string;
}

function DropdownMenuItem({
  className,
  href,
  onClick,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenuContext();
  const itemClassName = cn(
    'flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted',
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        role="menuitem"
        className={itemClassName}
        onClick={() => setOpen(false)}
      >
        {children}
      </Link>
    );
  }

  return (
    <div
      role="menuitem"
      tabIndex={0}
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
      className={itemClassName}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn('my-1.5 h-px bg-border/70', className)} />;
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
