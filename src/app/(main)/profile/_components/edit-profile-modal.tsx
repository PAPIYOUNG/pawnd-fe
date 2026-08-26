'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Edit3,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OtpBoxes } from '@/components/auth/OtpBoxes';
import { useResendCooldown } from '@/hooks/use-resend-cooldown';
import { UserProfile } from '@/types/user';
import { ROLE_LABEL, STATUS_LABEL } from './user-profile-details-grid';
import {
  updateProfileAction,
  requestEmailChangeAction,
  confirmEmailChangeAction,
} from '../_actions/profile.actions';

// Schema ตรวจสอบข้อมูลโปรไฟล์ที่แก้ไขได้ (ไม่รวม role, status, createdAt, id, email)
const profileSchema = z.object({
  firstName: z.string().min(1, 'กรุณากรอกชื่อจริง'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  phone: z.string().optional(),
  lineId: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Schema สำหรับอีเมลใหม่ก่อนกดส่ง OTP
const newEmailSchema = z.string().min(1, 'กรุณากรอกอีเมลใหม่').email('รูปแบบอีเมลไม่ถูกต้อง');

interface EditProfileModalProps {
  user: UserProfile;
}

/**
 * EditProfileModal Component (Client Component)
 * - ปุ่ม "แก้ไขโปรไฟล์" พร้อม Modal ฟอร์มแก้ไขข้อมูลบัญชีผู้ใช้งาน
 * - แก้ไขได้ทุกฟิลด์ ยกเว้น รหัสผู้ใช้ (ID), บทบาท (role) และวันที่สมัครสมาชิก (createdAt) ซึ่งล็อกไว้เสมอ
 * - การเปลี่ยนอีเมลแยกเป็นขั้นตอนพิเศษ: กรอกอีเมลใหม่ -> ส่ง OTP ไปอีเมลนั้น -> กรอก OTP ยืนยัน
 *   -> อีเมลจะถูกอัปเดตจริงก็ต่อเมื่อยืนยัน OTP สำเร็จเท่านั้น (Backend: PATCH /users/me/email, POST /users/me/email/verify)
 * - ฟิลด์ทั่วไป (ชื่อ, นามสกุล, เบอร์โทร, LINE ID, ที่อยู่) บันทึกผ่านปุ่ม "บันทึก" แยกจากขั้นตอนเปลี่ยนอีเมล
 */
export function EditProfileModal({ user }: EditProfileModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  // ขั้นตอนภายใน Modal: 'form' = ฟอร์มหลัก, 'otp' = กรอกรหัสยืนยันอีเมลใหม่
  const [step, setStep] = useState<'form' | 'otp'>('form');

  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // สถานะสำหรับส่วนเปลี่ยนอีเมล
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newEmailError, setNewEmailError] = useState<string | null>(null);
  const [isSendingOtp, startSendOtp] = useTransition();

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isConfirmingOtp, startConfirmOtp] = useTransition();
  const [isResending, startResendOtp] = useTransition();
  const resendCooldown = useResendCooldown(60);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      lineId: user.lineId || '',
      address: user.address || '',
    },
  });

  const createdAtFull = new Date(user.createdAt).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // เปิด Modal พร้อมรีเซ็ตทุก State กลับเป็นค่าเริ่มต้นจากข้อมูลผู้ใช้ปัจจุบัน
  const handleOpen = () => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      lineId: user.lineId || '',
      address: user.address || '',
    });
    setStep('form');
    setIsChangingEmail(false);
    setNewEmail('');
    setNewEmailError(null);
    setOtp('');
    setOtpError(null);
    setResendMessage(null);
    setSaveFeedback(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // บันทึกข้อมูลฟิลด์ทั่วไป (ไม่รวมอีเมล)
  const onSubmitProfile = handleSubmit(async (values) => {
    setIsSaving(true);
    setSaveFeedback(null);

    const res = await updateProfileAction(values);

    setIsSaving(false);
    if (res.success) {
      setSaveFeedback({ type: 'success', message: 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว' });
      router.refresh();
      setTimeout(() => {
        setIsOpen(false);
      }, 900);
    } else {
      setSaveFeedback({ type: 'error', message: res.error || 'ไม่สามารถบันทึกข้อมูลได้' });
    }
  });

  // กดยืนยันขอเปลี่ยนอีเมล -> ตรวจรูปแบบอีเมล -> ยิง OTP ไปอีเมลใหม่
  const handleSendOtp = () => {
    setNewEmailError(null);
    const parsed = newEmailSchema.safeParse(newEmail.trim());
    if (!parsed.success) {
      setNewEmailError(parsed.error.issues[0]?.message || 'รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }
    if (parsed.data === user.email) {
      setNewEmailError('อีเมลใหม่ต้องไม่ซ้ำกับอีเมลปัจจุบัน');
      return;
    }

    startSendOtp(async () => {
      const res = await requestEmailChangeAction(parsed.data);
      if (!res.success) {
        setNewEmailError(res.error || 'ไม่สามารถส่งรหัส OTP ได้');
        return;
      }
      setOtp('');
      setOtpError(null);
      setResendMessage(null);
      setStep('otp');
      resendCooldown.start();
    });
  };

  // กดยืนยันรหัส OTP เพื่อยืนยันอีเมลใหม่จริง
  const handleConfirmOtp = () => {
    setOtpError(null);
    if (otp.length !== 6) {
      setOtpError('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
      return;
    }

    startConfirmOtp(async () => {
      const res = await confirmEmailChangeAction(otp);
      if (!res.success) {
        setOtpError(res.error || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
        return;
      }
      // ยืนยันสำเร็จ กลับไปหน้าฟอร์มหลักพร้อมข้อมูลอีเมลล่าสุดจาก Backend
      setIsChangingEmail(false);
      setNewEmail('');
      setStep('form');
      setSaveFeedback({ type: 'success', message: 'เปลี่ยนอีเมลเรียบร้อยแล้ว' });
      router.refresh();
    });
  };

  // ขอ OTP ใหม่อีกครั้งระหว่างอยู่ในขั้นตอนกรอก OTP
  const handleResendOtp = () => {
    setResendMessage(null);
    setOtpError(null);
    startResendOtp(async () => {
      const res = await requestEmailChangeAction(newEmail);
      if (!res.success) {
        setOtpError(res.error || 'ไม่สามารถส่งรหัส OTP ใหม่ได้');
        return;
      }
      setResendMessage('ส่งรหัส OTP ใหม่แล้ว กรุณาตรวจสอบอีเมลของคุณ');
      resendCooldown.start();
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpen}
        className="h-10 min-h-10 w-full rounded-2xl border-border px-5 text-xs font-semibold shadow-2xs sm:w-auto sm:text-sm hover:bg-muted"
      >
        <Edit3 className="size-3.5 mr-1.5" />
        <span>แก้ไขโปรไฟล์</span>
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={handleClose}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border/80 bg-card p-5 shadow-2xl transition-all sm:p-7 dark:border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ปุ่มปิด Modal */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="ปิดหน้าต่างแก้ไขโปรไฟล์"
              className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            {step === 'form' ? (
              <>
                {/* ส่วนหัว Modal */}
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Edit3 className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground sm:text-xl">
                      แก้ไขโปรไฟล์
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      แก้ไขข้อมูลบัญชีของคุณได้ ยกเว้นรหัสผู้ใช้ บทบาท และวันที่สมัครสมาชิก
                    </p>
                  </div>
                </div>

                {saveFeedback && (
                  <div
                    className={`mt-4 flex items-center gap-2 rounded-2xl p-3.5 text-xs font-semibold ${
                      saveFeedback.type === 'success'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-destructive/15 text-destructive'
                    }`}
                  >
                    {saveFeedback.type === 'success' ? (
                      <CheckCircle2 className="size-4 shrink-0" />
                    ) : (
                      <AlertCircle className="size-4 shrink-0" />
                    )}
                    <span>{saveFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={onSubmitProfile} className="mt-5 flex flex-col gap-4">
                  {/* ฟิลด์ที่ล็อกไว้ ห้ามแก้ไข: ID, บทบาท, วันที่สมัครสมาชิก */}
                  <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3.5 sm:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                        <Lock className="size-3" /> รหัสผู้ใช้ (ID)
                      </span>
                      <span className="truncate text-xs font-bold text-foreground">{user.id}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                        <Lock className="size-3" /> บทบาท
                      </span>
                      <span className="text-xs font-bold text-foreground">{ROLE_LABEL[user.role]}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                        <Lock className="size-3" /> วันที่สมัครสมาชิก
                      </span>
                      <span className="text-xs font-bold text-foreground">{createdAtFull}</span>
                    </div>
                  </div>

                  {/* ชื่อ-นามสกุล */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="firstName" className="text-xs font-semibold">
                        ชื่อจริง <span className="text-destructive">*</span>
                      </Label>
                      <Input id="firstName" className="rounded-2xl" {...register('firstName')} />
                      {errors.firstName && (
                        <span className="text-xs text-destructive">{errors.firstName.message}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="lastName" className="text-xs font-semibold">
                        นามสกุล <span className="text-destructive">*</span>
                      </Label>
                      <Input id="lastName" className="rounded-2xl" {...register('lastName')} />
                      {errors.lastName && (
                        <span className="text-xs text-destructive">{errors.lastName.message}</span>
                      )}
                    </div>
                  </div>

                  {/* อีเมล: แสดงค่าปัจจุบัน + ปุ่มเปลี่ยนอีเมล */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold">อีเมล</Label>
                    {!isChangingEmail ? (
                      <div className="flex items-center gap-2">
                        <Input value={user.email} disabled className="rounded-2xl" />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsChangingEmail(true)}
                          className="h-8 shrink-0 rounded-2xl px-3 text-xs font-semibold"
                        >
                          เปลี่ยนอีเมล
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                        <div className="flex items-start gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                          <span>
                            การเปลี่ยนอีเมลต้องยืนยันตัวตนใหม่ด้วยรหัส OTP ที่จะส่งไปยังอีเมลใหม่
                            บัญชีจะอยู่ระหว่างรอยืนยันอีเมลจนกว่าจะยืนยัน OTP สำเร็จ
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="email"
                            placeholder="กรอกอีเมลใหม่"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="rounded-2xl bg-background"
                          />
                          <Button
                            type="button"
                            disabled={isSendingOtp}
                            onClick={handleSendOtp}
                            className="h-8 shrink-0 gap-1.5 rounded-2xl bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                          >
                            {isSendingOtp ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Mail className="size-3.5" />
                            )}
                            <span>{isSendingOtp ? 'กำลังส่ง...' : 'ส่ง OTP'}</span>
                          </Button>
                        </div>
                        {newEmailError && (
                          <span className="text-xs text-destructive">{newEmailError}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingEmail(false);
                            setNewEmail('');
                            setNewEmailError(null);
                          }}
                          className="self-start text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                        >
                          ยกเลิกการเปลี่ยนอีเมล
                        </button>
                      </div>
                    )}
                  </div>

                  {/* เบอร์โทรศัพท์ / LINE ID */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="phone" className="text-xs font-semibold">
                        เบอร์โทรศัพท์
                      </Label>
                      <Input id="phone" placeholder="ไม่ระบุ" className="rounded-2xl" {...register('phone')} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="lineId" className="text-xs font-semibold">
                        LINE ID
                      </Label>
                      <Input id="lineId" placeholder="ไม่ระบุ" className="rounded-2xl" {...register('lineId')} />
                    </div>
                  </div>

                  {/* ที่อยู่ */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="address" className="text-xs font-semibold">
                      ที่อยู่
                    </Label>
                    <Input id="address" placeholder="ไม่ระบุ" className="rounded-2xl" {...register('address')} />
                  </div>

                  {/* สถานะบัญชี (แสดงอย่างเดียว ห้ามแก้ไขตรง ๆ — เปลี่ยนได้ผ่านขั้นตอนยืนยันอีเมล/แอดมินเท่านั้น) */}
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                      <Lock className="size-3" /> สถานะบัญชี
                    </span>
                    <span className="text-xs font-bold text-foreground">{STATUS_LABEL[user.status]}</span>
                  </div>

                  {/* ปุ่ม Cancel / Save */}
                  <div className="mt-2 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 rounded-2xl"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 gap-2 rounded-2xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                    >
                      {isSaving && <Loader2 className="size-4 animate-spin" />}
                      <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}</span>
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                {/* ขั้นตอนกรอก OTP ยืนยันอีเมลใหม่ */}
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground sm:text-xl">
                      ยืนยันอีเมลใหม่
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      เราได้ส่งรหัส OTP ไปยัง {newEmail} กรุณากรอกรหัส 6 หลักเพื่อยืนยัน
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  <OtpBoxes value={otp} onChange={setOtp} />

                  {otpError && <p className="text-sm text-destructive">{otpError}</p>}
                  {resendMessage && <p className="text-sm text-primary">{resendMessage}</p>}

                  <Button
                    type="button"
                    disabled={isConfirmingOtp}
                    onClick={handleConfirmOtp}
                    className="w-full gap-2 rounded-2xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                  >
                    {isConfirmingOtp && <Loader2 className="size-4 animate-spin" />}
                    <span>{isConfirmingOtp ? 'กำลังยืนยัน...' : 'ยืนยัน'}</span>
                  </Button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending || resendCooldown.isActive}
                    className="text-center text-sm text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResending
                      ? 'กำลังส่ง...'
                      : resendCooldown.isActive
                        ? `ส่งรหัส OTP อีกครั้งใน ${resendCooldown.remaining} วินาที`
                        : 'ส่งรหัส OTP อีกครั้ง'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setOtp('');
                      setOtpError(null);
                    }}
                    className="text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    ย้อนกลับไปแก้ไขอีเมล
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
