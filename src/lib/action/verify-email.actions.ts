'use server';

import { redirect } from 'next/navigation';

import { ApiError } from '@/lib/api/api-error';
import { ErrorActionResult } from '@/lib/action/action.type';
import {
  verifyEmailRequest,
  resendVerificationRequest,
  VerifyEmailPayload,
  ResendVerificationPayload,
} from '@/services/auth.service';

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

type VerifyEmailActionResult = ErrorActionResult | { success: true };

export async function verifyEmailAction(
  payload: VerifyEmailPayload,
): Promise<VerifyEmailActionResult> {
  try {
    await verifyEmailRequest(payload);
  } catch (err) {
    return toErrorResult(err, 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
  }

  redirect('/login');
}

type ResendVerificationActionResult = ErrorActionResult | { success: true };

export async function resendVerificationAction(
  payload: ResendVerificationPayload,
): Promise<ResendVerificationActionResult> {
  try {
    await resendVerificationRequest(payload);
  } catch (err) {
    return toErrorResult(
      err,
      'ส่งรหัสยืนยันใหม่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
    );
  }

  return { success: true };
}
