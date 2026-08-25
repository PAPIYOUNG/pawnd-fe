import { PetProfile, CreatePetDto, UpdatePetDto, PetQrCode } from '@/types/pet';

/**
 * Base URL ของ Backend API
 */
const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

/**
 * Mock ข้อมูลสัตว์เลี้ยงจำลองตรงตามดีไซน์ UI ต้นแบบ
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
 */
export async function getMyPets(): Promise<PetProfile[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/pets`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return MOCK_PETS;
    const json = await res.json();
    return json.pets || MOCK_PETS;
  } catch {
    return MOCK_PETS;
  }
}

/**
 * ดึงข้อมูลสัตว์เลี้ยงรายตัว (GET /pets/:id)
 */
export async function getPetById(id: string): Promise<PetProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/pets/${id}`);
    if (!res.ok) {
      return MOCK_PETS.find((p) => p.id === id) || null;
    }
    return await res.json();
  } catch {
    return MOCK_PETS.find((p) => p.id === id) || null;
  }
}

/**
 * สร้าง QR Code สำหรับสัตว์เลี้ยง (POST /pets/:id/qr)
 */
export async function generatePetQr(petId: string): Promise<PetQrCode | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/pets/${petId}/qr`, {
      method: 'POST',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
