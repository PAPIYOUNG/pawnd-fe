'use server';

import { ApiError } from '@/lib/api/api-error';
import type { ErrorActionResult } from '@/lib/action/action.type';
import {
  registerRequest,
  resendVerificationRequest,
  verifyEmailRequest,
  type RegisterPayload,
} from '@/services/auth.service';

type RegisterActionResult = ErrorActionResult | { success: true };

/** แปลง expected API error เป็นข้อความที่ Client Component แสดงได้ */
function toErrorResult(error: unknown, fallback: string): ErrorActionResult {
  if (error instanceof ApiError) {
    const message =
      error.statusCode === 409
        ? 'อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น'
        : error.message;
    return { success: false, message, code: String(error.statusCode) };
  }
  return { success: false, message: fallback, code: 'UNKNOWN' };
}

/** Server Action สมัครบัญชีโดยยืนยัน authentication/validation ที่ Backend อีกชั้น */
export async function registerAction(
  payload: RegisterPayload,
): Promise<RegisterActionResult> {
  try {
    await registerRequest(payload);
    return { success: true };
  } catch (error) {
    return toErrorResult(error, 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
  }
}

/** Server Action ยืนยันอีเมลด้วย OTP */
export async function verifyEmailAction(
  email: string,
  otp: string,
): Promise<RegisterActionResult> {
  try {
    await verifyEmailRequest(email, otp);
    return { success: true };
  } catch (error) {
    return toErrorResult(error, 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
  }
}

/** Server Action ขอ OTP ใหม่ โดย Backend จะยกเลิก OTP ชุดเดิม */
export async function resendVerificationAction(
  email: string,
): Promise<RegisterActionResult> {
  try {
    await resendVerificationRequest(email);
    return { success: true };
  } catch (error) {
    return toErrorResult(error, 'ไม่สามารถส่งรหัสใหม่ได้ กรุณาลองอีกครั้ง');
  }
}
