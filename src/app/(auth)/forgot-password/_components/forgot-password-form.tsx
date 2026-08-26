'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { forgotPasswordAction } from '../_actions/forgot-password.actions';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await forgotPasswordAction(values);

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    setSent(true);
  });

  if (sent) {
    return (
      <div className="flex w-full flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            ตรวจสอบอีเมลของคุณ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            หากอีเมลนี้มีอยู่ในระบบ
            เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว
            กรุณาตรวจสอบกล่องข้อความของคุณ
          </p>
        </div>

        <Link
          href="/login"
          className="text-center text-sm font-medium text-primary hover:underline"
        >
          ← กลับไปเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ลืมรหัสผ่าน?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ
        </p>
      </div>

      {formError && (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
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

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'กำลังส่งลิงก์...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
      </Button>

      <Link
        href="/login"
        className="text-center text-sm text-muted-foreground hover:text-foreground"
      >
        ← กลับไปเข้าสู่ระบบ
      </Link>
    </form>
  );
}
