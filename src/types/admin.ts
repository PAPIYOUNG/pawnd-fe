/**
 * DashboardSummary
 * - รูปแบบข้อมูลสรุปภาพรวมที่ได้จาก Backend endpoint `GET /admin/dashboard`
 * - ใช้แสดงผลในการ์ดสถิติ (StatCard) ของหน้าแดชบอร์ดผู้ดูแลระบบ
 * - หมายเหตุ: Backend ไม่ได้ส่งค่าเปอร์เซ็นต์การเปลี่ยนแปลง (trend) มาด้วย
 *   จึงแสดงเฉพาะจำนวนรวม ไม่มี Label เปรียบเทียบช่วงเวลาก่อนหน้า
 */
export interface DashboardSummary {
  users: {
    total: number;
    active: number;
    pendingVerification: number;
    suspended: number;
    blacklisted: number;
  };
  pets: {
    total: number;
  };
  posts: {
    total: number;
    lost: number;
    found: number;
    active: number;
    reunited: number;
    hidden: number;
  };
  community: {
    totalPosts: number;
    hiddenPosts: number;
    totalComments: number;
    hiddenComments: number;
  };
  reports: {
    total: number;
    pending: number;
    reviewed: number;
    actionTaken: number;
    recent: RecentPendingReport[];
  };
}

export interface RecentPendingReport {
  id: string;
  reportType: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * MonthlyTrendPoint
 * - รูปแบบข้อมูล 1 เดือนจาก Backend endpoint `GET /admin/dashboard/monthly-trend?year=<year>`
 * - `month` คือเลขเดือน 1-12, ค่าที่เหลือคือจำนวนโพสต์ Lost / Found / Reunited ของเดือนนั้น
 */
export interface MonthlyTrendPoint {
  month: number;
  lost: number;
  found: number;
  reunited: number;
}
