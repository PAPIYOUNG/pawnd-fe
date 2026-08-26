'use server';

import { redirect } from 'next/navigation';

import { auth, signOut } from '@/auth';
import { logoutRequest } from '@/services/auth.service';

export async function logoutAction() {
  const session = await auth();

  if (session?.refreshToken) {
    try {
      await logoutRequest(session.refreshToken);
    } catch {
      // ไม่ block การ logout ฝั่ง client แม้ revoke token ฝั่ง backend จะล้มเหลว
    }
  }

  await signOut({ redirect: false });
  redirect('/login');
}
