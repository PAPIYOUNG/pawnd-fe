'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
  Controller,
  useForm,
  type UseFormRegisterReturn,
} from 'react-hook-form';
import { z } from 'zod';

import { GoogleIcon, LineIcon } from '@/components/auth/BrandIcons';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  registerAction,
  resendVerificationAction,
  verifyEmailAction,
} from '../_actions/register.actions';

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'กรุณากรอกชื่อ'),
    lastName: z.string().trim().min(1, 'กรุณากรอกนามสกุล'),
    email: z.string().trim().email('รูปแบบอีเมลไม่ถูกต้อง'),
    password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
    terms: z.boolean().refine((value) => value, 'กรุณายอมรับข้อกำหนด'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'รหัสผ่านยืนยันไม่ตรงกัน',
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof registerSchema>;
type RegisterStep = 'form' | 'verify' | 'success';
const OTP_LENGTH = 6;

/** Input รหัสผ่านพร้อมปุ่มแสดง/ซ่อน และเชื่อม React Hook Form */
function PasswordField({
  id,
  label,
  error,
  registration,
}: {
  id: 'password' | 'confirmPassword';
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder="อย่างน้อย 8 ตัวอักษร"
          className="pr-10"
          aria-invalid={Boolean(error)}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/** ช่อง OTP แยก 6 หลัก พร้อมเลื่อน focus อัตโนมัติ */
function OtpBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const digits = value.split('');

  return (
    <div className="flex items-center justify-between gap-2">
      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
        <input
          key={index}
          inputMode="numeric"
          aria-label={`รหัส OTP หลักที่ ${index + 1}`}
          maxLength={1}
          value={digits[index] ?? ''}
          onChange={(event) => {
            const digit = event.target.value.replace(/\D/g, '').slice(-1);
            const next = [...digits];
            next[index] = digit;
            onChange(next.join('').slice(0, OTP_LENGTH));
            if (
              digit &&
              event.target.nextElementSibling instanceof HTMLInputElement
            ) {
              event.target.nextElementSibling.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !digits[index]) {
              const previous = event.currentTarget.previousElementSibling;
              if (previous instanceof HTMLInputElement) previous.focus();
            }
          }}
          className="h-12 min-w-0 flex-1 rounded-2xl border border-border bg-input/50 text-center text-lg font-semibold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      ))}
    </div>
  );
}

/** Register flow: สมัครบัญชี → ยืนยันอีเมล → ไป Login */
export function RegisterForm() {
  const [step, setStep] = useState<RegisterStep>('form');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  /** ส่งเฉพาะ field ที่ RegisterDto รองรับ ห้ามส่ง confirmPassword/terms */
  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await registerAction({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
    });
    if (!result.success) {
      setFormError(result.message);
      return;
    }
    setRegisteredEmail(values.email);
    setStep('verify');
  });

  /** ยืนยัน OTP และเปลี่ยนบัญชีจาก PENDING เป็น ACTIVE */
  function handleVerify() {
    setOtpError(null);
    setNotice(null);
    if (otp.length !== OTP_LENGTH) {
      setOtpError('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
      return;
    }
    startTransition(async () => {
      const result = await verifyEmailAction(registeredEmail, otp);
      if (!result.success) {
        setOtpError(result.message);
        return;
      }
      setStep('success');
    });
  }

  /** ขอ OTP ใหม่และแจ้งว่ารหัสเดิมถูกยกเลิกแล้ว */
  function handleResend() {
    setOtpError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await resendVerificationAction(registeredEmail);
      if (!result.success) {
        setOtpError(result.message);
        return;
      }
      setOtp('');
      setNotice('ส่งรหัสใหม่แล้ว รหัสเดิมไม่สามารถใช้งานได้');
    });
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <CheckCircle2 className="size-16 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">ยืนยันอีเมลสำเร็จ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            บัญชีของคุณพร้อมใช้งานแล้ว เข้าสู่ระบบเพื่อเริ่มทดสอบแชทได้เลย
          </p>
        </div>
        <Link
          href="/login"
          className={buttonVariants({ size: 'lg', className: 'w-full' })}
        >
          ไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="flex w-full flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold">ยืนยันอีเมล</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            กรอกรหัส 6 หลักที่ส่งสำหรับ {registeredEmail}
          </p>
        </div>
        <OtpBoxes value={otp} onChange={setOtp} />
        {otpError && (
          <p className="text-sm text-destructive" role="alert">
            {otpError}
          </p>
        )}
        {notice && (
          <p className="text-sm text-primary" role="status">
            {notice}
          </p>
        )}
        <Button
          type="button"
          size="lg"
          disabled={isPending}
          onClick={handleVerify}
        >
          {isPending ? 'กำลังยืนยัน...' : 'ยืนยันอีเมล'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={handleResend}
        >
          ส่งรหัสใหม่
        </Button>
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setStep('form')}
        >
          ← กลับไปแก้ข้อมูลสมัครสมาชิก
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">สมัครสมาชิก</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ร่วมสร้างคอมมูนิตี้สี่ขาแสนอบอุ่นกับเรา 💚
        </p>
      </div>

      {formError && (
        <p
          className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {formError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">ชื่อ</Label>
          <Input
            id="firstName"
            aria-invalid={Boolean(errors.firstName)}
            {...register('firstName')}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">นามสกุล</Label>
          <Input
            id="lastName"
            aria-invalid={Boolean(errors.lastName)}
            {...register('lastName')}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">อีเมล</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <PasswordField
        id="password"
        label="รหัสผ่าน"
        error={errors.password?.message}
        registration={register('password')}
      />
      <PasswordField
        id="confirmPassword"
        label="ยืนยันรหัสผ่าน"
        error={errors.confirmPassword?.message}
        registration={register('confirmPassword')}
      />

      <Label htmlFor="terms" className="items-start gap-2 font-normal">
        <Controller
          name="terms"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="terms"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              className="mt-0.5"
            />
          )}
        />
        <span className="text-sm text-muted-foreground">
          ฉันยอมรับ ข้อกำหนดในการให้บริการ และนโยบายความเป็นส่วนตัว
        </span>
      </Label>
      {errors.terms && (
        <p className="text-xs text-destructive">{errors.terms.message}</p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี'}
      </Button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">หรือ</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        disabled
      >
        <GoogleIcon className="size-4" /> สมัครใช้งานด้วย Google
      </Button>
      <Button
        type="button"
        size="lg"
        className="w-full bg-[#06C755] text-white hover:bg-[#05b34c]"
        disabled
      >
        <LineIcon className="size-4" /> สมัครใช้งานด้วย LINE
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว?{' '}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
