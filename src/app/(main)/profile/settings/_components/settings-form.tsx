'use client';

import { useState } from 'react';
import { Bell, Shield, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { saveSettingsAction, changePasswordAction } from '../_actions/settings.actions';

interface SettingsFormProps {
<<<<<<< HEAD
  /** ค่าเริ่มต้นการแจ้งเตือน ดึงมาจาก Backend (GET /users/me) ผ่าน Server Component ชั้นบน */
  initialNotificationEnabled: boolean;
  /** ค่าเริ่มต้นการยืนยันตัวตนสองชั้น ดึงมาจาก Backend (GET /users/me) ผ่าน Server Component ชั้นบน */
=======
  initialNotificationEnabled: boolean;
>>>>>>> dev
  initialTwoFactorEnabled: boolean;
}

/**
 * SettingsForm Component (Client Component)
<<<<<<< HEAD
 * - ฟอร์มตั้งค่าระบบและบัญชีผู้ใช้งาน (การแจ้งเตือน, 2FA, เปลี่ยนรหัสผ่าน)
 * - รับค่าเริ่มต้นจริงจาก Backend ผ่าน props (แทนการ hardcode) เพื่อให้ Toggle
 *   แสดงสถานะปัจจุบันของผู้ใช้ถูกต้องตั้งแต่โหลดหน้าครั้งแรก
 * - เชื่อมต่อ Backend API ผ่าน Server Actions (saveSettingsAction, changePasswordAction)
 *   ซึ่งเรียก PATCH /users/me/settings และ PATCH /users/me/password ตามลำดับ
=======
 * - ฟอร์มจัดการการตั้งค่าระบบและการเปลี่ยนรหัสผ่าน
 * - รับ initialSettings ที่ดึงมาจาก Backend จริงผ่าน Server Component
 * - ควบคุมสวิตช์ Toggle และฟอร์มเปลี่ยนรหัสผ่าน พร้อม Feedback และ Loading State
>>>>>>> dev
 */
export function SettingsForm({
  initialNotificationEnabled,
  initialTwoFactorEnabled,
}: SettingsFormProps) {
  const [notificationEnabled, setNotificationEnabled] = useState(initialNotificationEnabled);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactorEnabled);
<<<<<<< HEAD
  // สถานะกำลังบันทึกแยกตาม toggle เพื่อ disable เฉพาะตัวที่กำลังยิง API อยู่
  const [isSavingNotification, setIsSavingNotification] = useState(false);
  const [isSavingTwoFactor, setIsSavingTwoFactor] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
=======
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
>>>>>>> dev

  // State สำหรับเปลี่ยนรหัสผ่าน
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
<<<<<<< HEAD
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // สลับ toggle การแจ้งเตือน แล้วยิง Server Action ทันที (Optimistic Update)
  const handleToggleNotification = async (checked: boolean) => {
    setNotificationEnabled(checked);
    setIsSavingNotification(true);
    setSettingsFeedback(null);

    const res = await saveSettingsAction({ notificationEnabled: checked });

    setIsSavingNotification(false);
    if (!res.success) {
      // ถ้าบันทึกไม่สำเร็จ ให้ย้อนค่ากลับไปเป็นค่าเดิมก่อนหน้า เพื่อไม่ให้ UI ค้างสถานะที่ไม่ตรงกับ Backend
      setNotificationEnabled(!checked);
=======
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // บันทึกการตั้งค่าการแจ้งเตือนและ 2FA ไปยัง Backend
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
>>>>>>> dev
      setSettingsFeedback({ type: 'error', message: res.error || 'เกิดข้อผิดพลาดในการบันทึก' });
    }
  };

<<<<<<< HEAD
  // สลับ toggle 2FA แล้วยิง Server Action ทันที (Optimistic Update)
  const handleToggleTwoFactor = async (checked: boolean) => {
    setTwoFactorEnabled(checked);
    setIsSavingTwoFactor(true);
    setSettingsFeedback(null);

    const res = await saveSettingsAction({ twoFactorEnabled: checked });

    setIsSavingTwoFactor(false);
    if (!res.success) {
      setTwoFactorEnabled(!checked);
      setSettingsFeedback({ type: 'error', message: res.error || 'เกิดข้อผิดพลาดในการบันทึก' });
    }
  };

  // บันทึกการเปลี่ยนรหัสผ่าน
=======
  // บันทึกการเปลี่ยนรหัสผ่านไปยัง Backend
>>>>>>> dev
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
<<<<<<< HEAD
      setPasswordFeedback({ type: 'success', message: res.message || 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
=======
      setPasswordFeedback({
        type: 'success',
        message: res.message || 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
      });
>>>>>>> dev
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordFeedback(null), 4000);
    } else {
<<<<<<< HEAD
      setPasswordFeedback({ type: 'error', message: res.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' });
=======
      setPasswordFeedback({
        type: 'error',
        message: res.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
      });
>>>>>>> dev
    }
  };

  return (
<<<<<<< HEAD
    <>
      {settingsFeedback && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-sm font-semibold ${
=======
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

      {settingsFeedback && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-sm font-semibold animate-in fade-in duration-200 ${
>>>>>>> dev
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
<<<<<<< HEAD
            onCheckedChange={handleToggleNotification}
            disabled={isSavingNotification}
=======
            onCheckedChange={setNotificationEnabled}
>>>>>>> dev
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
<<<<<<< HEAD
            onCheckedChange={handleToggleTwoFactor}
            disabled={isSavingTwoFactor}
            aria-label="เปิด-ปิดการยืนยันตัวตนสองชั้น"
          />
        </div>
      </div>

      {/* 2. การเปลี่ยนรหัสผ่าน */}
      <form onSubmit={handleChangePassword} className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm dark:border-border/60">
=======
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
      <form
        onSubmit={handleChangePassword}
        className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm dark:border-border/60"
      >
>>>>>>> dev
        <div className="flex items-center gap-2.5">
          <Lock className="size-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">เปลี่ยนรหัสผ่าน</h3>
        </div>

        {passwordFeedback && (
          <div
<<<<<<< HEAD
            className={`flex items-center gap-2 rounded-2xl p-3.5 text-xs font-semibold ${
=======
            className={`flex items-center gap-2 rounded-2xl p-3.5 text-xs font-semibold animate-in fade-in duration-200 ${
>>>>>>> dev
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
<<<<<<< HEAD
    </>
=======
    </div>
>>>>>>> dev
  );
}
