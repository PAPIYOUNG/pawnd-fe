import { unstable_rethrow } from 'next/navigation';

import { UserProfile } from '@/types/user';
import { authFetch } from '@/lib/api/auth-fetch';
import { MOCK_PETS } from './pet.service';

/**
 * User Service — จัดการข้อมูลผู้ใช้งานและการตั้งค่า
 * ใช้ authFetch สำหรับ endpoint ที่ต้อง login (ส่ง token อัตโนมัติ + unwrap response)
 *
 * หมายเหตุ: apiFetch จะ unwrap { success, data } อัตโนมัติ
 * แต่ Backend /users/me ส่ง data = { user: {...} } ดังนั้นต้อง access .user อีกชั้น
 */

/** Interface สำหรับ response ที่ได้จาก Backend GET /users/me (หลัง unwrap { success, data }) */
interface UserMeResponse {
  user: UserProfile;
}

/** Interface สำหรับ response ที่ได้จาก Backend PATCH /users/me/settings */
interface UpdateSettingsResponse {
  settings: {
    notificationEnabled: boolean;
    twoFactorEnabled: boolean;
  };
}

/** Interface สำหรับ response ที่ได้จาก Backend PATCH /users/me */
interface UpdateProfileResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    lineId: string | null;
    address: string | null;
    updatedAt: string;
  };
}

/**
 * Mock ข้อมูลโปรไฟล์ผู้ใช้งานจำลอง (ตรงตามภาพตัวอย่าง UI)
 * ใช้เป็น fallback เมื่อ Backend ไม่พร้อมใช้งาน
 */
export const MOCK_USER_PROFILE: UserProfile = {
  id: 'user-somchai-1',
  firstName: 'สมชาย',
  lastName: 'รักสัตว์',
  email: 'somchai.pets@gmail.com',
  phone: '081-234-XXXX',
  role: 'ADMIN',
  status: 'ACTIVE',
  verificationStatus: 'VERIFIED',
  avatarUrl:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
  notificationEnabled: true,
  twoFactorEnabled: true,
  createdAt: '2026-01-10T00:00:00.000Z',
  stats: {
    totalPets: 3,
    totalLostPosts: 5,
    totalReunited: 2,
  },
  pets: MOCK_PETS,
  postsHistory: [
    {
      id: 'post-hist-1',
      type: 'LOST',
      petName: 'ตามหาแมวสามสีพิกัดพญาไท',
      petType: 'CAT',
      breed: 'พันธุ์ไทย สามสี',
      province: 'กรุงเทพฯ',
      locationDetail: 'พญาไท, กรุงเทพฯ',
      timeAgo: '12 ต.ค. 2026',
      coverImageUrl:
        'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=300&auto=format&fit=crop',
      createdAt: '2026-10-12T08:00:00.000Z',
    },
    {
      id: 'post-hist-2',
      type: 'FOUND',
      petName: 'พบเห็นสุนัขไซบีเรียนคาดว่าหลงทาง',
      petType: 'DOG',
      breed: 'ไซบีเรียน ฮัสกี้',
      province: 'นนทบุรี',
      locationDetail: 'ถ.งามวงศ์วาน, นนทบุรี',
      timeAgo: '08 ต.ค. 2026',
      coverImageUrl:
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=300&auto=format&fit=crop',
      createdAt: '2026-10-08T14:30:00.000Z',
    },
    {
      id: 'post-hist-3',
      type: 'LOST',
      petName: 'ตามหาสุนัขพูเดิล ช็อกโก้',
      petType: 'DOG',
      breed: 'พุดเดิ้ลทอย',
      province: 'กรุงเทพฯ',
      locationDetail: 'ลาดพร้าว 101, กรุงเทพฯ',
      timeAgo: '25 ก.ย. 2026',
      coverImageUrl:
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=300&auto=format&fit=crop',
      createdAt: '2026-09-25T11:00:00.000Z',
    },
    {
      id: 'post-hist-4',
      type: 'LOST',
      petName: 'แมวเปอร์เซียหลุดหาย แถวดินแดง',
      petType: 'CAT',
      breed: 'เปอร์เซีย',
      province: 'กรุงเทพฯ',
      locationDetail: 'ดินแดง, กรุงเทพฯ',
      timeAgo: '12 ก.ย. 2026',
      coverImageUrl:
        'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=300&auto=format&fit=crop',
      createdAt: '2026-09-12T16:20:00.000Z',
    },
    {
      id: 'post-hist-5',
      type: 'FOUND',
      petName: 'พบน้องแมวจรพิกัดลาดพร้าวซอย 4',
      petType: 'CAT',
      breed: 'พันธุ์ไทย',
      province: 'กรุงเทพฯ',
      locationDetail: 'ลาดพร้าว ซอย 4, กรุงเทพฯ',
      timeAgo: '01 ก.ย. 2026',
      coverImageUrl:
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=300&auto=format&fit=crop',
      createdAt: '2026-09-01T09:15:00.000Z',
    },
  ],
};

/**
 * ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน (GET /users/me)
 * ใช้ authFetch เพื่อส่ง JWT token อัตโนมัติจาก NextAuth session
 * Backend ส่ง { success, data: { user: {...} } } → apiFetch unwrap ได้ { user: {...} }
 */
export async function getCurrentUser(): Promise<UserProfile> {
  try {
    const response = await authFetch<UserMeResponse>('/users/me');
    return response.user;
  } catch (err) {
    // redirect('/login') ใน authFetch จะ throw error พิเศษ (NEXT_REDIRECT)
    // ต้อง rethrow ก่อน ไม่งั้น Next.js จะ redirect ไม่ทำงานและตกลง catch ด้านล่างแทน
    unstable_rethrow(err);
    // Fallback เป็น mock data เมื่อ Backend ไม่พร้อมจริงๆ เท่านั้น
    return MOCK_USER_PROFILE;
  }
}

/**
 * อัปเดตข้อมูลโปรไฟล์ผู้ใช้ (PATCH /users/me)
 * @param data — ข้อมูลที่ต้องการแก้ไข (firstName, lastName, phone, lineId, address)
 * หมายเหตุ: ห้ามส่ง role, status, createdAt, id — Backend ไม่รับและ Frontend ก็ไม่ควรให้แก้ไขฟิลด์เหล่านี้
 * ส่วนอีเมลใช้ endpoint แยก (requestEmailChange / confirmEmailChange) เพราะต้องยืนยันตัวตนด้วย OTP ก่อน
 */
export async function updateUserProfile(
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    lineId?: string;
    address?: string;
  }
): Promise<UpdateProfileResponse> {
  return authFetch<UpdateProfileResponse>('/users/me', {
    method: 'PATCH',
    body: data as Record<string, unknown>,
  });
}

/**
 * ขอเปลี่ยนอีเมล (PATCH /users/me/email)
 * Backend จะสร้าง OTP และส่งไปยังอีเมลใหม่ (ยังไม่เปลี่ยนอีเมลจริงในฐานข้อมูลจนกว่าจะยืนยัน OTP สำเร็จ)
 * @param newEmail — อีเมลใหม่ที่ต้องการเปลี่ยนไปใช้
 */
export async function requestEmailChange(
  newEmail: string
): Promise<{ message: string }> {
  return authFetch<{ message: string }>('/users/me/email', {
    method: 'PATCH',
    body: { email: newEmail },
  });
}

/**
 * ยืนยัน OTP เพื่อยืนยันการเปลี่ยนอีเมล (POST /users/me/email/verify)
 * เมื่อสำเร็จ Backend จะอัปเดตอีเมลในฐานข้อมูลให้ทันที
 * @param otp — รหัส OTP 6 หลักที่ได้รับทางอีเมลใหม่
 */
export async function confirmEmailChange(
  otp: string
): Promise<{ message: string }> {
  return authFetch<{ message: string }>('/users/me/email/verify', {
    method: 'POST',
    body: { otp },
  });
}

/**
 * อัปเดตการตั้งค่าระบบ (PATCH /users/me/settings)
 * Backend DTO ใช้ key '2FAEnabled' สำหรับ two-factor authentication
 * @param notificationEnabled — เปิด/ปิดการแจ้งเตือน
 * @param twoFactorEnabled — เปิด/ปิดการยืนยันตัวตนสองชั้น
 */
export async function updateUserSettings(
  settings: {
    notificationEnabled?: boolean;
    twoFactorEnabled?: boolean;
  }
): Promise<UpdateSettingsResponse> {
  // แปลง key จาก frontend (twoFactorEnabled) เป็น backend format ('2FAEnabled')
  const backendPayload: Record<string, unknown> = {};
  if (settings.notificationEnabled !== undefined) {
    backendPayload.notificationEnabled = settings.notificationEnabled;
  }
  if (settings.twoFactorEnabled !== undefined) {
    backendPayload['2FAEnabled'] = settings.twoFactorEnabled;
  }

  return authFetch<UpdateSettingsResponse>('/users/me/settings', {
    method: 'PATCH',
    body: backendPayload,
  });
}

/**
 * เปลี่ยนรหัสผ่าน (PATCH /users/me/password)
 * @param oldPassword — รหัสผ่านปัจจุบัน
 * @param newPassword — รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  return authFetch<{ message: string }>('/users/me/password', {
    method: 'PATCH',
    body: { oldPassword, newPassword },
  });
}

/**
 * อัปโหลดรูปอวาตาร์ผู้ใช้ (PATCH /users/me/avatar)
 * ส่งเป็น FormData (multipart/form-data) ไฟล์ JPEG/PNG/WEBP ขนาดไม่เกิน 5MB
 */
export async function uploadAvatar(
  file: File
): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  return authFetch<{ avatarUrl: string }>('/users/me/avatar', {
    method: 'PATCH',
    body: formData as unknown as Record<string, unknown>,
  });
}
