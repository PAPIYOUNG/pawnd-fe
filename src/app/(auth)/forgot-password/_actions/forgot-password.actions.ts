'use server';

import { ApiError } from '@/lib/api/api-error';
import { ErrorActionResult } from '@/lib/action/action.type';
import {
  forgotPasswordRequest,
  ForgotPasswordPayload,
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

type ForgotPasswordActionResult = ErrorActionResult | { success: true };

export async function forgotPasswordAction(
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordActionResult> {
  try {
    await forgotPasswordRequest(payload);
  } catch (err) {
    return toErrorResult(
      err,
      'ส่งลิงก์รีเซ็ตรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
    );
  }

  return { success: true };
}
