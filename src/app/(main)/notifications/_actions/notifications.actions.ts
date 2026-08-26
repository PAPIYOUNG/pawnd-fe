'use server';

import { revalidatePath } from 'next/cache';

import { markAsRead, markAllAsRead } from '@/services/notification.service';

/**
 * Server Action สำหรับทำเครื่องหมายว่าอ่านแล้วสำหรับการแจ้งเตือนรายการเดียว
 * เรียกจาก Client Component ตอนผู้ใช้กด/คลิกที่การ์ดแจ้งเตือนที่ยังไม่อ่าน
 */
export async function markAsReadAction(id: string) {
  try {
    await markAsRead(id);
    revalidatePath('/notifications');
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'ไม่สามารถทำเครื่องหมายว่าอ่านแล้วได้';
    return { success: false, error: message };
  }
}

/**
 * Server Action สำหรับทำเครื่องหมายว่าอ่านแล้วทั้งหมด
 * เรียกจากปุ่ม "อ่านทั้งหมดแล้ว" ที่ส่วนหัวของหน้า Notifications
 */
export async function markAllAsReadAction() {
  try {
    await markAllAsRead();
    revalidatePath('/notifications');
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'ไม่สามารถทำเครื่องหมายว่าอ่านทั้งหมดแล้วได้';
    return { success: false, error: message };
  }
}
