'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, PawPrint, Upload, Image as ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PetProfile, CreatePetDto, PetType, PetGender } from '@/types/pet';

// Schema ตรวจสอบความถูกต้องของฟอร์มเพิ่ม/แก้ไขสัตว์เลี้ยงด้วย Zod
const petSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อสัตว์เลี้ยง'),
  type: z.enum(['DOG', 'CAT', 'BIRD', 'HAMSTER', 'EXOTIC', 'OTHER']),
  breed: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).optional(),
  color: z.string().optional(),
  age: z.number().min(0, 'อายุต้องไม่ต่ำกว่า 0').optional(),
  distinctiveFeatures: z.string().optional(),
  description: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

type PetFormData = z.infer<typeof petSchema>;

interface PetFormModalProps {
  isOpen: boolean;
  petToEdit?: PetProfile | null;
  onClose: () => void;
  onSubmitPet: (data: CreatePetDto) => void;
}

/**
 * PetFormModal Component (Client Component)
 * - Modal ฟอร์มสำหรับเพิ่มสัตว์เลี้ยงใหม่ หรือแก้ไขข้อมูลสัตว์เลี้ยงเดิม
 * - รองรับ Validation ด้วย React Hook Form + Zod Schema ตรงตาม AGENTS.md
 */
export function PetFormModal({
  isOpen,
  petToEdit,
  onClose,
  onSubmitPet,
}: PetFormModalProps) {
  const isEditing = !!petToEdit;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: petToEdit?.name || '',
      type: petToEdit?.type || 'CAT',
      breed: petToEdit?.breed || '',
      gender: petToEdit?.gender || 'FEMALE',
      color: petToEdit?.color || '',
      age: petToEdit?.age || 1,
      distinctiveFeatures: petToEdit?.distinctiveFeatures || '',
      description: petToEdit?.description || '',
      profileImageUrl: petToEdit?.profileImageUrl || '',
    },
  });

  if (!isOpen) return null;

  const handleFormSubmit = (data: PetFormData) => {
    onSubmitPet({
      ...data,
      profileImageUrl:
        data.profileImageUrl ||
        (data.type === 'DOG'
          ? 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=400&auto=format&fit=crop'
          : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop'),
    });
    reset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl transition-all sm:p-7 dark:border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ปุ่มปิด Modal */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        {/* ส่วนหัว Modal */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <PawPrint className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground sm:text-xl">
              {isEditing ? 'แก้ไขข้อมูลสัตว์เลี้ยง' : 'เพิ่มสัตว์เลี้ยงใหม่'}
            </h3>
            <p className="text-xs text-muted-foreground">
              กรอกข้อมูลเพื่อสร้างโปรไฟล์และระบบ Smart QR Code
            </p>
          </div>
        </div>

        {/* ฟอร์มกรอกข้อมูล */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-6 flex flex-col gap-4">
          {/* ชื่อสัตว์เลี้ยง */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">
              ชื่อสัตว์เลี้ยง <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="เช่น น้องลูน่า, ส้มส้ม"
              className="rounded-2xl"
              {...register('name')}
            />
            {errors.name && (
              <span className="text-xs text-destructive">{errors.name.message}</span>
            )}
          </div>

          {/* ประเภทและเพศ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type" className="text-xs font-semibold">
                ประเภทสัตว์เลี้ยง <span className="text-destructive">*</span>
              </Label>
              <select
                id="type"
                className="h-10 rounded-2xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                {...register('type')}
              >
                <option value="CAT">แมว (Cat)</option>
                <option value="DOG">สุนัข (Dog)</option>
                <option value="BIRD">นก (Bird)</option>
                <option value="HAMSTER">แฮมสเตอร์ (Hamster)</option>
                <option value="EXOTIC">สัตว์พิเศษ (Exotic)</option>
                <option value="OTHER">อื่นๆ (Other)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gender" className="text-xs font-semibold">
                เพศ
              </Label>
              <select
                id="gender"
                className="h-10 rounded-2xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                {...register('gender')}
              >
                <option value="FEMALE">เพศเมีย</option>
                <option value="MALE">เพศผู้</option>
                <option value="UNKNOWN">ไม่ระบุ</option>
              </select>
            </div>
          </div>

          {/* สายพันธุ์และสีขน */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="breed" className="text-xs font-semibold">
                สายพันธุ์
              </Label>
              <Input
                id="breed"
                placeholder="เช่น วิเชียรมาศ, ฮัสกี้"
                className="rounded-2xl"
                {...register('breed')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="color" className="text-xs font-semibold">
                สี / ลวดลาย
              </Label>
              <Input
                id="color"
                placeholder="เช่น สีครีม, ส้มลายเสือ"
                className="rounded-2xl"
                {...register('color')}
              />
            </div>
          </div>

          {/* อายุ */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="age" className="text-xs font-semibold">
              อายุ (ปี)
            </Label>
            <Input
              id="age"
              type="number"
              min={0}
              placeholder="เช่น 2"
              className="rounded-2xl"
              {...register('age', { valueAsNumber: true })}
            />
          </div>

          {/* ลักษณะเด่น */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="distinctiveFeatures" className="text-xs font-semibold">
              ลักษณะเด่น / จุดสังเกต
            </Label>
            <Input
              id="distinctiveFeatures"
              placeholder="เช่น ตาสีฟ้า ปลายหูเข้ม สวมปลอกคอสีแดง"
              className="rounded-2xl"
              {...register('distinctiveFeatures')}
            />
          </div>

          {/* ปุ่ม Submit */}
          <div className="mt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-2xl"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-2xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            >
              {isEditing ? 'บันทึกการแก้ไข' : 'บันทึกสัตว์เลี้ยง'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
