'use client';

import { useState } from 'react';
import { Plus, Heart } from 'lucide-react';

import { PetProfile, CreatePetDto } from '@/types/pet';
import { PetCard } from './pet-card';
import { PetQrModal } from './pet-qr-modal';
import { PetFormModal } from './pet-form-modal';
import { Button } from '@/components/ui/button';

interface PetShowcaseListProps {
  initialPets: PetProfile[];
}

/**
 * PetShowcaseList Component (Client Component)
 * - ส่วนแสดงรายการสัตว์เลี้ยงทั้งหมดของผู้ใช้งาน (Pet Showcase List)
 * - ออกแบบให้พอดีและสวยงามทั้งบนหน้าจอมือถือ (Mobile) และหน้าจอคอมพิวเตอร์ (Desktop)
 * - แสดงการ์ดเส้นประ "เพิ่มสัตว์เลี้ยงใหม่" (Add Pet Card) พร้อมสถานะโควต้า (สูงสุด 3 ตัว)
 * - แสดงการ์ดสัตว์เลี้ยงแบบพาโนรามา (Panoramic Pet Cards)
 * - จัดการ State การเปิด-ปิด QR Code Modal และ Form Modal (เพิ่ม/แก้ไข/ลบ)
 */
export function PetShowcaseList({ initialPets }: PetShowcaseListProps) {
  const [pets, setPets] = useState<PetProfile[]>(initialPets);
  const [selectedPetForQr, setSelectedPetForQr] = useState<PetProfile | null>(null);
  const [selectedPetForEdit, setSelectedPetForEdit] = useState<PetProfile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

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

  // จัดการการส่งข้อมูลฟอร์ม (สร้างใหม่ หรือ อัปเดต)
  const handleSavePet = (data: CreatePetDto) => {
    if (selectedPetForEdit) {
      // แก้ไขสัตว์เลี้ยงเดิม
      setPets((prev) =>
        prev.map((p) =>
          p.id === selectedPetForEdit.id
            ? {
                ...p,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
    } else {
      // เพิ่มสัตว์เลี้ยงใหม่
      const newPet: PetProfile = {
        id: `pet-${Date.now()}`,
        ownerId: 'user-somchai-1',
        name: data.name,
        type: data.type,
        breed: data.breed || 'ไม่ระบุสายพันธุ์',
        gender: data.gender || 'FEMALE',
        color: data.color || 'สีครีม',
        age: data.age || 1,
        distinctiveFeatures: data.distinctiveFeatures || '',
        description: data.description || '',
        profileImageUrl: data.profileImageUrl,
        coverImageUrl:
          data.type === 'DOG'
            ? 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1200&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1513360309081-38f076278f94?q=80&w=1200&auto=format&fit=crop',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        qrCode: {
          id: `qr-${Date.now()}`,
          petId: `pet-${Date.now()}`,
          qrToken: `qr_${data.name.toLowerCase()}_${Date.now()}`,
          qrImageUrl: null,
          publicProfileUrl: `https://pawnd.co/p/qr_${data.name.toLowerCase()}`,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      setPets((prev) => [newPet, ...prev]);
    }
  };

  // จัดการลบสัตว์เลี้ยง
  const handleDeletePet = (petId: string) => {
    if (confirm('คุณต้องการลบข้อมูลสัตว์เลี้ยงตัวนี้ใช่หรือไม่?')) {
      setPets((prev) => prev.filter((p) => p.id !== petId));
    }
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
          disabled={currentCount >= maxQuota}
          className="h-10 min-h-[40px] w-full gap-1.5 rounded-2xl bg-primary px-4 font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 hover:bg-primary/90 sm:w-auto"
        >
          <Plus className="size-4.5 stroke-[2.5]" />
          <span>เพิ่มสัตว์เลี้ยง</span>
        </Button>
      </div>

      {/* 2. การ์ดเส้นประ "เพิ่มสัตว์เลี้ยงใหม่" (Dashed Add Card) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={handleOpenAddModal}
          disabled={currentCount >= maxQuota}
          className="group flex min-h-[130px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 text-center transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[160px] sm:p-6"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform group-hover:scale-110 sm:size-14">
            <Plus className="size-6 stroke-[2.5] sm:size-7" />
          </div>
          <span className="mt-2.5 text-sm font-bold text-foreground group-hover:text-primary sm:mt-3.5 sm:text-base">
            เพิ่มสัตว์เลี้ยงใหม่
          </span>
          <span className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
            สูงสุด {maxQuota} ตัว (ปัจจุบันมี {currentCount} ตัว)
          </span>
        </button>
      </div>

      {/* 3. รายการการ์ดสัตว์เลี้ยงแบบพาโนรามา (Panoramic Pet Cards) */}
      <div className="flex flex-col gap-6 sm:gap-8">
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onOpenQr={(selected) => setSelectedPetForQr(selected)}
            onEdit={(selected) => handleOpenEditModal(selected)}
            onDelete={(id) => handleDeletePet(id)}
          />
        ))}

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
      </div>

      {/* Modal แสดง QR Code */}
      <PetQrModal
        pet={selectedPetForQr}
        isOpen={!!selectedPetForQr}
        onClose={() => setSelectedPetForQr(null)}
      />

      {/* Modal ฟอร์มเพิ่ม/แก้ไขข้อมูลสัตว์เลี้ยง */}
      <PetFormModal
        isOpen={isFormOpen}
        petToEdit={selectedPetForEdit}
        onClose={() => setIsFormOpen(false)}
        onSubmitPet={handleSavePet}
      />
    </div>
  );
}
