import { AdminApi } from '@/lib/api/admin.api';
import { ApiError } from '@/lib/api/api-error';
import { ErrorActionResult } from '@/lib/api/types/action.type';
import {
  DashboardSummary,
  GetUsersParams,
  GetUsersResponse,
  MonthlyTrendPoint,
} from '@/types/admin';

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
