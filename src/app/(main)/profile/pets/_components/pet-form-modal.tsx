'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, PawPrint } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PetProfile, CreatePetDto, PetImage } from '@/types/pet';
import { PetImageGallery } from './pet-image-gallery';

// Schema ตรวจสอบความถูกต้องของฟอร์มสัตว์เลี้ยงด้วย Zod
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
  onSubmitPet: (data: CreatePetDto & { images?: PetImage[] }) => void;
}

/**
 * PetFormModal Component (Client Component)
 * - Modal ฟอร์มสำหรับเพิ่มสัตว์เลี้ยงใหม่ หรือแก้ไขข้อมูลสัตว์เลี้ยงเดิม
 * - รองรับระบบแกลเลอรีรูปภาพตามกฎของ Backend:
 *   1. อัปโหลดรูปภาพได้สูงสุด 3 รูป (Max 3 Images per Pet)
 *   2. กำหนดรูปภาพโปรไฟล์หลัก (Set Profile Image)
 *   3. ลบรูปภาพเดี่ยวได้ (Delete Image)
 *   4. รองรับไฟล์ภาพ JPEG, PNG, WEBP ขนาดไม่เกิน 5MB
 */
export function PetFormModal({
  isOpen,
  petToEdit,
  onClose,
  onSubmitPet,
}: PetFormModalProps) {
  const isEditing = !!petToEdit;

  // State จัดการรูปภาพสัตว์เลี้ยงในฟอร์ม (จำลอง Image List)
  const [petImages, setPetImages] = useState<PetImage[]>([]);
  const [mainProfileImageUrl, setMainProfileImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: '',
      type: 'CAT',
      breed: '',
      gender: 'FEMALE',
      color: '',
      age: 1,
      distinctiveFeatures: '',
      description: '',
      profileImageUrl: '',
    },
  });

  // อัปเดตข้อมูลเมื่อเปิด Modal ขึ้นมาแก้ไข
  useEffect(() => {
    if (isOpen) {
      if (petToEdit) {
        reset({
          name: petToEdit.name,
          type: petToEdit.type,
          breed: petToEdit.breed || '',
          gender: petToEdit.gender || 'FEMALE',
          color: petToEdit.color || '',
          age: petToEdit.age ?? 1,
          distinctiveFeatures: petToEdit.distinctiveFeatures || '',
          description: petToEdit.description || '',
          profileImageUrl: petToEdit.profileImageUrl || '',
        });

        const initialImgs: PetImage[] = petToEdit.images || [
          {
            id: `img-1-${petToEdit.id}`,
            petId: petToEdit.id,
            imageUrl:
              petToEdit.profileImageUrl ||
              'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop',
            isProfile: true,
            sortOrder: 0,
            createdAt: new Date().toISOString(),
          },
        ];
        setPetImages(initialImgs);
        setMainProfileImageUrl(petToEdit.profileImageUrl || initialImgs[0]?.imageUrl || null);
      } else {
        reset({
          name: '',
          type: 'CAT',
          breed: '',
          gender: 'FEMALE',
          color: '',
          age: 1,
          distinctiveFeatures: '',
          description: '',
          profileImageUrl: '',
        });
        setPetImages([]);
        setMainProfileImageUrl(null);
      }
    }
  }, [isOpen, petToEdit, reset]);

  if (!isOpen) return null;

  // จัดการเมื่อมีการเลือกไฟล์รูปภาพใหม่
  const handleUploadImages = (files: FileList) => {
    const newImgs: PetImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fakeUrl = URL.createObjectURL(file);
      const isFirst = petImages.length === 0 && i === 0;

      newImgs.push({
        id: `img-new-${Date.now()}-${i}`,
        petId: petToEdit?.id || 'temp',
        imageUrl: fakeUrl,
        isProfile: isFirst,
        sortOrder: petImages.length + i,
        createdAt: new Date().toISOString(),
      });
    }

    const updated = [...petImages, ...newImgs].slice(0, 3);
    setPetImages(updated);

    if (!mainProfileImageUrl && updated.length > 0) {
      setMainProfileImageUrl(updated[0].imageUrl);
      setValue('profileImageUrl', updated[0].imageUrl);
    }
  };

  // กำหนดรูปภาพโปรไฟล์หลัก
  const handleSetProfileImage = (imageId: string) => {
    const target = petImages.find((img) => img.id === imageId);
    if (!target) return;

    setPetImages((prev) =>
      prev.map((img) => ({
        ...img,
        isProfile: img.id === imageId,
      }))
    );
    setMainProfileImageUrl(target.imageUrl);
    setValue('profileImageUrl', target.imageUrl);
  };

  // ลบรูปภาพออกจากแกลเลอรี
  const handleDeleteImage = (imageId: string) => {
    const remaining = petImages.filter((img) => img.id !== imageId);
    setPetImages(remaining);

    // ถ้าลบรูปหลัก ให้เลื่อนรูปแรกที่เหลือเป็นรูปหลักแทนตามกฎของ Backend
    if (remaining.length > 0) {
      remaining[0].isProfile = true;
      setMainProfileImageUrl(remaining[0].imageUrl);
      setValue('profileImageUrl', remaining[0].imageUrl);
    } else {
      setMainProfileImageUrl(null);
      setValue('profileImageUrl', '');
    }
  };

  const handleFormSubmit = (data: PetFormData) => {
    const finalProfileImage =
      mainProfileImageUrl ||
      (data.type === 'DOG'
        ? 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=400&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop');

    onSubmitPet({
      ...data,
      profileImageUrl: finalProfileImage,
      images: petImages.length > 0 ? petImages : undefined,
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
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border/80 bg-card p-5 shadow-2xl transition-all sm:p-7 dark:border-border"
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
              กรอกข้อมูลและอัปโหลดรูปภาพเพื่อสร้าง Smart QR Code
            </p>
          </div>
        </div>

        {/* ฟอร์มกรอกข้อมูล */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-6 flex flex-col gap-4">
          {/* 1. ส่วนแกลเลอรีจัดการรูปภาพ (สูงสุด 3 รูปตามกฎ Backend) */}
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5">
            <PetImageGallery
              images={petImages}
              profileImageUrl={mainProfileImageUrl}
              maxImages={3}
              onUploadImages={handleUploadImages}
              onSetProfileImage={handleSetProfileImage}
              onDeleteImage={handleDeleteImage}
            />
          </div>

          {/* 2. ชื่อสัตว์เลี้ยง */}
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

          {/* 3. ประเภทและเพศ */}
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

          {/* 4. สายพันธุ์และสีขน */}
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

          {/* 5. อายุ */}
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

          {/* 6. ลักษณะเด่น */}
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

          {/* 7. ปุ่ม Submit */}
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
