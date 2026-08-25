/**
 * DashboardSummary
 * - รูปแบบข้อมูลสรุปภาพรวมที่ได้จาก Backend endpoint `GET /admin/dashboard`
 * - ใช้แสดงผลในการ์ดสถิติ (StatCard) ของหน้าแดชบอร์ดผู้ดูแลระบบ
 * - ค่า `*ChangePercent` เป็นเปอร์เซ็นต์การเปลี่ยนแปลงเทียบกับช่วงเวลาก่อนหน้า
 *   (ค่าบวก = เพิ่มขึ้น, ค่าลบ = ลดลง)
 */
export interface DashboardSummary {
  totalUsers: number;
  totalUsersChangePercent: number;
  totalPosts: number;
  totalPostsChangePercent: number;
  pendingReports: number;
  pendingReportsChangePercent: number;
  newMembersToday: number;
  newMembersTodayChangePercent: number;
}
