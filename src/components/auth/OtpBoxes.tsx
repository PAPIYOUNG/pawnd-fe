'use client';

interface OtpBoxesProps {
  length?: number;
  value: string;
  onChange: (next: string) => void;
}

export function OtpBoxes({ length = 6, value, onChange }: OtpBoxesProps) {
  const digits = value.split('');

  return (
    <div className="flex items-center justify-between gap-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          inputMode="numeric"
          maxLength={1}
          value={digits[index] ?? ''}
          onChange={(e) => {
            const char = e.target.value.replace(/\D/g, '').slice(-1);
            const next = digits.slice();
            next[index] = char;
            onChange(next.join('').slice(0, length));
            if (
              char &&
              e.target.nextElementSibling instanceof HTMLInputElement
            ) {
              e.target.nextElementSibling.focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[index]) {
              const prev = e.currentTarget.previousElementSibling;
              if (prev instanceof HTMLInputElement) prev.focus();
            }
          }}
          className="h-12 w-12 rounded-2xl border border-border bg-input/50 text-center text-lg font-semibold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      ))}
    </div>
  );
}
