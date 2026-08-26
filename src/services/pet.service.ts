import { PetProfile, PetQrCode } from '@/types/pet';
import { authFetch } from '@/lib/api/auth-fetch';

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
      publicProfileUrl: 'https://pawnd.co/p/qr_luna_pawnd_2026',
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
      'https://images.unsplash.com/photo-1513360309081-38f076278f94?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-03-10T12:00:00.000Z',
    updatedAt: '2026-08-22T14:15:00.000Z',
    qrCode: {
      id: 'qr-2',
      petId: 'pet-2',
      qrToken: 'qr_somsom_pawnd_2026',
      qrImageUrl: null,
      publicProfileUrl: 'https://pawnd.co/p/qr_somsom_pawnd_2026',
      isActive: true,
      createdAt: '2026-03-10T12:00:00.000Z',
      updatedAt: '2026-03-10T12:00:00.000Z',
    },
  },
];

/**
 * ดึงรายการสัตว์เลี้ยงทั้งหมดของผู้ใช้ (GET /pets)
 * ใช้ authFetch เพื่อส่ง JWT token อัตโนมัติ
 * Backend ส่ง { success, data: [...pets] } → apiFetch unwrap ได้ array ของ PetProfile ตรงๆ
 */
export async function getMyPets(): Promise<PetProfile[]> {
  try {
    const pets = await authFetch<PetProfile[]>('/pets');
    // ถ้าได้ array ว่าง ให้แสดง mock แทนเพื่อ UX ที่ดี
    return pets && pets.length > 0 ? pets : MOCK_PETS;
  } catch {
    // Fallback เป็น mock data เมื่อ Backend ไม่พร้อม หรือยังไม่ได้ login
    return MOCK_PETS;
  }
}

/**
 * ดึงข้อมูลสัตว์เลี้ยงรายตัว (GET /pets/:id)
 * ใช้ authFetch เพราะ endpoint นี้ต้อง login (ตรวจสอบ ownership)
 */
export async function getPetById(id: string): Promise<PetProfile | null> {
  try {
    return await authFetch<PetProfile>(`/pets/${id}`);
  } catch {
    // Fallback: ค้นหาจาก mock data
    return MOCK_PETS.find((p) => p.id === id) || null;
  }
}

/**
 * สร้าง QR Code สำหรับสัตว์เลี้ยง (POST /pets/:id/qr)
 * สร้าง QR Token เฉพาะสำหรับสัตว์เลี้ยงเพื่อติดปลอกคอหรือป้ายชื่อ
 */
export async function generatePetQr(petId: string): Promise<PetQrCode | null> {
  try {
    return await authFetch<PetQrCode>(`/pets/${petId}/qr`, {
      method: 'POST',
    });
  } catch {
    return null;
  }
}

/**
 * สร้างโปรไฟล์สัตว์เลี้ยงใหม่ (POST /pets)
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
  return authFetch<PetProfile>('/pets', {
    method: 'POST',
    body: data as Record<string, unknown>,
  });
}

/**
 * แก้ไขข้อมูลสัตว์เลี้ยง (PATCH /pets/:id)
 * @param id — รหัสสัตว์เลี้ยง
 * @param data — ข้อมูลที่ต้องการแก้ไข
 */
export async function updatePet(
  id: string,
  data: Record<string, unknown>
): Promise<PetProfile> {
  return authFetch<PetProfile>(`/pets/${id}`, {
    method: 'PATCH',
    body: data,
  });
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
