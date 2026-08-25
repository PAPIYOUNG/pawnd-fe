import { authFetch } from '@/lib/api/auth-fetch';
import { DashboardSummary } from '@/types/admin';

export const AdminApi = {
  // ดึงข้อมูลสรุปภาพรวมสำหรับหน้าแดชบอร์ดผู้ดูแลระบบ
  async dashboardSummary() {
    return await authFetch<DashboardSummary>('/admin/dashboard', {
      method: 'GET',
    });
  },
};
