'use client';

import { useState } from 'react';
import { Settings, Bell, Shield, Lock, Trash2, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * SettingsPage Component (Client Component)
 * - หน้าตั้งค่าระบบและบัญชีผู้ใช้งาน (User & System Settings)
 * - รองรับการเปิด-ปิดการแจ้งเตือน, การยืนยันสองชั้น (2FA), เปลี่ยนรหัสผ่าน ตรงตาม Backend DTO
 */
export default function SettingsPage() {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      {/* ส่วนหัวหน้าตั้งค่า */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          ตั้งค่าระบบ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          จัดการความเป็นส่วนตัว การแจ้งเตือน และความปลอดภัยของบัญชีผู้ใช้งาน
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-5" />
          <span>บันทึกการตั้งค่าระบบเรียบร้อยแล้ว</span>
        </div>
      )}

      {/* 1. การตั้งค่าการแจ้งเตือนและความปลอดภัย */}
      <div className="flex flex-col gap-5 rounded-3xl border border-border/80 bg-card p-6 shadow-sm dark:border-border/60">
        <h3 className="text-lg font-bold text-foreground">
          การแจ้งเตือนและความปลอดภัย
        </h3>

        {/* สวิตช์การแจ้งเตือน */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Bell className="size-5" />
            </div>
            <div>
              <span className="font-bold text-foreground">การแจ้งเตือนในระบบ</span>
              <p className="text-xs text-muted-foreground">
                รับการแจ้งเตือนเมื่อพบเบาะแสหรือ AI จับคู่สัตว์เลี้ยง
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notificationEnabled}
            onChange={(e) => setNotificationEnabled(e.target.checked)}
            className="size-5 accent-primary cursor-pointer"
          />
        </div>

        {/* สวิตช์ 2FA */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Shield className="size-5" />
            </div>
            <div>
              <span className="font-bold text-foreground">
                การยืนยันตัวตนสองชั้น (2FA)
              </span>
              <p className="text-xs text-muted-foreground">
                เพิ่มความปลอดภัยด้วยรหัส OTP ทางอีเมลขณะเข้าสู่ระบบ
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={twoFactorEnabled}
            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
            className="size-5 accent-primary cursor-pointer"
          />
        </div>
      </div>

      {/* 2. การเปลี่ยนรหัสผ่าน */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm dark:border-border/60">
        <div className="flex items-center gap-2.5">
          <Lock className="size-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">เปลี่ยนรหัสผ่าน</h3>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold">รหัสผ่านปัจจุบัน</Label>
          <Input type="password" placeholder="••••••••" className="rounded-2xl" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">รหัสผ่านใหม่</Label>
            <Input type="password" placeholder="อย่างน้อย 8 ตัวอักษร" className="rounded-2xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">ยืนยันรหัสผ่านใหม่</Label>
            <Input type="password" placeholder="••••••••" className="rounded-2xl" />
          </div>
        </div>
      </div>

      {/* ปุ่มบันทึกการตั้งค่า */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSaveSettings}
          className="rounded-2xl bg-primary px-8 font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
        >
          บันทึกการเปลี่ยนแปลง
        </Button>
      </div>
    </div>
  );
}
