'use server';

import { redirect } from 'next/navigation';

import { signIn } from '@/auth';
import { ApiError } from '@/lib/api/api-error';
import { ErrorActionResult } from '@/lib/action/action.type';
import {
  loginRequest,
  verifyTwoFactorRequest,
  LoginPayload,
  VerifyTwoFactorPayload,
  getMeRequest,
} from '@/services/auth.service';
import { isOtpRequired, LoginTokensResponse } from '@/types/auth';

type LoginActionResult =
  | ErrorActionResult
  | { success: true; needsOtp: true; tempToken: string }
  | { success: true; needsOtp: false };

function toErrorResult(err: unknown, fallback: string): ErrorActionResult {
  if (err instanceof ApiError) {
    return {
      success: false,
      message: err.message,
      code: String(err.statusCode),
    };
  }
  return { success: false, message: fallback, code: 'UNKNOWN' };
}

async function establishSession(tokens: LoginTokensResponse) {
  await signIn('credentials', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: JSON.stringify(tokens.user),
    redirect: false,
  });
}

export async function loginAction(
  payload: LoginPayload,
): Promise<LoginActionResult> {
  let response;
  try {
    response = await loginRequest(payload);
  } catch (err) {
    return toErrorResult(err, 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
  }

  if (isOtpRequired(response)) {
    return { success: true, needsOtp: true, tempToken: response.tempToken };
  }

  await establishSession(response);
  redirect('/');
}

export async function verifyLoginOtpAction(
  payload: VerifyTwoFactorPayload,
): Promise<LoginActionResult> {
  let tokens;
  try {
    tokens = await verifyTwoFactorRequest(payload);
  } catch (err) {
    return toErrorResult(err, 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
  }

  let me;
  try {
    me = await getMeRequest(tokens.accessToken);
  } catch (err) {
    return toErrorResult(
      err,
      'ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง',
    );
  }

  await establishSession({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: me.user,
  });

  redirect('/');
}
