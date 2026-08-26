import { unstable_rethrow } from 'next/navigation';

import { PetProfile, PetQrCode, PublicPetProfile } from '@/types/pet';
import { authFetch } from '@/lib/api/auth-fetch';
import { apiFetch } from '@/lib/api/api-fetch';
import { ApiError } from '@/lib/api/api-error';

/**
 * Pet Service — จัดการข้อมูลสัตว์เลี้ยงของผู้ใช้
 * ใช้ authFetch สำหรับ endpoint ที่ต้อง login (ส่ง token อัตโนมัติ + unwrap response)
 *
 * หมายเหตุ: Backend /pets endpoints ทั้งหมดต้องการ JWT Token (ไม่ใช่ public)
 * apiFetch จะ unwrap { success, data } อัตโนมัติ ได้ data ออกมาเป็น array หรือ object ตรงๆ
 */

/**
 * Mock ข้อมูลสัตว์เลี้ยงจำลองตรงตามดีไซน์ UI ต้นแบบ
 * ใช้เป็น fallback เมื่อ Backend ไม่พร้อมใช้งาน
 */
export const MOCK_PETS: PetProfile[] = [
  {
    id: 'pet-1',
    ownerId: 'user-somchai-1',
    name: 'Luna',
    type: 'CAT',
    breed: 'Siamese (วิเชียรมาศ)',
    gender: 'FEMALE',
    color: 'สีครีม ปลายหูและหางเข้ม',
    age: 2,
    distinctiveFeatures: 'ดวงตาสีฟ้าสดใส ปลายหูและจมูกสีน้ำตาลเข้ม ขี้อ้อน',
    description: 'แมวพันธุ์วิเชียรมาศ เพศเมีย สุขภาพแข็งแรง ทำหมันแล้ว ฉีดวัคซีนครบถ้วน',
    profileImageUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop',
    coverImageUrl:
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-08-20T10:30:00.000Z',
    qrCode: {
      id: 'qr-1',
      petId: 'pet-1',
      qrToken: 'qr_luna_pawnd_2026',
      qrImageUrl: null,
      publicProfileUrl: 'https://pawnd.co/pet/qr/qr_luna_pawnd_2026',
      isActive: true,
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-01-15T08:00:00.000Z',
    },
  },
  {
    id: 'pet-2',
    ownerId: 'user-somchai-1',
    name: 'น้องส้มส้ม',
    type: 'CAT',
    breed: 'แมวพันธุ์ไทยผสมเปอร์เซีย',
    gender: 'MALE',
    color: 'สีส้ม ลายเสือ',
    age: 1,
    distinctiveFeatures: 'ลายเสือสีส้มสด ขนแน่น สวมปลอกคอสีแดงพร้อมกระดิ่ง',
    description: 'แมวไทยลายส้ม นิสัยร่าเริง ชอบเล่นลูกบอล สุขภาพดีมาก',
    profileImageUrl:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=400&auto=format&fit=crop',
    coverImageUrl:
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-03-10T12:00:00.000Z',
    updatedAt: '2026-08-22T14:15:00.000Z',
    qrCode: {
      id: 'qr-2',
      petId: 'pet-2',
      qrToken: 'qr_somsom_pawnd_2026',
      qrImageUrl: null,
      publicProfileUrl: 'https://pawnd.co/pet/qr/qr_somsom_pawnd_2026',
      isActive: true,
      createdAt: '2026-03-10T12:00:00.000Z',
      updatedAt: '2026-03-10T12:00:00.000Z',
    },
  },
];

/**
 * ดึงรายการสัตว์เลี้ยงทั้งหมดของผู้ใช้ (GET /pets)
 * ใช้ authFetch เพื่อส่ง JWT token อัตโนมัติ
 * Backend ส่ง { success, data: { pets: [...] } } → apiFetch unwrap .data ให้ แต่ยังต้องแกะ .pets เองอีกชั้น
 */
export async function getMyPets(): Promise<PetProfile[]> {
  try {
    const { pets } = await authFetch<{ pets: PetProfile[] }>('/pets');
    // ถ้าได้ array ว่าง ให้แสดง mock แทนเพื่อ UX ที่ดี
    // return pets && pets.length > 0 ? pets : MOCK_PETS;
    return pets;
  } catch (err) {
    // redirect('/login') ใน authFetch จะ throw error พิเศษ (NEXT_REDIRECT)
    // ต้อง rethrow ก่อน ไม่งั้น Next.js จะ redirect ไม่ทำงานและตกลง catch ด้านล่างแทน
    unstable_rethrow(err);
    // Fallback เป็น mock data เมื่อ Backend ไม่พร้อมจริงๆ เท่านั้น
    // return MOCK_PETS;
    return [];
  }
}

/**
 * ดึงข้อมูลสัตว์เลี้ยงรายตัว (GET /pets/:id)
 * ใช้ authFetch เพราะ endpoint นี้ต้อง login (ตรวจสอบ ownership)
 * Backend ส่ง { success, data: { pet: {...} } } → ต้องแกะ .pet อีกชั้นหลัง apiFetch unwrap .data
 */
export async function getPetById(id: string): Promise<PetProfile | null> {
  try {
    const { pet } = await authFetch<{ pet: PetProfile }>(`/pets/${id}`);
    return pet;
  } catch (err) {
    // rethrow NEXT_REDIRECT (จาก authFetch เมื่อไม่มี session) ก่อน ไม่งั้น redirect จะไม่ทำงาน
    unstable_rethrow(err);
    // Fallback: ค้นหาจาก mock data
    // return MOCK_PETS.find((p) => p.id === id) || null;
    return null;
  }
}

/**
 * ดึงโปรไฟล์สัตว์เลี้ยงสาธารณะจาก QR Token (GET /pets/public/qr/:qrToken)
 * เป็น Public endpoint ไม่ต้องแนบ JWT Token — ใช้ apiFetch ธรรมดา ไม่ใช้ authFetch
 * Backend คืน 404 เมื่อไม่พบ QR Token หรือ QR Code ถูกปิดใช้งานอยู่ (isActive: false)
 * @returns ข้อมูลโปรไฟล์สัตว์เลี้ยง หรือ null เมื่อไม่พบ/QR ถูกปิดใช้งาน
 */
export async function getPublicPetProfile(
  qrToken: string
): Promise<PublicPetProfile | null> {
  try {
    return await apiFetch<PublicPetProfile>(`/pets/public/qr/${qrToken}`, {
      cache: 'no-store',
    });
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * สร้าง QR Code สำหรับสัตว์เลี้ยง (POST /pets/:id/qr)
 * สร้าง QR Token เฉพาะสำหรับสัตว์เลี้ยงเพื่อติดปลอกคอหรือป้ายชื่อ
 * เรียกซ้ำได้เพื่อเปิดใช้งาน QR Code อีกครั้งหลังจากถูกปิดใช้งานไปแล้ว
 * ไม่ catch error เพราะให้ Server Action ชั้นบน (pet.actions.ts) เป็นผู้จัดการข้อความ error ที่จะแสดงผู้ใช้
 */
export async function generatePetQrCode(petId: string): Promise<PetQrCode> {
  return authFetch<PetQrCode>(`/pets/${petId}/qr`, {
    method: 'POST',
  });
}

/**
 * ปิดใช้งาน QR Code ของสัตว์เลี้ยง (PATCH /pets/:id/qr/deactivate)
 * ใช้เมื่อป้ายปลอกคอสูญหายหรือไม่ต้องการให้คนสแกนเข้าถึงโปรไฟล์สาธารณะได้อีก
 */
export async function deactivatePetQrCode(petId: string): Promise<PetQrCode> {
  return authFetch<PetQrCode>(`/pets/${petId}/qr/deactivate`, {
    method: 'PATCH',
  });
}

/**
 * สร้างโปรไฟล์สัตว์เลี้ยงใหม่ (POST /pets)
 * กรองเฉพาะฟิลด์ที่ Backend CreatePetDto อนุญาต (ป้องกัน non-whitelisted property error)
 * @param data — ข้อมูลสัตว์เลี้ยง (name, type, breed, gender, color, age, etc.)
 */
export async function createPet(
  data: {
    name: string;
    type: string;
    breed?: string;
    gender?: string;
    color?: string;
    age?: number;
    distinctiveFeatures?: string;
    description?: string;
  }
): Promise<PetProfile> {
  const payload: Record<string, unknown> = {
    name: data.name.trim(),
    type: data.type,
  };
  if (data.breed && data.breed.trim()) payload.breed = data.breed.trim();
  if (data.gender) payload.gender = data.gender;
  if (data.color && data.color.trim()) payload.color = data.color.trim();
  if (data.age !== undefined && data.age !== null && !isNaN(Number(data.age))) {
    payload.age = Math.max(0, Math.floor(Number(data.age)));
  }
  if (data.distinctiveFeatures && data.distinctiveFeatures.trim()) {
    payload.distinctiveFeatures = data.distinctiveFeatures.trim();
  }
  if (data.description && data.description.trim()) {
    payload.description = data.description.trim();
  }

  // Backend ส่ง { success, data: { pet: {...} } } → ต้องแกะ .pet อีกชั้นหลัง apiFetch unwrap .data
  const { pet } = await authFetch<{ pet: PetProfile }>('/pets', {
    method: 'POST',
    body: payload,
  });
  return pet;
}

/**
 * แก้ไขข้อมูลสัตว์เลี้ยง (PATCH /pets/:id)
 * กรองเฉพาะฟิลด์ที่ Backend UpdatePetDto อนุญาต
 * @param id — รหัสสัตว์เลี้ยง
 * @param data — ข้อมูลที่ต้องการแก้ไข
 */
export async function updatePet(
  id: string,
  data: Record<string, unknown>
): Promise<PetProfile> {
  const payload: Record<string, unknown> = {};
  if (typeof data.name === 'string' && data.name.trim()) payload.name = data.name.trim();
  if (typeof data.type === 'string' && data.type.trim()) payload.type = data.type.trim();
  if (typeof data.breed === 'string') payload.breed = data.breed.trim() || undefined;
  if (typeof data.gender === 'string') payload.gender = data.gender;
  if (typeof data.color === 'string') payload.color = data.color.trim() || undefined;
  if (data.age !== undefined && data.age !== null && !isNaN(Number(data.age))) {
    payload.age = Math.max(0, Math.floor(Number(data.age)));
  }
  if (typeof data.distinctiveFeatures === 'string') {
    payload.distinctiveFeatures = data.distinctiveFeatures.trim() || undefined;
  }
  if (typeof data.description === 'string') {
    payload.description = data.description.trim() || undefined;
  }

  // Backend ส่ง { success, data: { pet: {...} } } → ต้องแกะ .pet อีกชั้นหลัง apiFetch unwrap .data
  const { pet } = await authFetch<{ pet: PetProfile }>(`/pets/${id}`, {
    method: 'PATCH',
    body: payload,
  });
  return pet;
}


/**
 * ลบสัตว์เลี้ยง (DELETE /pets/:id)
 * @param id — รหัสสัตว์เลี้ยง
 */
export async function deletePet(id: string): Promise<void> {
  await authFetch<void>(`/pets/${id}`, {
    method: 'DELETE',
  });
}

/**
 * อัปโหลดรูปภาพสัตว์เลี้ยง (POST /pets/:id/images)
 * จำกัดสูงสุด 3 รูปต่อสัตว์เลี้ยง (ตามกฎ Backend FilesInterceptor)
 * @param petId — รหัสสัตว์เลี้ยง
 * @param files — ไฟล์รูปภาพ (สูงสุด 3 ไฟล์)
 */
export async function uploadPetImages(
  petId: string,
  files: File[]
): Promise<unknown> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  return authFetch(`/pets/${petId}/images`, {
    method: 'POST',
    body: formData as unknown as Record<string, unknown>,
  });
}
