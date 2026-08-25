import { Metadata } from 'next';

import { ReportsTable } from './_components/reports-table';
import { getReportsAction } from '@/lib/action/admin.action';

export const metadata: Metadata = {
  title: 'จัดการรายงาน | Admin',
};

/**
 * ReportManage (Server Component)
 * - หน้าจัดการรายงานเนื้อหาไม่เหมาะสม (Content Report) จากชุมชนคนรักสัตว์
 * - ดึงข้อมูลทั้งหมดจาก Backend endpoint `GET /admin/reports` (ยังไม่รองรับ pagination/filter)
 *   แล้วส่งต่อให้ `ReportsTable` (Client Component) จัดการกรองสถานะและตรวจสอบรายงานต่อ
 */
export default async function ReportManage() {
  const result = await getReportsAction();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          จัดการรายงานความไม่เหมาะสม
        </h1>
        <p className="text-sm text-muted-foreground">
          ตรวจสอบรายงานโพสต์และคอมเมนต์ในชุมชนที่ผู้ใช้งานแจ้งเข้ามา
        </p>
      </div>

      {'success' in result ? (
        // Error State: เรียก API รายการรายงานไม่สำเร็จ
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center">
          <span className="text-sm font-medium text-destructive">
            ไม่สามารถโหลดรายการรายงานได้
          </span>
          <p className="text-xs text-muted-foreground">{result.message}</p>
        </div>
      ) : result.reports.length === 0 ? (
        // Empty State: ยังไม่มีรายงานเข้ามาในระบบ
        <div className="flex h-40 items-center justify-center rounded-3xl border border-border bg-card text-sm text-muted-foreground">
          ยังไม่มีรายงานเข้ามาในระบบ
        </div>
      ) : (
        <ReportsTable reports={result.reports} />
      )}
    </div>
  );
}
