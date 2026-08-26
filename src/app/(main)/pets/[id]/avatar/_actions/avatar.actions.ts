'use server';

import { revalidatePath } from 'next/cache';
import {
  generatePetAvatar,
  GeneratePetAvatarDto,
  GeneratePetAvatarResponse,
} from '@/services/ai.service';
import { ActionResponse } from '@/app/(main)/profile/pets/_actions/pet.actions';

/**
 * Server Action: สร้างภาพ AI Avatar สำหรับสัตว์เลี้ยง
 * - เรียกใช้ generatePetAvatar() ใน ai.service เพื่อส่งคำขอไปยัง Backend
 * - สั่ง revalidatePath เพื่ออัปเดตหน้าโปรไฟล์สัตว์เลี้ยง
 *
 * @param dto - { petId, imageUrls }
 * @returns ผลลัพธ์ ActionResponse พร้อมข้อมูล GeneratePetAvatarResponse
 */
export async function generatePetAvatarAction(
  dto: GeneratePetAvatarDto
): Promise<ActionResponse<GeneratePetAvatarResponse>> {
  try {
    const result = await generatePetAvatar(dto);
    revalidatePath(`/pets/${dto.petId}/avatar`);
    revalidatePath('/profile/pets');
    return { success: true, data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'ไม่สามารถสร้างภาพ Avatar ได้';
    return { success: false, error: message };
  }
}
