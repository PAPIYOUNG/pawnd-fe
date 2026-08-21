import { Flag } from 'lucide-react';

const QUICK_ACTIONS = [
  {
    title: 'กระทู้ที่ถูกรายงานปัญหาสูงสุด',
    detail: '20 รายการ #P-882 (อยู่ระหว่างตรวจสอบ)',
  },
] as const;

export function QuickActionsCard() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          ทางลัดจัดการเร่งด่วน
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="size-2 rounded-full bg-amber-500" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {QUICK_ACTIONS.map(({ title, detail }) => (
          <div
            key={title}
            className="flex items-center justify-between gap-3 rounded-2xl bg-amber-500/10 p-3"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{title}</span>
              <span className="text-xs text-muted-foreground">{detail}</span>
            </div>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Flag className="size-4" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
