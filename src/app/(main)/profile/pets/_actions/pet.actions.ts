'use server';

import { revalidatePath } from 'next/cache';
import {
  createPet,
  updatePet,
  deletePet,
  uploadPetImages,
  generatePetQrCode,
  deactivatePetQrCode,
} from '@/services/pet.service';
import { CreatePetDto, PetProfile, PetQrCode } from '@/types/pet';


/**
 * ผลลัพธ์จากการประมวลผล Server Action
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action: สร้างโปรไฟล์สัตว์เลี้ยงใหม่
 * - เรียกใช้ createPet() จาก pet.service เพื่อส่งข้อมูลไปยัง Backend
 * - สั่ง revalidatePath เพื่ออัปเดตแคชของหน้า /profile/pets และ /dashboard ทันที
 *
 * @param payload - ข้อมูลสัตว์เลี้ยง (ชื่อ, ประเภท, สายพันธุ์, เพศ, สี, อายุ, ฯลฯ)
 * @returns ผลลัพธ์ ActionResponse พร้อมข้อมูล PetProfile
 */
export async function createPetAction(
  payload: CreatePetDto
): Promise<ActionResponse<PetProfile>> {
  try {
    const pet = await createPet(payload);
    revalidatePath('/profile/pets');
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, data: pet };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถสร้างโปรไฟล์สัตว์เลี้ยงได้';
    return { success: false, error: message };
  }
}

/**
 * Server Action: แก้ไขข้อมูลสัตว์เลี้ยงเดิม
 * - เรียกใช้ updatePet() จาก pet.service เพื่ออัปเดตข้อมูลที่ Backend
 * - สั่ง revalidatePath เพื่อให้หน้ารายการสัตว์เลี้ยงแสดงข้อมูลล่าสุด
 *
 * @param id - รหัสสัตว์เลี้ยงที่ต้องการแก้ไข
 * @param payload - ข้อมูลที่ต้องการอัปเดต
 * @returns ผลลัพธ์ ActionResponse พร้อมข้อมูล PetProfile ที่อัปเดตแล้ว
 */
export async function updatePetAction(
  id: string,
  payload: Partial<CreatePetDto>
): Promise<ActionResponse<PetProfile>> {
  try {
    const pet = await updatePet(id, payload as Record<string, unknown>);
    revalidatePath('/profile/pets');
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, data: pet };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถอัปเดตข้อมูลสัตว์เลี้ยงได้';
    return { success: false, error: message };
  }
}

/**
 * Server Action: ลบสัตว์เลี้ยง
 * - เรียกใช้ deletePet() จาก pet.service เพื่อลบออกจากฐานข้อมูล Backend
 * - สั่ง revalidatePath เพื่อลบการ์ดสัตว์เลี้ยงออกจากหน้าเว็บทันที
 *
 * @param id - รหัสสัตว์เลี้ยงที่ต้องการลบ
 * @returns ผลลัพธ์ ActionResponse บ่งบอกสถานะความสำเร็จ
 */
export async function deletePetAction(id: string): Promise<ActionResponse<void>> {
  try {
    await deletePet(id);
    revalidatePath('/profile/pets');
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถลบสัตว์เลี้ยงได้';
    return { success: false, error: message };
  }
}

/**
 * Server Action: อัปโหลดรูปภาพสัตว์เลี้ยงขึ้น Cloudinary ของ Backend
 * - รับ FormData ที่บรรจุไฟล์รูปภาพ 'images' จาก Client
 * - ส่ง FormData ตรงไปยัง Backend POST /pets/:id/images ทันทีโดยไม่ต้องสร้างซ้ำ
 * - สั่ง revalidatePath เพื่ออัปเดตหน้าโปรไฟล์และหน้ารายละเอียดทันที
 *
 * @param petId - รหัสสัตว์เลี้ยง
 * @param formData - FormData ที่บรรจุไฟล์รูปภาพ (ส่งผ่าน Server Action boundary ได้โดยตรง)
 */
export async function uploadPetImagesAction(
  petId: string,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // ตรวจสอบว่ามีไฟล์จริงๆ ก่อนส่ง
    const files = formData.getAll('images');
    if (!files || files.length === 0) {
      return { success: true };
    }

    // ส่ง FormData ตรงไปยัง Backend ผ่าน uploadPetImages
    // uploadPetImages จะ wrap FormData ใหม่อีกครั้งเพื่อส่งผ่าน authFetch
    const result = await uploadPetImages(petId, files as File[]);
    revalidatePath('/profile/pets');
    revalidatePath('/profile');
    revalidatePath(`/pets/${petId}/avatar`);
    return { success: true, data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถอัปโหลดรูปภาพสัตว์เลี้ยงได้';
    console.error('[uploadPetImagesAction] error:', message);
    return { success: false, error: message };
  }
}

/**
 * Server Action: สร้าง (หรือเปิดใช้งานใหม่) QR Code ประจำตัวสัตว์เลี้ยง
 * - สัตว์เลี้ยงที่เพิ่งสร้างใหม่จะยังไม่มี qrCode จนกว่าผู้ใช้จะกดสร้างเอง
 * - เรียกซ้ำได้เพื่อเปิดใช้งาน QR Code อีกครั้งหลังถูกปิดใช้งาน
 *
 * @param petId - รหัสสัตว์เลี้ยงที่ต้องการสร้าง QR Code
 */
export async function generatePetQrAction(
  petId: string
): Promise<ActionResponse<PetQrCode>> {
  try {
    const qrCode = await generatePetQrCode(petId);
    revalidatePath('/profile/pets');
    revalidatePath('/profile');
    return { success: true, data: qrCode };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถสร้าง QR Code ได้';
    return { success: false, error: message };
  }
}

/**
 * Server Action: ปิดใช้งาน QR Code ของสัตว์เลี้ยง
 * - ใช้เมื่อป้ายปลอกคอสูญหายหรือไม่ต้องการให้คนสแกนเข้าถึงโปรไฟล์สาธารณะได้อีก
 *
 * @param petId - รหัสสัตว์เลี้ยงที่ต้องการปิดใช้งาน QR Code
 */
export async function deactivatePetQrAction(
  petId: string
): Promise<ActionResponse<PetQrCode>> {
  try {
    const qrCode = await deactivatePetQrCode(petId);
    revalidatePath('/profile/pets');
    revalidatePath('/profile');
    return { success: true, data: qrCode };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถปิดใช้งาน QR Code ได้';
    return { success: false, error: message };
  }
}

