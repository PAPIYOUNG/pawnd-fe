'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleIcon, LineIcon } from '@/components/auth/BrandIcons';
import { OtpBoxes } from '@/components/auth/OtpBoxes';
import { useResendCooldown } from '@/hooks/use-resend-cooldown';
import {
  verifyEmailAction,
  resendVerificationAction,
} from '@/lib/action/verify-email.actions';

import {
  loginAction,
  verifyLoginOtpAction,
  loginWithGoogleAction,
  loginWithLineAction,
  completeLineRegistrationAction,
  resendTwoFactorAction,
} from '../_actions/login.actions';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const LINE_OAUTH_STATE_KEY = 'line_oauth_state';

const loginSchema = z.object({
  email: z.string().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<
    'login' | 'otp' | 'line-email' | 'line-verify'
  >('login');
  const [tempToken, setTempToken] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const [lineNotice, setLineNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [googleReady, setGoogleReady] = useState(false);
  const [isGooglePending, startGoogleTransition] = useTransition();

  useEffect(() => {
    // เผื่อสคริปต์ Google โหลดไว้แล้วจากการเข้าหน้านี้รอบก่อน (เช่น หลัง redirect กลับมา)
    // แต่ onLoad ของ <Script> ไม่ยิงซ้ำให้ component ที่เพิ่ง mount ใหม่
    if (typeof window !== 'undefined' && window.google) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoogleReady(true);
    }
  }, []);

  const [isLinePending, startLineTransition] = useTransition();
  const [lineEmail, setLineEmail] = useState('');
  const [lineEmailInput, setLineEmailInput] = useState('');
  const [lineError, setLineError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, startResendTransition] = useTransition();
  // ตัวนับถอยหลังก่อนอนุญาตให้กดขอ OTP ใหม่อีกครั้ง (ใช้ร่วมกับหน้า line-verify)
  const resendCooldown = useResendCooldown(60);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setGoogleNotice(null);
    const result = await loginAction(values);

    if (!result.success) {
      setFormError(result.message);
      return;
    }
    if (result.needsOtp) {
      setTempToken(result.tempToken);
      setStep('otp');
      resendCooldown.start();
    }
  });

  const handleVerifyOtp = () => {
    setOtpError(null);
    if (otp.length !== 6) {
      setOtpError('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
      return;
    }
    startTransition(async () => {
      const result = await verifyLoginOtpAction({ tempToken, otp });
      if (!result.success) {
        setOtpError(result.message);
      }
    });
  };

  const handleGoogleCredential = useCallback((credential: string) => {
    setFormError(null);
    setGoogleNotice(null);
    startGoogleTransition(async () => {
      const result = await loginWithGoogleAction(credential);

      if (!result.success) {
        setFormError(result.message);
        return;
      }
      if ('needsVerification' in result) {
        setGoogleNotice(result.message);
        return;
      }
      if (result.needsOtp) {
        setTempToken(result.tempToken);
        setStep('otp');
        resendCooldown.start();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!googleReady || !window.google) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => handleGoogleCredential(response.credential),
    });
  }, [googleReady, handleGoogleCredential]);

  const handleGoogleButtonClick = () => {
    window.google?.accounts.id.prompt();
  };

  const handleLineButtonClick = () => {
    const clientId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
    if (!clientId) {
      console.error('NEXT_PUBLIC_LINE_CHANNEL_ID is not set');
      return;
    }

    const state = crypto.randomUUID();
    sessionStorage.setItem(LINE_OAUTH_STATE_KEY, state);

    const redirectUri = `${window.location.origin}/login`;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: 'profile openid email',
    });

    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  };

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (!code) return;

    router.replace('/login');

    const savedState = sessionStorage.getItem(LINE_OAUTH_STATE_KEY);
    sessionStorage.removeItem(LINE_OAUTH_STATE_KEY);
    const redirectUri = `${window.location.origin}/login`;

    startLineTransition(async () => {
      if (!state || state !== savedState) {
        setFormError('เข้าสู่ระบบด้วย LINE ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        return;
      }

      const result = await loginWithLineAction(code, redirectUri);

      if (!result.success) {
        setFormError(result.message);
        return;
      }
      if ('needsEmail' in result) {
        setTempToken(result.tempToken);
        setStep('line-email');
        return;
      }
      if ('needsVerification' in result) {
        setLineNotice(result.message);
        return;
      }
      if (result.needsOtp) {
        setTempToken(result.tempToken);
        setStep('otp');
        resendCooldown.start();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleLineEmailSubmit = () => {
    setLineError(null);
    if (!lineEmailInput || !lineEmailInput.includes('@')) {
      setLineError('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }
    startLineTransition(async () => {
      const result = await completeLineRegistrationAction({
        tempToken,
        email: lineEmailInput,
      });

      if (!result.success) {
        setLineError(result.message);
        return;
      }
      if ('needsVerification' in result) {
        setLineEmail(lineEmailInput);
        setStep('line-verify');
        resendCooldown.start();
        return;
      }

      if (result.needsOtp) {
        setTempToken(result.tempToken);
        setStep('otp');
      }
    });
  };

  const handleLineVerifyOtp = () => {
    setOtpError(null);
    if (otp.length !== 6) {
      setOtpError('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
      return;
    }
    startTransition(async () => {
      const result = await verifyEmailAction({ email: lineEmail, otp });
      if (!result.success) {
        setOtpError(result.message);
      }
    });
  };

  const handleResendLineOtp = () => {
    setResendMessage(null);
    setOtpError(null);
    startResendTransition(async () => {
      const result = await resendVerificationAction({ email: lineEmail });
      if (!result.success) {
        setOtpError(result.message);
        return;
      }
      setResendMessage('ส่งรหัสยืนยันใหม่แล้ว กรุณาตรวจสอบอีเมลของคุณ');
      resendCooldown.start();
    });
  };

  const handleResendTwoFactorOtp = () => {
    setResendMessage(null);
    setOtpError(null);
    startResendTransition(async () => {
      const result = await resendTwoFactorAction({ tempToken });
      if (!result.success) {
        setOtpError(result.message);
        return;
      }
      setResendMessage('ส่งรหัสยืนยันใหม่แล้ว กรุณาตรวจสอบอีเมลของคุณ');
      resendCooldown.start();
    });
  };

  if (step === 'line-email') {
    return (
      <div className="flex w-full flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            กรอกอีเมลของคุณ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            บัญชี LINE นี้ยังไม่เคยใช้งาน กรุณากรอกอีเมลเพื่อสร้างบัญชี PAWND
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lineEmail">อีเมล</Label>
          <Input
            id="lineEmail"
            type="email"
            placeholder="example@email.com"
            value={lineEmailInput}
            onChange={(e) => setLineEmailInput(e.target.value)}
          />
        </div>

        {lineError && <p className="text-sm text-destructive">{lineError}</p>}

        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={isLinePending}
          onClick={handleLineEmailSubmit}
        >
          {isLinePending ? 'กำลังบันทึก...' : 'บันทึกอีเมล'}
        </Button>
      </div>
    );
  }

  if (step === 'line-verify') {
    return (
      <div className="flex w-full flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            ยืนยันอีเมลของคุณ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            เราได้ส่งรหัส OTP ไปยัง {lineEmail} กรุณากรอกรหัส 6
            หลักเพื่อยืนยันบัญชี
          </p>
        </div>

        <OtpBoxes value={otp} onChange={setOtp} />

        {otpError && <p className="text-sm text-destructive">{otpError}</p>}
        {resendMessage && (
          <p className="text-sm text-primary">{resendMessage}</p>
        )}

        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={isPending}
          onClick={handleLineVerifyOtp}
        >
          {isPending ? 'กำลังยืนยัน...' : 'ยืนยันอีเมล'}
        </Button>

        <button
          type="button"
          onClick={handleResendLineOtp}
          disabled={isResending || resendCooldown.isActive}
          className="text-center text-sm text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResending
            ? 'กำลังส่ง...'
            : resendCooldown.isActive
              ? `ส่งรหัสยืนยันอีกครั้งใน ${resendCooldown.remaining} วินาที`
              : 'ส่งรหัสยืนยันอีกครั้ง'}
        </button>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="flex w-full flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            ยืนยันการเข้าสู่ระบบ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            เราได้ส่งรหัส OTP ไปยังอีเมลของคุณ กรุณากรอกรหัส 6
            หลักเพื่อเข้าสู่ระบบ
          </p>
        </div>

        <OtpBoxes value={otp} onChange={setOtp} />

        {otpError && <p className="text-sm text-destructive">{otpError}</p>}
        {resendMessage && (
          <p className="text-sm text-primary">{resendMessage}</p>
        )}

        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={isPending}
          onClick={handleVerifyOtp}
        >
          {isPending ? 'กำลังยืนยัน...' : 'ยืนยันรหัส OTP'}
        </Button>

        <button
          type="button"
          onClick={handleResendTwoFactorOtp}
          disabled={isResending || resendCooldown.isActive}
          className="text-center text-sm text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResending
            ? 'กำลังส่ง...'
            : resendCooldown.isActive
              ? `ส่งรหัสยืนยันอีกครั้งใน ${resendCooldown.remaining} วินาที`
              : 'ส่งรหัสยืนยันอีกครั้ง'}
        </button>

        <button
          type="button"
          onClick={() => setStep('login')}
          className="text-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← กลับไปเข้าสู่ระบบใหม่
        </button>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
      />
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">เข้าสู่ระบบ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ยินดีต้อนรับกลับมา!
            กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบตามหาสัตว์เลี้ยงหาย
          </p>
        </div>

        {formError && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        {googleNotice && (
          <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
            {googleNotice}
          </p>
        )}

        {lineNotice && (
          <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
            {lineNotice}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">อีเมล</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="กรอกรหัสผ่านของคุณ"
              className="pr-10"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              className="absolute top-1/2 right-1 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
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
          disabled={isGooglePending || !googleReady}
          onClick={handleGoogleButtonClick}
        >
          <GoogleIcon className="size-4" />
          {isGooglePending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
        </Button>

        <Button
          type="button"
          size="lg"
          className="w-full bg-[#06C755] text-white hover:bg-[#05b34c]"
          disabled={isLinePending}
          onClick={handleLineButtonClick}
        >
          <LineIcon className="size-4" />
          {isLinePending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย LINE'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{' '}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </form>
    </>
  );
}
