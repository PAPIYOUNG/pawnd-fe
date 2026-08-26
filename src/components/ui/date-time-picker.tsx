'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { Input } from './input';

interface DateTimePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
}

const WEEKDAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

function padDatePart(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDatePart(date: Date): string {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function formatTimePart(date: Date): string {
  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function parseDateTimeLocal(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  );

  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3]) ||
    date.getHours() !== Number(match[4]) ||
    date.getMinutes() !== Number(match[5])
  ) {
    return null;
  }

  return date;
}

function isSameDay(first: Date | null, second: Date): boolean {
  return Boolean(
    first &&
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate(),
  );
}

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
  }).format(date);
}

export function DateTimePicker({
  id = 'date-time-picker',
  value,
  onChange,
  hasError = false,
  disabled = false,
}: DateTimePickerProps) {
  const selectedDate = parseDateTimeLocal(value);
  const fallbackDate = selectedDate ?? new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(fallbackDate.getFullYear(), fallbackDate.getMonth(), 1),
  );
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !pickerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const calendarCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDayOffset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cellCount = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;

    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - firstDayOffset + 1;
      return day > 0 && day <= daysInMonth ? new Date(year, month, day) : null;
    });
  }, [viewMonth]);

  const selectedDatePart = selectedDate
    ? formatDatePart(selectedDate)
    : formatDatePart(fallbackDate);
  const selectedTimePart = selectedDate
    ? formatTimePart(selectedDate)
    : formatTimePart(fallbackDate);
  const displayDate = selectedDate
    ? formatDisplayDate(selectedDate)
    : 'ยังไม่ได้เลือกวันที่';
  const displayTime = selectedDate ? selectedTimePart : 'ยังไม่ได้เลือกเวลา';

  const commitDateTime = (datePart: string, timePart: string) => {
    onChange(`${datePart}T${timePart}`);
  };

  const handleOpen = () => {
    if (disabled) return;

    const nextDate = parseDateTimeLocal(value) ?? new Date();
    setViewMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    setIsOpen(true);
  };

  return (
    <div ref={pickerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          'flex min-h-11 w-full items-center gap-3 rounded-2xl border bg-background px-3.5 text-left transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50',
          hasError ? 'border-destructive' : 'border-border hover:bg-muted/30',
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalendarDays className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-xs font-semibold sm:text-sm',
              !selectedDate && 'text-muted-foreground',
            )}
          >
            {displayDate}
          </span>
          <span
            className={cn(
              'mt-0.5 block text-[11px]',
              selectedDate ? 'text-muted-foreground' : 'text-muted-foreground',
            )}
          >
            เวลา {displayTime}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div
          id={`${id}-panel`}
          role="dialog"
          aria-label="เลือกวันที่และเวลา"
          className="mt-2 w-full max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-xl sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-foreground">เลือกวันที่</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                วันที่เกิดเหตุหรือวันที่พบสัตว์
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    (currentMonth) =>
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() - 1,
                        1,
                      ),
                  )
                }
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="เดือนก่อนหน้า"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    (currentMonth) =>
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1,
                        1,
                      ),
                  )
                }
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="เดือนถัดไป"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-center">
            <p className="text-sm font-bold text-primary">
              {new Intl.DateTimeFormat('th-TH', {
                month: 'long',
                year: 'numeric',
              }).format(viewMonth)}
            </p>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className="py-1">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarCells.map((date, index) => {
              if (!date) {
                return <span key={`empty-${index}`} className="size-9" />;
              }

              const isSelected = isSameDay(selectedDate, date);
              const isToday = isSameDay(new Date(), date);

              return (
                <button
                  key={formatDatePart(date)}
                  type="button"
                  onClick={() =>
                    commitDateTime(formatDatePart(date), selectedTimePart)
                  }
                  className={cn(
                    'relative flex size-9 items-center justify-center rounded-xl text-xs font-semibold transition-colors hover:bg-primary/10 hover:text-primary',
                    isSelected &&
                      'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                    !isSelected && isToday && 'ring-1 ring-primary/50',
                  )}
                  aria-label={`เลือกวันที่ ${date.getDate()}`}
                  aria-pressed={isSelected}
                >
                  {date.getDate()}
                  {isSelected && (
                    <Check className="absolute bottom-0.5 size-2.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 border-t border-border/70 pt-4">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <p className="text-sm font-bold text-foreground">เลือกเวลา</p>
            </div>
            <Input
              type="time"
              value={selectedTimePart}
              onChange={(event) =>
                commitDateTime(selectedDatePart, event.target.value)
              }
              className="h-11 rounded-2xl text-sm font-semibold"
              aria-label="เลือกเวลา"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-[11px] text-muted-foreground">
              เลือกได้ทั้งวันที่และเวลา
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
