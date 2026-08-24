import { redirect } from 'next/navigation';

import { apiFetch, ApiFetchOption } from '@/lib/api/api-fetch';
import { auth } from '@/auth';

export async function authFetch<T>(
  path: string,
  options: Omit<ApiFetchOption, 'token'> = {},
): Promise<T> {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return apiFetch<T>(path, {
    ...options,
    token: session.accessToken,
  });
}
