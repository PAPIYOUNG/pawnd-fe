'use client';

import { useState } from 'react';
import { Bell, Shield, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { saveSettingsAction, changePasswordAction } from '../_actions/settings.actions';

interface SettingsFormProps {
  /** ค่าเริ่มต้นการแจ้งเตือน ดึงมาจาก Backend (GET /users/me) ผ่าน Server Component ชั้นบน */
  initialNotificationEnabled: boolean;
  /** ค่าเริ่มต้นการยืนยันตัวตนสองชั้น ดึงมาจาก Backend (GET /users/me) ผ่าน Server Component ชั้นบน */
  initialTwoFactorEnabled: boolean;
}

/**
 * SettingsForm Component (Client Component)
 * - ฟอร์มตั้งค่าระบบและบัญชีผู้ใช้งาน (การแจ้งเตือน, 2FA, เปลี่ยนรหัสผ่าน)
 * - รับค่าเริ่มต้นจริงจาก Backend ผ่าน props (แทนการ hardcode) เพื่อให้ Toggle
 *   แสดงสถานะปัจจุบันของผู้ใช้ถูกต้องตั้งแต่โหลดหน้าครั้งแรก
 * - เชื่อมต่อ Backend API ผ่าน Server Actions (saveSettingsAction, changePasswordAction)
 *   ซึ่งเรียก PATCH /users/me/settings และ PATCH /users/me/password ตามลำดับ
 */
export function SettingsForm({
  initialNotificationEnabled,
  initialTwoFactorEnabled,
}: SettingsFormProps) {
  const [notificationEnabled, setNotificationEnabled] = useState(initialNotificationEnabled);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactorEnabled);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // State สำหรับเปลี่ยนรหัสผ่าน
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // บันทึกการตั้งค่าการแจ้งเตือนและ 2FA (เรียก Server Action -> PATCH /users/me/settings)
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsFeedback(null);

    const res = await saveSettingsAction({
      notificationEnabled,
      twoFactorEnabled,
    });

    setIsSavingSettings(false);
    if (res.success) {
      setSettingsFeedback({ type: 'success', message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว' });
      setTimeout(() => setSettingsFeedback(null), 4000);
    } else {
      // ถ้าบันทึกไม่สำเร็จ ให้ย้อนค่า toggle กลับไปเป็นค่าเดิมก่อนหน้า เพื่อไม่ให้ UI ค้างสถานะที่ไม่ตรงกับ Backend
      setNotificationEnabled(initialNotificationEnabled);
      setTwoFactorEnabled(initialTwoFactorEnabled);
      setSettingsFeedback({ type: 'error', message: res.error || 'เกิดข้อผิดพลาดในการบันทึก' });
    }
  };

  // บันทึกการเปลี่ยนรหัสผ่าน
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordFeedback(null);

    const res = await changePasswordAction({
      oldPassword,
      newPassword,
      confirmPassword,
    });

    setIsChangingPassword(false);
    if (res.success) {
      setPasswordFeedback({ type: 'success', message: res.message || 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordFeedback(null), 4000);
    } else {
      setPasswordFeedback({ type: 'error', message: res.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' });
    }
  };

  return (
    <>
      {settingsFeedback && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-sm font-semibold ${
            settingsFeedback.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
              : 'bg-destructive/15 text-destructive'
          }`}
        >
          {settingsFeedback.type === 'success' ? (
            <CheckCircle2 className="size-5 shrink-0" />
          ) : (
            <AlertCircle className="size-5 shrink-0" />
          )}
          <span>{settingsFeedback.message}</span>
        </div>
      )}

      {/* 1. การตั้งค่าการแจ้งเตือนและความปลอดภัย */}
      <div className="flex flex-col gap-5 rounded-3xl border border-border/80 bg-card p-6 shadow-sm dark:border-border/60">
        <h3 className="text-lg font-bold text-foreground">
          การแจ้งเตือนและความปลอดภัย
        </h3>

        {/* สวิตช์การแจ้งเตือน (Toggle Switch เลื่อนเปิด-ปิด) */}
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
          <Switch
            checked={notificationEnabled}
            onCheckedChange={setNotificationEnabled}
            aria-label="เปิด-ปิดการแจ้งเตือนในระบบ"
          />
        </div>

        {/* สวิตช์ 2FA (Toggle Switch เลื่อนเปิด-ปิด) */}
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
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
            aria-label="เปิด-ปิดการยืนยันตัวตนสองชั้น"
          />
        </div>

        {/* ปุ่มบันทึกการตั้งค่าการแจ้งเตือน & 2FA */}
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="gap-2 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
          >
            {isSavingSettings && <Loader2 className="size-4 animate-spin" />}
            <span>{isSavingSettings ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
          </Button>
        </div>
      </div>

      {/* 2. การเปลี่ยนรหัสผ่าน */}
      <form onSubmit={handleChangePassword} className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm dark:border-border/60">
        <div className="flex items-center gap-2.5">
          <Lock className="size-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">เปลี่ยนรหัสผ่าน</h3>
        </div>

        {passwordFeedback && (
          <div
            className={`flex items-center gap-2 rounded-2xl p-3.5 text-xs font-semibold ${
              passwordFeedback.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-destructive/15 text-destructive'
            }`}
          >
            {passwordFeedback.type === 'success' ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <AlertCircle className="size-4 shrink-0" />
            )}
            <span>{passwordFeedback.message}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold">รหัสผ่านปัจจุบัน</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="rounded-2xl"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">รหัสผ่านใหม่</Label>
            <Input
              type="password"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-2xl"
              required
              minLength={8}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">ยืนยันรหัสผ่านใหม่</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-2xl"
              required
              minLength={8}
            />
          </div>
        </div>

        {/* ปุ่มเปลี่ยนรหัสผ่าน */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isChangingPassword}
            className="gap-2 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
          >
            {isChangingPassword && <Loader2 className="size-4 animate-spin" />}
            <span>{isChangingPassword ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}</span>
          </Button>
        </div>
      </form>
    </>
  );
}
