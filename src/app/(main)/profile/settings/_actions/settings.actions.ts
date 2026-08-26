'use server';

import { revalidatePath } from 'next/cache';
import { updateUserSettings, changePassword } from '@/services/user.service';

/**
 * Server Action สำหรับบันทึกการตั้งค่าการแจ้งเตือนและ 2FA
 */
export async function saveSettingsAction(settings: {
  notificationEnabled?: boolean;
  twoFactorEnabled?: boolean;
}) {
  try {
    const result = await updateUserSettings(settings);
    revalidatePath('/profile/settings');
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, data: result.settings };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถบันทึกการตั้งค่าได้';
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
    return { success: false, error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' };
  }
  if (formData.newPassword !== formData.confirmPassword) {
    return { success: false, error: 'รหัสผ่านยืนยันไม่ตรงกับรหัสผ่านใหม่' };
  }

  try {
    const result = await changePassword(formData.oldPassword, formData.newPassword);
    return { success: true, message: result.message || 'เปลี่ยนรหัสผ่านสำเร็จ' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนรหัสผ่านได้';
    return { success: false, error: message };
  }
}
