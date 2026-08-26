import { UserProfile } from '@/types/user';

interface UserProfileDetailsGridProps {
  user: UserProfile;
}

const ROLE_LABEL: Record<UserProfile['role'], string> = {
  USER: 'ผู้ใช้งานทั่วไป',
  ADMIN: 'ผู้ดูแลระบบ',
};

const STATUS_LABEL: Record<UserProfile['status'], string> = {
  PENDING_EMAIL_VERIFICATION: 'รอยืนยันอีเมล',
  ACTIVE: 'ใช้งานได้ปกติ',
  SUSPENDED: 'ถูกระงับการใช้งาน',
  BLACKLISTED: 'ถูกขึ้นบัญชีดำ',
  DELETED: 'ถูกลบบัญชี',
};

/**
 * UserProfileDetailsGrid Component (Server Component - RSC)
 * - แสดงข้อมูลดิบทุกฟิลด์ที่ได้จาก Backend GET /users/me (ยกเว้น notificationEnabled และ twoFactorEnabled
 *   ซึ่งเป็นการตั้งค่าระบบ ไปแสดงและจัดการที่หน้า /profile/settings แทน)
 * - แสดงผลเป็นกรอบสี่เหลี่ยม (Square Frame) แต่ละใบมีหัวข้อ (Title) และค่าข้อมูล (Data) กำกับ
 */
export function UserProfileDetailsGrid({ user }: UserProfileDetailsGridProps) {
  const createdAtFull = new Date(user.createdAt).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fields: { title: string; value: string }[] = [
    { title: 'รหัสผู้ใช้ (ID)', value: user.id },
    { title: 'ชื่อจริง', value: user.firstName },
    { title: 'นามสกุล', value: user.lastName },
    { title: 'อีเมล', value: user.email },
    { title: 'เบอร์โทรศัพท์', value: user.phone || 'ไม่ระบุ' },
    { title: 'LINE ID', value: user.lineId || 'ไม่ระบุ' },
    { title: 'ที่อยู่', value: user.address || 'ไม่ระบุ' },
    { title: 'ลิงก์รูปโปรไฟล์', value: user.avatarUrl || 'ไม่ระบุ' },
    { title: 'บทบาท', value: ROLE_LABEL[user.role] },
    { title: 'สถานะบัญชี', value: STATUS_LABEL[user.status] },
    { title: 'วันที่สมัครสมาชิก', value: createdAtFull },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-foreground">ข้อมูลบัญชีผู้ใช้งาน</h3>

      {/* กริดกรอบสี่เหลี่ยมแสดงหัวข้อและค่าข้อมูลแต่ละฟิลด์ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div
            key={field.title}
            className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs dark:border-border/60"
          >
            <span className="text-xs font-semibold text-muted-foreground">
              {field.title}
            </span>
            <span className="break-all text-sm font-bold text-foreground">
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
