/**
 * ประเภทของสัตว์เลี้ยง (PetType Enum)
 * ตรงตาม Schema ของ pawnd-be-template (Prisma enum pet_type)
 */
export type PetType = 'DOG' | 'CAT' | 'BIRD' | 'HAMSTER' | 'EXOTIC' | 'OTHER';

/**
 * เพศของสัตว์เลี้ยง (PetGender Enum)
 * ตรงตาม Schema ของ pawnd-be-template (Prisma enum pet_gender)
 */
export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN';

/**
 * ข้อมูล QR Code ประจำตัวสัตว์เลี้ยง
 * ตรงตาม PetQrCode model และ PetQrResponseDto ของ Backend
 */
export interface PetQrCode {
  id: string;
  petId: string;
  qrToken: string;
  qrImageUrl: string | null;
  publicProfileUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * รูปภาพเพิ่มเติมของสัตว์เลี้ยง
 * ตรงตาม PetImage model ของ Backend
 */
export interface PetImage {
  id: string;
  petId: string;
  imageUrl: string;
  isProfile: boolean;
  sortOrder: number;
  createdAt: string;
}

/**
 * ข้อมูลโปรไฟล์สัตว์เลี้ยงเต็มรูปแบบ
 * ตรงตาม Pet model ของ pawnd-be-template
 */
export interface PetProfile {
  id: string;
  ownerId: string;
  name: string;
  type: PetType;
  breed?: string | null;
  gender?: PetGender | null;
  color?: string | null;
  age?: number | null;
  distinctiveFeatures?: string | null;
  description?: string | null;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null; // ภาพปกแนวนอนสำหรับ Panoramic Showcase Card
  createdAt: string;
  updatedAt: string;
  images?: PetImage[];
  qrCode?: PetQrCode | null;
}

/**
 * DTO สำหรับสร้างสัตว์เลี้ยงใหม่ (CreatePetDto)
 * ตรงตาม Backend create-pet.dto.ts
 */
export interface CreatePetDto {
  name: string;
  type: PetType;
  breed?: string;
  gender?: PetGender;
  color?: string;
  age?: number;
  distinctiveFeatures?: string;
  description?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
}

/**
 * DTO สำหรับแก้ไขข้อมูลสัตว์เลี้ยง (UpdatePetDto)
 */
export type UpdatePetDto = Partial<CreatePetDto>;
