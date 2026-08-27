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
  status?: 'ACTIVE' | 'REUNITED' | 'CLOSED' | 'HIDDEN' | 'DELETED';
  petName?: string;
  petType?: 'DOG' | 'CAT' | 'BIRD' | 'HAMSTER' | 'EXOTIC' | 'OTHER';
  breed?: string | null;
  gender?: string | null;
  color?: string | null;
  province?: string;
  district?: string | null;
  subdistrict?: string | null;
  locationDescription?: string | null;
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
  district?: string | null;
  coverImageUrl?: string | null;
  reunitedAt?: string;
}

/**
 * ค่าเริ่มต้นสถิติหน้าแรก (Default Summary Stats)
 * ใช้เมื่อ Backend ส่งค่าว่างหรือยังไม่มีข้อมูล
 */
export const DEFAULT_STATS: SummaryStats = {
  totalLost: 0,
  totalFound: 0,
  totalReunited: 0,
  totalUsers: 0,
};

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
    return response.stats || DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
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
      const cleanDistrict = sanitizeText(p.district, '');
      const cleanProvince = sanitizeText(p.province, '');
      const cleanDesc = sanitizeText(p.locationDescription, '');

      // จัดรูปแบบการแสดงผลสถานที่: แสดง "เขต/อำเภอ, จังหวัด" เช่น "พระนคร, กรุงเทพมหานคร" หรือ "Chatuchak, Bangkok"
      let locationDisplay = cleanDesc;
      if (!locationDisplay) {
        if (cleanDistrict && cleanProvince) {
          locationDisplay = `${cleanDistrict}, ${cleanProvince}`;
        } else if (cleanProvince) {
          locationDisplay = cleanProvince;
        } else if (cleanDistrict) {
          locationDisplay = cleanDistrict;
        } else {
          locationDisplay = 'ไม่ระบุสถานที่';
        }
      }

      return {
        id: p.id,
        type: postType,
        status: p.status || 'ACTIVE',
        petName: resolvePetName(p.petName, postType),
        petType: p.petType || 'OTHER',
        breed: cleanBreed || typeStr,
        ageDescription: breedOrType,
        district: cleanDistrict || undefined,
        province: cleanProvince || 'ไม่ระบุจังหวัด',
        locationDetail: locationDisplay,
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
      return [];
    }

    // Map ข้อมูลจาก Backend DTO → ReunitedStory ที่ Frontend UI ใช้
    return response.posts.map((p: ApiReunitedPost) => {
      const cleanName = sanitizeText(p.petName, 'น้องสัตว์เลี้ยง');
      const cleanDistrict = sanitizeText(p.district, '');
      const cleanProvince = sanitizeText(p.province, 'กรุงเทพฯ');
      const location =
        cleanDistrict && cleanProvince
          ? `${cleanDistrict}, ${cleanProvince}`
          : cleanProvince;

      return {
        id: p.id,
        petName: cleanName,
        ownerName: `คุณ ${cleanName}`,
        quote:
          'ขอบคุณพลังของคอมมูนิตี้และระบบ Pawnd ที่ช่วยให้เราได้พบกันอีกครั้งอย่างปลอดภัยครับ',
        province: location,
        coverImageUrl:
          p.coverImageUrl ||
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
        reunitedAt: p.reunitedAt,
        detailUrl: `/posts/${p.id}`,
      };
    });
  } catch {
    return [];
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
