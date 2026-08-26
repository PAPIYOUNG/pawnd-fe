'use server';

import { redirect } from 'next/navigation';

import { ApiError } from '@/lib/api/api-error';
import { ErrorActionResult } from '@/lib/api/types/action.type';

import {
  resetPasswordRequest,
  ResetPasswordPayload,
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

type ResetPasswordActionResult = ErrorActionResult | { success: true };

export async function resetPasswordAction(
  payload: ResetPasswordPayload,
): Promise<ResetPasswordActionResult> {
  try {
    await resetPasswordRequest(payload);
  } catch (err) {
    return toErrorResult(
      err,
      'รีเซ็ตรหัสผ่านไม่สำเร็จ ลิงก์อาจหมดอายุหรือไม่ถูกต้อง',
    );
  }

  redirect('/login');
}
