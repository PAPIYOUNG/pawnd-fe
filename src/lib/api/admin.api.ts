import { authFetch } from '@/lib/api/auth-fetch';
import { DashboardSummary, MonthlyTrendPoint } from '@/types/admin';

export const AdminApi = {
  // ดึงข้อมูลสรุปภาพรวมสำหรับหน้าแดชบอร์ดผู้ดูแลระบบ
  async dashboardSummary() {
    return await authFetch<DashboardSummary>('/admin/dashboard', {
      method: 'GET',
    });
  },
  // ดึงข้อมูลจำนวนโพสต์ Lost/Found/Reunited แยกรายเดือนของปีที่ระบุ
  async monthlyTrend(year: number) {
    return await authFetch<MonthlyTrendPoint[]>(
      `/admin/dashboard/monthly-trend?year=${year}`,
      { method: 'GET' },
    );
  },
};
