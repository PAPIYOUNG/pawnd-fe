'use server';

import { revalidatePath } from 'next/cache';

import { AdminApi } from '@/lib/api/admin.api';
import { ApiError } from '@/lib/api/api-error';
import { ErrorActionResult } from '@/lib/api/types/action.type';
import {
  DashboardSummary,
  GetUserByIdResponse,
  GetUsersParams,
  GetUsersResponse,
  MonthlyTrendPoint,
  UpdateUserStatusResponse,
} from '@/types/admin';
import { UserStatus } from '@/types/user';

// ดึงข้อมูลสรุปภาพรวมสำหรับหน้าแดชบอร์ดผู้ดูแลระบบ
// สำเร็จ -> คืนค่า DashboardSummary, ล้มเหลว -> คืนค่า ErrorActionResult ให้หน้าเพจแสดง Error State
export async function summaryAction(): Promise<
  DashboardSummary | ErrorActionResult
> {
  try {
    return await AdminApi.dashboardSummary();
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        code: 'API_ERROR',
      };
    }
    throw error;
  }
}

// ดึงข้อมูลกราฟแนวโน้มการโพสต์รายเดือน (Lost/Found/Reunited) ของปีที่ระบุ
// สำเร็จ -> คืนค่า MonthlyTrendPoint[], ล้มเหลว -> คืนค่า ErrorActionResult ให้หน้าเพจแสดง Error State
export async function monthlyTrendAction(
  year: number,
): Promise<MonthlyTrendPoint[] | ErrorActionResult> {
  try {
    return await AdminApi.monthlyTrend(year);
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        code: 'API_ERROR',
      };
    }
    throw error;
  }
}

// ดึงรายชื่อผู้ใช้งานสำหรับหน้าจัดการผู้ใช้งาน (แบบแบ่งหน้า)
// สำเร็จ -> คืนค่า GetUsersResponse, ล้มเหลว -> คืนค่า ErrorActionResult ให้หน้าเพจแสดง Error State
export async function getUsersAction(
  params: GetUsersParams = {},
): Promise<GetUsersResponse | ErrorActionResult> {
  try {
    return await AdminApi.getUsers(params);
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        code: 'API_ERROR',
      };
    }
    throw error;
  }
}

// ดึงข้อมูลผู้ใช้งานแบบละเอียด 1 คน สำหรับหน้ารายละเอียดผู้ใช้งาน
// สำเร็จ -> คืนค่า GetUserByIdResponse, ไม่พบผู้ใช้ -> code 'NOT_FOUND', ล้มเหลวอื่น -> code 'API_ERROR'
export async function getUserByIdAction(
  id: string,
): Promise<GetUserByIdResponse | ErrorActionResult> {
  try {
    return await AdminApi.getUserById(id);
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        code: error.statusCode === 404 ? 'NOT_FOUND' : 'API_ERROR',
      };
    }
    throw error;
  }
}

// เปลี่ยนสถานะบัญชีผู้ใช้งาน (เช่น ระงับบัญชี / ขึ้นบัญชีดำ / เปิดใช้งานอีกครั้ง)
// สำเร็จ -> revalidate หน้ารายชื่อ + หน้ารายละเอียดผู้ใช้งานคนนี้ แล้วคืนค่า UpdateUserStatusResponse
export async function updateUserStatusAction(
  id: string,
  status: UserStatus,
): Promise<UpdateUserStatusResponse | ErrorActionResult> {
  try {
    const result = await AdminApi.updateUserStatus(id, status);
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${id}`);
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        code: error.statusCode === 404 ? 'NOT_FOUND' : 'API_ERROR',
      };
    }
    throw error;
  }
}
