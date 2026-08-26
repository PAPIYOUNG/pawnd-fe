'use server';

import { redirect } from 'next/navigation';

import { signOut } from '@/auth';
import {
  updateUserSettings,
  changePassword,
  deleteAccount,
} from '@/services/user.service';

/**
 * Server Action สำหรับบันทึกการตั้งค่าการแจ้งเตือนและ 2FA
 */
export async function saveSettingsAction(settings: {
  notificationEnabled?: boolean;
  twoFactorEnabled?: boolean;
}) {
  try {
    const result = await updateUserSettings(settings);
    return { success: true, data: result.settings };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถบันทึกการตั้งค่าได้';
    return { success: false, error: message };
  }
}

/**
 * Server Action สำหรับเปลี่ยนรหัสผ่าน
 */
export async function changePasswordAction(formData: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  if (!formData.oldPassword) {
    return { success: false, error: 'กรุณากรอกรหัสผ่านปัจจุบัน' };
  }
  if (!formData.newPassword || formData.newPassword.length < 8) {
    return {
      success: false,
      error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
    };
  }
  if (formData.newPassword !== formData.confirmPassword) {
    return { success: false, error: 'รหัสผ่านยืนยันไม่ตรงกับรหัสผ่านใหม่' };
  }

  try {
    const result = await changePassword(
      formData.oldPassword,
      formData.newPassword,
    );
    return {
      success: true,
      message: result.message || 'เปลี่ยนรหัสผ่านสำเร็จ',
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนรหัสผ่านได้';
    return { success: false, error: message };
  }
}

/**
 * Server Action สำหรับลบบัญชีผู้ใช้ถาวร (Anonymize)
 * Backend จะ revoke refresh token ให้เองในตัว — สำเร็จแล้วเคลียร์ session ฝั่ง client แล้ว redirect ไปหน้า login
 */
export async function deleteAccountAction(payload: {
  password?: string;
  confirmEmail?: string;
}) {
  if (!payload.password && !payload.confirmEmail) {
    return { success: false, error: 'กรุณากรอกข้อมูลยืนยันการลบบัญชี' };
  }

  try {
    await deleteAccount(payload);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'ไม่สามารถลบบัญชีได้ กรุณาลองใหม่อีกครั้ง';
    return { success: false, error: message };
  }

  await signOut({ redirect: false });
  redirect('/login');
}
