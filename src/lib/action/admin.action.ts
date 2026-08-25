import { AdminApi } from '@/lib/api/admin.api';
import { ApiError } from '@/lib/api/api-error';
import { ErrorActionResult } from '@/lib/api/types/action.type';
import { DashboardSummary } from '@/types/admin';

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
