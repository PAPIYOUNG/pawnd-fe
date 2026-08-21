import { HomePageData, ReunitedStory, SummaryStats } from '@/types/home';
import { LatestPostItem } from '@/types/post';

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

export const MOCK_STATS: SummaryStats = {
  totalLost: 1247,
  totalFound: 892,
  totalReunited: 634,
  totalUsers: 5230,
};

export const MOCK_LATEST_POSTS: LatestPostItem[] = [
  {
    id: 'mock-1',
    type: 'LOST',
    petName: 'น้องส้มส้ม',
    petType: 'CAT',
    breed: 'พันธุ์ไทย',
    gender: 'MALE',
    ageDescription: 'แมวไทยเพศผู้ อายุ 1 ปี',
    province: 'กรุงเทพฯ',
    locationDetail: 'อ่อนนุช 46, กรุงเทพฯ',
    timeAgo: 'หายไป 2 ชั่วโมงที่แล้ว',
    coverImageUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    type: 'FOUND',
    petName: 'ไซบีเรียนเพศผู้สวมปลอกคอสีน้ำ...',
    petType: 'DOG',
    breed: 'ไซบีเรียน ฮัสกี้',
    gender: 'MALE',
    ageDescription: 'ไซบีเรียน ฮัสกี้ (อายุประมาณ 2-3 ปี)',
    province: 'นนทบุรี',
    locationDetail: 'ถ.เกษตร, นนทบุรี',
    timeAgo: 'พบเมื่อวานนี้ 18:30 น.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mock-3',
    type: 'LOST',
    petName: 'ช็อกโก้',
    petType: 'DOG',
    breed: 'พุดเดิ้ลทอย',
    gender: 'FEMALE',
    ageDescription: 'พุดเดิ้ลทอย เพศเมียสีน้ำตาลเข้ม',
    province: 'กรุงเทพฯ',
    locationDetail: 'ลาดพร้าว ซอย 101, กรุงเทพฯ',
    timeAgo: 'หายเมื่อวานนี้ 12:00 น.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 100000000).toISOString(),
  },
  {
    id: 'mock-4',
    type: 'FOUND',
    petName: 'แมวไทยสีขาวตาโต',
    petType: 'CAT',
    breed: 'พันธุ์ไทย',
    gender: 'FEMALE',
    ageDescription: 'พันธุ์ไทย เพศเมีย (ขนสั้น)',
    province: 'กรุงเทพฯ',
    locationDetail: 'ม.เกษตรฯ บางเขน',
    timeAgo: 'พบช่วงเที่ยงวันนี้',
    coverImageUrl:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'mock-5',
    type: 'LOST',
    petName: 'มิลค์กี้',
    petType: 'CAT',
    breed: 'เปอร์เซีย',
    gender: 'FEMALE',
    ageDescription: 'เปอร์เซีย ขนยาวสีขาวครีม อายุ 2 ปี',
    province: 'ชลบุรี',
    locationDetail: 'บางแสน สาย 2, ชลบุรี',
    timeAgo: 'หายไป 5 ชั่วโมงที่แล้ว',
    coverImageUrl:
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 20000000).toISOString(),
  },
  {
    id: 'mock-6',
    type: 'FOUND',
    petName: 'น้องบ๊อบบี้ คอร์กี้',
    petType: 'DOG',
    breed: 'เวลช์ คอร์กี้',
    gender: 'MALE',
    ageDescription: 'เวลช์ คอร์กี้ สวมปลอกคอสีส้ม',
    province: 'เชียงใหม่',
    locationDetail: 'นิมมานเหมินท์, เชียงใหม่',
    timeAgo: 'พบเมื่อ 4 ชั่วโมงก่อน',
    coverImageUrl:
      'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'mock-7',
    type: 'LOST',
    petName: 'ลัคกี้ โกลเด้น',
    petType: 'DOG',
    breed: 'โกลเด้น รีทรีฟเวอร์',
    gender: 'MALE',
    ageDescription: 'โกลเด้น รีทรีฟเวอร์ ขนสีทอง อายุ 3 ปี',
    province: 'ปทุมธานี',
    locationDetail: 'รังสิต คลอง 3, ปทุมธานี',
    timeAgo: 'หายเมื่อวานนี้ 09:00 น.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 90000000).toISOString(),
  },
  {
    id: 'mock-8',
    type: 'FOUND',
    petName: 'แมวสามสี ขี้อ้อน',
    petType: 'CAT',
    breed: 'พันธุ์ไทย สามสี',
    gender: 'FEMALE',
    ageDescription: 'แมวสามสี ลายเปรอะ เพศเมีย เชื่องมาก',
    province: 'สมุทรปราการ',
    locationDetail: 'สำโรงเหนือ, สมุทรปราการ',
    timeAgo: 'พบช่วงเช้าวันนี้',
    coverImageUrl:
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 25000000).toISOString(),
  },
];

export const MOCK_REUNITED_STORIES: ReunitedStory[] = [
  {
    id: 'story-1',
    petName: 'น้องลัคกี้',
    ownerName: 'คุณ สุภาพร',
    quote:
      'น้องหายไปเกือบสามสัปดาห์ แต่ขอบคุณระบบแจ้งเตือนของ Pawnd ที่ส่งการจับคู่ภาพถ่ายเข้ามา มีคนเจอและแจ้งเข้ามาว่าน้องอยู่ห่างไปแค่ 2 กิโลเมตร ดีใจมากๆ ค่ะ',
    province: 'กรุงเทพฯ',
    coverImageUrl:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
    detailUrl: '/posts/story-1',
  },
  {
    id: 'story-2',
    petName: 'กล้วยปิ้ง',
    ownerName: 'คุณ ปิยะพงษ์',
    quote:
      'คิดว่าจะไม่ได้เจออีกแล้ว แต่มีคนพบและถ่ายรูปลงระบบไว้ ข้อมูลแจ้งเตือนตรงกับพิกัดที่หาย เป๊ะมากจนแทบไม่น่าเชื่อ ขอบคุณ Pawnd ที่สร้างระบบช่วยเหลือขึ้นมาจริงๆ',
    province: 'นนทบุรี',
    coverImageUrl:
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop',
    detailUrl: '/posts/story-2',
  },
  {
    id: 'story-3',
    petName: 'โบกี้',
    ownerName: 'คุณ วินัย',
    quote:
      'เวลาเพียงไม่ถึง 24 ชั่วโมง เราได้รับเบาะแสว่ามีคนเจอน้องโบกี้ที่กำลังเดินอยู่แถวสวนสาธารณะ ดีใจที่น้องปลอดภัย ขอบคุณทุกๆ คนมากครับ',
    province: 'เชียงใหม่',
    coverImageUrl:
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=800&auto=format&fit=crop',
    detailUrl: '/posts/story-3',
  },
];

export async function getHomeStats(): Promise<SummaryStats> {
  try {
    const res = await fetch(`${API_BASE_URL}/home/stats`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return MOCK_STATS;
    const json = await res.json();
    return json.stats || MOCK_STATS;
  } catch {
    return MOCK_STATS;
  }
}

interface ApiLatestPost {
  id: string;
  type?: 'LOST' | 'FOUND';
  petName?: string;
  petType?: 'DOG' | 'CAT' | 'BIRD' | 'HAMSTER' | 'EXOTIC' | 'OTHER';
  breed?: string;
  province?: string;
  coverImageUrl?: string;
  createdAt?: string;
}

interface ApiReunitedPost {
  id: string;
  petName?: string;
  petType?: string;
  breed?: string;
  province?: string;
  coverImageUrl?: string;
  reunitedAt?: string;
}

export async function getLatestPosts(limit = 8): Promise<LatestPostItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/home/latest?limit=${limit}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return MOCK_LATEST_POSTS;
    const json = await res.json();
    if (!json.posts || json.posts.length === 0) {
      return MOCK_LATEST_POSTS;
    }
    return json.posts.map((p: ApiLatestPost, idx: number) => ({
      id: p.id,
      type: p.type || (idx % 2 === 0 ? 'LOST' : 'FOUND'),
      petName: p.petName || 'สัตว์เลี้ยง',
      petType: p.petType || 'DOG',
      breed: p.breed || 'ไม่ระบุสายพันธุ์',
      ageDescription: p.breed || 'ไม่ระบุข้อมูลเพิ่มเติม',
      province: p.province || 'กรุงเทพฯ',
      locationDetail: p.province ? `${p.province}` : 'กรุงเทพฯ',
      timeAgo: 'เมื่อไม่นานมานี้',
      coverImageUrl:
        p.coverImageUrl ||
        MOCK_LATEST_POSTS[idx % MOCK_LATEST_POSTS.length].coverImageUrl,
      createdAt: p.createdAt || new Date().toISOString(),
    }));
  } catch {
    return MOCK_LATEST_POSTS;
  }
}

export async function getReunitedStories(limit = 3): Promise<ReunitedStory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/home/reunited?limit=${limit}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return MOCK_REUNITED_STORIES;
    const json = await res.json();
    if (!json.posts || json.posts.length === 0) {
      return MOCK_REUNITED_STORIES;
    }
    return json.posts.map((p: ApiReunitedPost, idx: number) => ({
      id: p.id,
      petName: p.petName || 'น้องสัตว์เลี้ยง',
      ownerName: `คุณ ${p.petName || 'ผู้ใช้'}`,
      quote:
        'ขอบคุณพลังของคอมมูนิตี้และระบบ Pawnd ที่ช่วยให้เราได้พบกันอีกครั้งอย่างปลอดภัยครับ',
      province: p.province || 'กรุงเทพฯ',
      coverImageUrl:
        p.coverImageUrl ||
        MOCK_REUNITED_STORIES[idx % MOCK_REUNITED_STORIES.length].coverImageUrl,
      reunitedAt: p.reunitedAt,
      detailUrl: `/posts/${p.id}`,
    }));
  } catch {
    return MOCK_REUNITED_STORIES;
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  const [stats, latestPosts, reunitedStories] = await Promise.all([
    getHomeStats(),
    getLatestPosts(8),
    getReunitedStories(3),
  ]);

  return {
    stats,
    latestPosts,
    reunitedStories,
  };
}
