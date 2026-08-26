'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Heart, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

import { PetProfile, PetQrCode, CreatePetDto, PetImage } from '@/types/pet';
import { PetCard } from './pet-card';
import { PetQrModal } from './pet-qr-modal';
import { PetFormModal } from './pet-form-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createPetAction, updatePetAction, deletePetAction, uploadPetImagesAction } from '../_actions/pet.actions';

interface PetShowcaseListProps {
  initialPets: PetProfile[];
}

/**
 * PetShowcaseList Component (Client Component)
 * - ส่วนแสดงรายการสัตว์เลี้ยงทั้งหมดของผู้ใช้งาน (Pet Showcase List)
 * - จัดแสดงผลในรูปแบบ Grid 3 คอลัมน์บน Desktop (1 คอลัมน์บน Mobile)
 * - การ์ดเส้นประ "เพิ่มสัตว์เลี้ยงใหม่" จัดวางรวมใน Grid เดียวกันอย่างสมดุล
 * - เชื่อมต่อ Backend จริงผ่าน Server Actions (createPetAction, updatePetAction, deletePetAction, uploadPetImagesAction)
 */
export function PetShowcaseList({ initialPets }: PetShowcaseListProps) {
  const router = useRouter();
  const [pets, setPets] = useState<PetProfile[]>(initialPets);

  const [selectedQrPetId, setSelectedQrPetId] = useState<string | null>(null);
  // หา pet ล่าสุดจาก id ที่เลือกไว้เสมอ (แทนการเก็บ object แยก) เพื่อให้ Modal เห็นข้อมูล qrCode ที่อัปเดตแล้วทันที
  const selectedPetForQr = pets.find((p) => p.id === selectedQrPetId) || null;
  const [selectedPetForEdit, setSelectedPetForEdit] = useState<PetProfile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // แสดงผล Feedback เป็นเวลา 4 วินาทีแล้วเคลียร์
  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // เปิด Modal เพิ่มสัตว์เลี้ยงใหม่
  const handleOpenAddModal = () => {
    setSelectedPetForEdit(null);
    setIsFormOpen(true);
  };

  // เปิด Modal แก้ไขสัตว์เลี้ยง
  const handleOpenEditModal = (pet: PetProfile) => {
    setSelectedPetForEdit(pet);
    setIsFormOpen(true);
  };

  // จัดการการส่งข้อมูลฟอร์ม (สร้างใหม่ หรือ อัปเดตผ่าน Backend จริง + อัปโหลดรูปภาพไป Cloudinary อัตโนมัติ)
  const handleSavePet = async (
    data: CreatePetDto & { images?: PetImage[]; files?: File[] }
  ) => {
    setIsLoading(true);
    setFeedback(null);

    try {
      if (selectedPetForEdit) {
        // แก้ไขสัตว์เลี้ยงเดิมผ่าน Server Action
        const res = await updatePetAction(selectedPetForEdit.id, data);
        if (res.success && res.data) {
          // ถ้ามีไฟล์รูปภาพใหม่ ให้อัปโหลดต่อไปยัง Cloudinary
          if (data.files && data.files.length > 0) {
            const formData = new FormData();
            data.files.forEach((f) => formData.append('images', f));
            await uploadPetImagesAction(selectedPetForEdit.id, formData);
          }

          setPets((prev) =>
            prev.map((p) => (p.id === selectedPetForEdit.id ? res.data! : p))
          );
          router.refresh();
          triggerFeedback('success', `อัปเดตข้อมูลของ "${data.name}" เรียบร้อยแล้ว`);
        } else {
          triggerFeedback('error', res.error || 'ไม่สามารถอัปเดตข้อมูลสัตว์เลี้ยงได้');
        }
      } else {
        // 1. เพิ่มสัตว์เลี้ยงใหม่ผ่าน Server Action
        const res = await createPetAction(data);
        if (res.success && res.data) {
          const finalPet = res.data;

          // 2. ถ้ามีไฟล์รูปภาพที่ผู้ใช้เลือก ให้อัปโหลดไปยัง Cloudinary อัตโนมัติทันที
          if (data.files && data.files.length > 0) {
            console.log('[PetShowcase] Uploading', data.files.length, 'files for pet:', res.data.id);
            const formData = new FormData();
            data.files.forEach((f) => formData.append('images', f));
            const uploadRes = await uploadPetImagesAction(res.data.id, formData);
            if (uploadRes.success) {
              console.log('[PetShowcase] Images uploaded successfully');
            } else {
              console.warn('[PetShowcase] Image upload failed:', uploadRes.error);
              triggerFeedback('error', `บันทึกข้อมูล "${data.name}" สำเร็จ แต่อัปโหลดรูปภาพไม่สำเร็จ: ${uploadRes.error}`);
              setPets((prev) => [finalPet, ...prev]);
              router.refresh();
              setIsLoading(false);
              return;
            }
          }

          setPets((prev) => [finalPet, ...prev]);
          router.refresh();
          triggerFeedback('success', `เพิ่ม "${data.name}" เข้าสู่โปรไฟล์เรียบร้อยแล้ว`);
        } else {
          triggerFeedback('error', res.error || 'ไม่สามารถเพิ่มสัตว์เลี้ยงได้');
        }
      }

    } catch {
      triggerFeedback('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {

      setIsLoading(false);
    }
  };

  // จัดการลบสัตว์เลี้ยงผ่าน Backend จริง
  const handleDeletePet = async (petId: string) => {
    const petToDelete = pets.find((p) => p.id === petId);
    const petName = petToDelete?.name || 'สัตว์เลี้ยง';

    if (confirm(`คุณต้องการลบข้อมูลของ "${petName}" ใช่หรือไม่?`)) {
      setIsLoading(true);
      setFeedback(null);

      try {
        const res = await deletePetAction(petId);
        if (res.success) {
          setPets((prev) => prev.filter((p) => p.id !== petId));
          router.refresh();
          triggerFeedback('success', `ลบข้อมูลของ "${petName}" เรียบร้อยแล้ว`);
        } else {
          triggerFeedback('error', res.error || 'ไม่สามารถลบสัตว์เลี้ยงได้');
        }
      } catch {
        triggerFeedback('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      } finally {
        setIsLoading(false);
      }
    }
  };



  // อัปเดต qrCode ของสัตว์เลี้ยงตัวที่เลือกไว้ หลังสร้าง/ปิดใช้งาน QR Code สำเร็จจาก Modal
  const handleQrCodeChange = (petId: string, qrCode: PetQrCode) => {
    setPets((prev) => prev.map((p) => (p.id === petId ? { ...p, qrCode } : p)));
    router.refresh();
  };

  const currentCount = pets.length;
  const maxQuota = 3;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* 1. ส่วนหัวของหน้าและปุ่ม CTA เพิ่มสัตว์เลี้ยง */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
            โปรไฟล์สัตว์เลี้ยง
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-base">
            จัดการข้อมูลสัตว์เลี้ยงและ QR Code สำหรับสัตว์เลี้ยงของคุณ
          </p>
        </div>

        {/* ปุ่ม CTA: + เพิ่มสัตว์เลี้ยง */}
        <Button
          type="button"
          onClick={handleOpenAddModal}
          disabled={currentCount >= maxQuota || isLoading}
          className="h-10 min-h-[40px] w-full gap-1.5 rounded-2xl bg-primary px-4 font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 hover:bg-primary/90 sm:w-auto"
        >
          {isLoading ? (
            <Loader2 className="size-4.5 animate-spin" />
          ) : (
            <Plus className="size-4.5 stroke-[2.5]" />
          )}
          <span>เพิ่มสัตว์เลี้ยง</span>
        </Button>
      </div>

      {/* แจ้งเตือนสถานะผลลัพธ์การบันทึก/ลบข้อมูล */}
      {feedback && (
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-2xl p-4 text-sm font-semibold shadow-xs animate-in fade-in duration-200',
            feedback.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
              : 'bg-destructive/15 text-destructive'
          )}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="size-5 shrink-0" />
          ) : (
            <AlertCircle className="size-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. กริดแสดงการ์ดสัตว์เลี้ยงทั้งหมดและปุ่มเพิ่มสัตว์เลี้ยงใหม่ */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* การ์ดเส้นประ "เพิ่มสัตว์เลี้ยงใหม่" (แสดงเมื่อยังไม่เต็มโควต้า 3 ตัว) */}
        {currentCount < maxQuota && (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="group flex min-h-[280px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:shadow-md"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform group-hover:scale-110">
              <Plus className="size-7 stroke-[2.5]" />
            </div>
            <span className="mt-4 text-base font-bold text-foreground group-hover:text-primary">
              เพิ่มสัตว์เลี้ยงใหม่
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              สูงสุด {maxQuota} ตัว (ปัจจุบันมี {currentCount} ตัว)
            </span>
          </button>
        )}

        {/* รายการการ์ดสัตว์เลี้ยงขนาดกะทัดรัด */}
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onOpenQr={(selected) => setSelectedQrPetId(selected.id)}
            onEdit={(selected) => handleOpenEditModal(selected)}
            onDelete={(id) => handleDeletePet(id)}
          />
        ))}
      </div>

      {/* กรณีไม่มีสัตว์เลี้ยงเลย */}
      {pets.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/30 p-8 text-center sm:p-12">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground sm:size-16">
            <Heart className="size-7 sm:size-8" />
          </div>
          <h3 className="mt-3 text-base font-bold text-foreground sm:text-lg">
            ยังไม่มีโปรไฟล์สัตว์เลี้ยง
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:text-sm">
            เริ่มต้นสร้างโปรไฟล์สัตว์เลี้ยงของคุณเพื่อรับ Smart QR Tag ติดปลอกคอตามหา
          </p>
          <Button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-4 rounded-2xl bg-primary sm:mt-5"
          >
            เพิ่มสัตว์เลี้ยงตัวแรก
          </Button>
        </div>
      )}

      {/* Modal แสดง QR Code */}
      <PetQrModal
        pet={selectedPetForQr}
        isOpen={!!selectedPetForQr}
        onClose={() => setSelectedQrPetId(null)}
        onQrCodeChange={handleQrCodeChange}
      />

      {/* Modal ฟอร์มเพิ่ม/แก้ไขข้อมูลสัตว์เลี้ยง */}
      {isFormOpen && (
        <PetFormModal
          key={selectedPetForEdit?.id || 'new'}
          isOpen={isFormOpen}
          petToEdit={selectedPetForEdit}
          onClose={() => setIsFormOpen(false)}
          onSubmitPet={handleSavePet}
        />
      )}
    </div>
  );
}
