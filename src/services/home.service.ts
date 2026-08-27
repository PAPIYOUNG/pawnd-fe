import { HomePageData, ReunitedStory, SummaryStats } from '@/types/home';
import { LatestPostItem } from '@/types/post';
import { apiFetch } from '@/lib/api/api-fetch';

/**
 * Home Service — ดึงข้อมูลสำหรับหน้าแรก (Homepage)
 * ใช้ apiFetch สำหรับ public endpoints (ไม่ต้อง login)
 * apiFetch จะ unwrap { success, data } อัตโนมัติ
 *
 * หมายเหตุ: Backend /home endpoints ส่ง data ในรูปแบบ:
 * - /home/stats → { stats: { totalLost, totalFound, totalReunited, totalUsers } }
 * - /home/latest → { posts: [...] }
 * - /home/reunited → { posts: [...] }
 * ดังนั้นหลัง unwrap ต้อง access .stats หรือ .posts อีกชั้น
 */

/** Interface สำหรับ response จาก GET /home/stats (หลัง unwrap { success, data }) */
interface HomeStatsResponse {
  stats: SummaryStats;
}

/** Interface สำหรับ response จาก GET /home/latest (หลัง unwrap) */
interface HomeLatestResponse {
  posts: ApiLatestPost[];
}

/** Interface สำหรับ response จาก GET /home/reunited (หลัง unwrap) */
interface HomeReunitedResponse {
  posts: ApiReunitedPost[];
}

/** ข้อมูลโพสต์ล่าสุดตามที่ Backend ส่งกลับมาจริง */
interface ApiLatestPost {
  id: string;
  type?: 'LOST' | 'FOUND';
  petName?: string;
  petType?: 'DOG' | 'CAT' | 'BIRD' | 'HAMSTER' | 'EXOTIC' | 'OTHER';
  breed?: string | null;
  gender?: string | null;
  color?: string | null;
  province?: string;
  coverImageUrl?: string | null;
  createdAt?: string;
}

/** ข้อมูลโพสต์ที่กลับบ้านแล้วตามที่ Backend ส่งกลับมาจริง */
interface ApiReunitedPost {
  id: string;
  petName?: string;
  petType?: string;
  breed?: string;
  province?: string;
  coverImageUrl?: string | null;
  reunitedAt?: string;
}

/**
 * ข้อมูลจำลองสถิติหน้าแรก (Mock Summary Stats)
 * ใช้เป็น Fallback เมื่อยังไม่เปิด Backend Server หรือต่อ API ไม่สำเร็จ
 */
export const MOCK_STATS: SummaryStats = {
  totalLost: 1247,
  totalFound: 892,
  totalReunited: 634,
  totalUsers: 5230,
};

/**
 * ข้อมูลจำลองประกาศสัตว์เลี้ยงล่าสุด 8 รายการ (Mock Latest Posts)
 * รวมรูปภาพความคมชัดสูงและสายพันธุ์ที่หลากหลายสำหรับ Infinite Carousel
 */
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
    ageDescription: 'เปอร์เซีย ขนยาลสีขาวครีม อายุ 2 ปี',
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

/**
 * ข้อมูลจำลองเรื่องราวความสำเร็จพาสัตว์เลี้ยงกลับบ้าน (Mock Reunited Stories)
 */
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

/**
 * ดึงข้อมูลสรุปสถิติภาพรวมของระบบ (GET /home/stats)
 * Endpoint นี้เป็น public ไม่ต้อง login — ใช้ apiFetch โดยไม่ต้องส่ง token
 * Backend ส่ง { success, data: { stats: {...} } } → apiFetch unwrap ได้ { stats: {...} }
 */
export async function getHomeStats(): Promise<SummaryStats> {
  try {
    const response = await apiFetch<HomeStatsResponse>('/home/stats', {
      next: { revalidate: 60 },
    });
    return response.stats || MOCK_STATS;
  } catch {
    return MOCK_STATS;
  }
}

/**
 * แปลงค่าวันที่ ISO string เป็นข้อความ Relative Time ภาษาไทย
 */
function formatRelativeTimeThai(dateString?: string): string {
  if (!dateString) return 'เมื่อไม่นานมานี้';
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffMinutes < 1) return 'เมื่อสักครู่';
  if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'เมื่อวานนี้';
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  return new Date(dateString).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * แปลงรหัสชนิดสัตว์เลี้ยงเป็นภาษาไทย
 */
function getPetTypeThai(type?: string): string {
  switch (type) {
    case 'DOG':
      return 'สุนัข';
    case 'CAT':
      return 'แมว';
    case 'BIRD':
      return 'นก';
    case 'HAMSTER':
      return 'หนูแฮมสเตอร์';
    case 'EXOTIC':
      return 'สัตว์เลี้ยงพิเศษ';
    default:
      return 'สัตว์เลี้ยง';
  }
}

/**
 * ตรวจสอบและทำความสะอาดข้อความ ป้องกันกรณีที่เป็นค่าว่าง, 'Unknown', หรือประกอบด้วยเครื่องหมาย '?' ล้วน
 */
function sanitizeText(value?: string | null, fallback = ''): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  // ตรวจสอบว่าเป็นสตริงว่าง, ข้อความ 'unknown' (ไม่สนใจตัวพิมพ์เล็กใหญ่) หรือเป็นเครื่องหมาย ? หรือ ？ ล้วน
  if (
    trimmed === '' ||
    trimmed.toLowerCase() === 'unknown' ||
    /^[\s?？]+$/.test(trimmed)
  ) {
    return fallback;
  }
  return trimmed;
}

/**
 * แปลงชื่อสัตว์เลี้ยงให้เหมาะสมตามประเภทประกาศ
 * - ถ้าเป็น FOUND (พบสัตว์พลัดหลง) และไม่มีชื่อ ให้แสดง "ไม่ทราบชื่อ"
 * - ถ้าเป็น LOST (สัตว์หาย) และไม่มีชื่อ ให้แสดง "สัตว์เลี้ยง (ไม่ระบุชื่อ)"
 */
function resolvePetName(
  rawName?: string | null,
  postType?: 'LOST' | 'FOUND',
): string {
  const defaultName =
    postType === 'FOUND' ? 'ไม่ทราบชื่อ' : 'สัตว์เลี้ยง (ไม่ระบุชื่อ)';
  return sanitizeText(rawName, defaultName);
}

/**
 * ดึงข้อมูลประกาศตามหาและพบสัตว์ล่าสุด (GET /home/latest)
 * Backend ส่ง { success, data: { posts: [...] } } → apiFetch unwrap ได้ { posts: [...] }
 * จากนั้น map ข้อมูลจาก Backend DTO เป็น LatestPostItem ที่ UI ใช้
 */
export async function getLatestPosts(limit = 8): Promise<LatestPostItem[]> {
  try {
    const response = await apiFetch<HomeLatestResponse>(
      `/home/latest?limit=${limit}`,
      {
        next: { revalidate: 30 },
      },
    );

    if (!response.posts || response.posts.length === 0) {
      return [];
    }

    // Map ข้อมูลจริงจาก Backend DTO → LatestPostItem ที่ Frontend UI ใช้
    return response.posts.map((p: ApiLatestPost, idx: number) => {
      const typeStr = getPetTypeThai(p.petType);
      const postType = p.type || (idx % 2 === 0 ? 'LOST' : 'FOUND');
      const cleanBreed = sanitizeText(p.breed, '');
      const breedOrType = cleanBreed ? `${typeStr} • ${cleanBreed}` : typeStr;
      const cleanProvince = sanitizeText(p.province, 'ไม่ระบุจังหวัด');

      return {
        id: p.id,
        type: postType,
        petName: resolvePetName(p.petName, postType),
        petType: p.petType || 'OTHER',
        breed: cleanBreed || typeStr,
        ageDescription: breedOrType,
        province: cleanProvince,
        locationDetail: cleanProvince,
        timeAgo: formatRelativeTimeThai(p.createdAt),
        coverImageUrl:
          p.coverImageUrl ||
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop',
        createdAt: p.createdAt || new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}

/**
 * ดึงข้อมูลเรื่องราวความสำเร็จพาสัตว์เลี้ยงกลับบ้าน (GET /home/reunited)
 * Backend ส่ง { success, data: { posts: [...] } } → apiFetch unwrap ได้ { posts: [...] }
 */
export async function getReunitedStories(limit = 3): Promise<ReunitedStory[]> {
  try {
    const response = await apiFetch<HomeReunitedResponse>(
      `/home/reunited?limit=${limit}`,
      {
        next: { revalidate: 60 },
      },
    );

    if (!response.posts || response.posts.length === 0) {
      return MOCK_REUNITED_STORIES;
    }

    // Map ข้อมูลจาก Backend DTO → ReunitedStory ที่ Frontend UI ใช้
    return response.posts.map((p: ApiReunitedPost, idx: number) => {
      const cleanName = sanitizeText(p.petName, 'น้องสัตว์เลี้ยง');
      return {
        id: p.id,
        petName: cleanName,
        ownerName: `คุณ ${cleanName}`,
        quote:
          'ขอบคุณพลังของคอมมูนิตี้และระบบ Pawnd ที่ช่วยให้เราได้พบกันอีกครั้งอย่างปลอดภัยครับ',
        province: sanitizeText(p.province, 'กรุงเทพฯ'),
        coverImageUrl:
          p.coverImageUrl ||
          MOCK_REUNITED_STORIES[idx % MOCK_REUNITED_STORIES.length]
            .coverImageUrl,
        reunitedAt: p.reunitedAt,
        detailUrl: `/posts/${p.id}`,
      };
    });
  } catch {
    return MOCK_REUNITED_STORIES;
  }
}

/**
 * ดึงข้อมูลรวมทั้งหมดสำหรับหน้าแรก (HomePageData Fetcher)
 * ดึงข้อมูล 3 ส่วนพร้อมกัน: สถิติ, ประกาศล่าสุด, เรื่องราวกลับบ้าน
 */
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
