import { UserRole } from './auth';
import { UserStatus } from './user';
import { PetGender, PetType, PostStatus, PostType } from './post';

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

/**
 * AdminUserListItem
 * - ข้อมูลผู้ใช้งาน 1 รายการในตาราง "จัดการผู้ใช้งาน" ของแอดมิน
 * - ตรงตาม select fields ของ Backend endpoint `GET /admin/users`
 */
export interface AdminUserListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetUsersResponse {
  users: AdminUserListItem[];
  pagination: PaginationMeta;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  status?: UserStatus;
  role?: UserRole;
  search?: string;
}

/**
 * AdminUserDetail
 * - ข้อมูลผู้ใช้งานแบบละเอียด 1 คน จาก Backend endpoint `GET /admin/users/:id`
 */
export interface AdminUserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  lineId: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt: string | null;
  notificationEnabled: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    pets: number;
    petPosts: number;
    communityPosts: number;
    submittedContentReports: number;
  };
}

export interface GetUserByIdResponse {
  user: AdminUserDetail;
}

/**
 * UpdateUserStatusResult
 * - ผลลัพธ์จาก Backend endpoint `PATCH /admin/users/:id/status`
 */
export interface UpdateUserStatusResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  updatedAt: string;
}

export interface UpdateUserStatusResponse {
  user: UpdateUserStatusResult;
}

/**
 * AdminPostListItem
 * - ข้อมูลประกาศ Lost/Found 1 รายการในตาราง "จัดการประกาศ" ของแอดมิน
 * - ตรงตาม select fields ของ Backend endpoint `GET /admin/posts`
 * - `images` มีสูงสุด 1 รูป (รูปปกที่ sortOrder น้อยที่สุด) ใช้เป็นภาพตัวอย่างในตาราง
 */
export interface AdminPostListItem {
  id: string;
  type: PostType;
  status: PostStatus;
  petName: string;
  petType: PetType;
  breed: string | null;
  province: string | null;
  eventDate: string | null;
  viewCount: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  images: { imageUrl: string }[];
}

export interface GetPostsResponse {
  posts: AdminPostListItem[];
  pagination: PaginationMeta;
}

export interface GetPostsParams {
  page?: number;
  limit?: number;
  type?: PostType;
  status?: PostStatus;
  province?: string;
  search?: string;
}

/**
 * UpdatePostStatusResult
 * - ผลลัพธ์จาก Backend endpoint `PATCH /admin/posts/:id`
 */
export interface UpdatePostStatusResult {
  id: string;
  type: PostType;
  status: PostStatus;
  petName: string;
  userId: string;
  updatedAt: string;
}

export interface UpdatePostStatusResponse {
  post: UpdatePostStatusResult;
}

/**
 * AdminPostDetail
 * - ข้อมูลประกาศ Lost/Found แบบละเอียด 1 รายการ จาก Backend endpoint `GET /admin/posts/:id`
 * - `rewardAmount` เป็น Prisma Decimal ซึ่งถูก serialize เป็น string เสมอเมื่อส่งผ่าน JSON
 * - `currentLocation` เป็น free-text string ที่ผู้ใช้พิมพ์เอง (เช่น "พบล่าสุดแถวสวนลุมพินี")
 *   ไม่มีความสัมพันธ์กับ `latitude`/`longitude` ซึ่งเป็นคนละฟิลด์
 */
export interface AdminPostDetail {
  id: string;
  type: PostType;
  status: PostStatus;
  petName: string;
  petType: PetType;
  breed: string | null;
  gender: PetGender | null;
  color: string | null;
  distinctiveFeatures: string | null;
  description: string | null;
  eventDate: string | null;
  latitude: number | null;
  longitude: number | null;
  province: string | null;
  district: string | null;
  subdistrict: string | null;
  locationDescription: string | null;
  rewardAmount: string | null;
  currentLocation: string | null;
  contactPhone: string | null;
  contactLineId: string | null;
  contactEmail: string | null;
  viewCount: number;
  reunitedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  pet: {
    id: string;
    name: string;
  } | null;
  images: {
    id: string;
    imageUrl: string;
    sortOrder: number;
  }[];
}

export interface GetPostByIdResponse {
  post: AdminPostDetail;
}
