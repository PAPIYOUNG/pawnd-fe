import { authFetch } from '@/lib/api/auth-fetch';
import {
  DashboardSummary,
  GetUsersParams,
  GetUsersResponse,
  MonthlyTrendPoint,
} from '@/types/admin';

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
  // ดึงรายชื่อผู้ใช้งานทั้งหมดแบบแบ่งหน้า พร้อมรองรับ filter status/role/search
  async getUsers(params: GetUsersParams = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    if (params.role) query.set('role', params.role);
    if (params.search) query.set('search', params.search);

    const queryString = query.toString();
    return await authFetch<GetUsersResponse>(
      `/admin/users${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' },
    );
  },
};
