import { Metadata } from 'next';
import Image from 'next/image';

import { AuthAside } from '@/components/auth/AuthAside';

import { ResetPasswordForm } from './_components/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset Password',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-screen w-full">
      <AuthAside />

      <div className="flex w-full flex-1 flex-col">
        <div className="flex items-center gap-2 px-8 py-6">
          <Image
            src="/logo.png"
            alt="PAWND"
            width={28}
            height={28}
            className="size-7 rounded-full"
          />
          <span className="text-lg font-bold text-foreground">PAWND</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <p className="text-center text-sm text-destructive">
                ลิงก์ไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่อีกครั้ง
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
