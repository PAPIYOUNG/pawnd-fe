import { UserProfile } from '@/types/user';
import { MOCK_PETS } from './pet.service';

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

/**
 * Mock ข้อมูลโปรไฟล์ผู้ใช้งานจำลอง (ตรงตามภาพตัวอย่าง UI)
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
 */
export async function getCurrentUser(): Promise<UserProfile> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return MOCK_USER_PROFILE;
    return await res.json();
  } catch {
    return MOCK_USER_PROFILE;
  }
}
