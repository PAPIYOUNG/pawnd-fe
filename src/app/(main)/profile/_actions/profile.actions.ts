'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import {
  updateUserProfile,
  requestEmailChange,
  confirmEmailChange,
} from '@/services/user.service';

/**
 * ผลลัพธ์จากการประมวลผล Server Action ของหน้าโปรไฟล์
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action: แก้ไขข้อมูลโปรไฟล์ผู้ใช้ (ชื่อ, นามสกุล, เบอร์โทร, ที่อยู่)
 * ไม่รวมอีเมล (ต้องยืนยัน OTP ผ่าน requestEmailChangeAction / confirmEmailChangeAction แยกต่างหาก)
 * ไม่รวม role, status, createdAt, id ซึ่งห้ามแก้ไขจากฝั่งผู้ใช้งาน
 * และไม่รวม lineId เพราะ Backend DTO (UpdateProfileDto) ไม่รองรับฟิลด์นี้ (whitelist validation จะปฏิเสธทันที)
 */
export async function updateProfileAction(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}): Promise<ActionResponse> {
  if (!data.firstName?.trim()) {
    return { success: false, error: 'กรุณากรอกชื่อจริง' };
  }
  if (!data.lastName?.trim()) {
    return { success: false, error: 'กรุณากรอกนามสกุล' };
  }

  try {
    await updateUserProfile(data);
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    // redirect('/login') ใน authFetch จะ throw error พิเศษ (NEXT_REDIRECT) เมื่อ session หมดอายุ
    // ต้อง rethrow ก่อน ไม่งั้นจะโดน catch จับไว้และ Next.js จะ redirect ไม่ทำงาน
    unstable_rethrow(error);
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้';
    return { success: false, error: message };
  }
}

/**
 * Server Action: ขอเปลี่ยนอีเมล — ส่ง OTP ไปยังอีเมลใหม่ (ยังไม่เปลี่ยนอีเมลจริงจนกว่าจะยืนยันสำเร็จ)
 */
export async function requestEmailChangeAction(
  newEmail: string
): Promise<ActionResponse> {
  if (!newEmail?.trim()) {
    return { success: false, error: 'กรุณากรอกอีเมลใหม่' };
  }

  try {
    const result = await requestEmailChange(newEmail.trim());
    return { success: true, data: result.message };
  } catch (error) {
    unstable_rethrow(error);
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถส่งรหัส OTP ไปยังอีเมลใหม่ได้';
    return { success: false, error: message };
  }
}

/**
 * Server Action: ยืนยัน OTP เพื่อยืนยันการเปลี่ยนอีเมล — เมื่อสำเร็จ Backend จะอัปเดตอีเมลให้ทันที
 */
export async function confirmEmailChangeAction(
  otp: string
): Promise<ActionResponse> {
  if (!otp || otp.length !== 6) {
    return { success: false, error: 'กรุณากรอกรหัส OTP ให้ครบ 6 หลัก' };
  }

  try {
    const result = await confirmEmailChange(otp);
    revalidatePath('/profile');
    return { success: true, data: result.message };
  } catch (error) {
    unstable_rethrow(error);
    const message =
      error instanceof Error ? error.message : 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ';
    return { success: false, error: message };
  }
}
