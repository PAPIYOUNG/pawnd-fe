import { Metadata } from 'next';
import Image from 'next/image';

import { AuthAside } from '@/components/auth/AuthAside';

import { ForgotPasswordForm } from './_components/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot Password',
};

export default function ForgotPasswordPage() {
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
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
