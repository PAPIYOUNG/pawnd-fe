'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LocateFixed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CreatePostPayload } from '@/types/post';

import { createPostAction } from '../_actions/create-post.actions';

const latitudeSchema = z
  .string()
  .trim()
  .min(1, 'กรุณาระบุละติจูด')
  .refine((value) => {
    const latitude = Number(value);
    return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
  }, 'ละติจูดต้องอยู่ระหว่าง -90 ถึง 90');

const longitudeSchema = z
  .string()
  .trim()
  .min(1, 'กรุณาระบุลองจิจูด')
  .refine((value) => {
    const longitude = Number(value);
    return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
  }, 'ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180');

const createPostSchema = z.object({
  type: z.enum(['LOST', 'FOUND']),
  petName: z.string().trim().min(1, 'กรุณาระบุชื่อหรือคำเรียกสัตว์'),
  petType: z.enum(['DOG', 'CAT', 'BIRD', 'HAMSTER', 'EXOTIC', 'OTHER']),
  breed: z.string(),
  gender: z.union([z.enum(['MALE', 'FEMALE', 'UNKNOWN']), z.literal('')]),
  color: z.string(),
  distinctiveFeatures: z.string(),
  description: z.string(),
  eventDate: z.string().min(1, 'กรุณาระบุวันที่และเวลาเกิดเหตุ'),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  province: z.string(),
  district: z.string(),
  locationDescription: z.string(),
  contactPhone: z.string(),
  contactLineId: z.string(),
  contactEmail: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || z.email().safeParse(value).success,
      'รูปแบบอีเมลไม่ถูกต้อง',
    ),
});

type CreatePostValues = z.infer<typeof createPostSchema>;

const petTypeOptions = [
  ['DOG', 'สุนัข'],
  ['CAT', 'แมว'],
  ['BIRD', 'นก'],
  ['HAMSTER', 'แฮมสเตอร์'],
  ['EXOTIC', 'สัตว์พิเศษ'],
  ['OTHER', 'อื่น ๆ'],
] as const;

const genderOptions = [
  ['', 'ไม่ระบุ'],
  ['MALE', 'เพศผู้'],
  ['FEMALE', 'เพศเมีย'],
  ['UNKNOWN', 'ไม่ทราบเพศ'],
] as const;

/** คืนวันเวลาท้องถิ่นในรูปแบบที่ input[type=datetime-local] ใช้ได้ */
function getLocalDateTimeValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

/** ตัดช่องว่างและไม่ส่ง optional field ที่ผู้ใช้ปล่อยว่าง */
function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}

/** ฟอร์ม POST /posts สำหรับสร้างข้อมูลจริงก่อนทดสอบห้องแชทสองบัญชี */
export function CreatePostForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      type: 'LOST',
      petName: '',
      petType: 'DOG',
      breed: '',
      gender: '',
      color: '',
      distinctiveFeatures: '',
      description: '',
      eventDate: getLocalDateTimeValue(),
      latitude: '13.7563',
      longitude: '100.5018',
      province: 'กรุงเทพมหานคร',
      district: '',
      locationDescription: '',
      contactPhone: '',
      contactLineId: '',
      contactEmail: '',
    },
  });

  /** Browser geolocation เป็นตัวช่วยเท่านั้น ผู้ใช้ยังกรอกพิกัดเองได้เสมอ */
  function useCurrentLocation() {
    setLocationNotice(null);
    if (!navigator.geolocation) {
      setLocationNotice('เบราว์เซอร์นี้ไม่รองรับการอ่านตำแหน่ง');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValue('latitude', String(coords.latitude), { shouldValidate: true });
        setValue('longitude', String(coords.longitude), {
          shouldValidate: true,
        });
        setLocationNotice('ใช้ตำแหน่งปัจจุบันแล้ว');
      },
      () => setLocationNotice('อ่านตำแหน่งไม่ได้ กรุณาอนุญาตหรือกรอกพิกัดเอง'),
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const payload: CreatePostPayload = {
      type: values.type,
      petName: values.petName.trim(),
      petType: values.petType,
      breed: optionalText(values.breed),
      gender: values.gender || undefined,
      color: optionalText(values.color),
      distinctiveFeatures: optionalText(values.distinctiveFeatures),
      description: optionalText(values.description),
      eventDate: new Date(values.eventDate).toISOString(),
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      province: optionalText(values.province),
      district: optionalText(values.district),
      locationDescription: optionalText(values.locationDescription),
      contactPhone: optionalText(values.contactPhone),
      contactLineId: optionalText(values.contactLineId),
      contactEmail: optionalText(values.contactEmail),
    };

    const result = await createPostAction(payload);
    if (!result.success) {
      setFormError(result.message);
      return;
    }

    router.push(`/posts/${result.postId}`);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>ประเภทประกาศและข้อมูลสัตว์</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['LOST', 'สัตว์เลี้ยงหาย'],
                  ['FOUND', 'พบสัตว์เลี้ยง'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={cn(
                      'rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors',
                      field.value === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-muted',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="petName">ชื่อหรือคำเรียกสัตว์ *</Label>
              <Input
                id="petName"
                placeholder="เช่น มะลิ"
                {...register('petName')}
              />
              <FieldError message={errors.petName?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="petType">ประเภทสัตว์ *</Label>
              <select
                id="petType"
                {...register('petType')}
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                {petTypeOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="breed">สายพันธุ์</Label>
              <Input
                id="breed"
                placeholder="เช่น โกลเด้น รีทรีฟเวอร์"
                {...register('breed')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gender">เพศ</Label>
              <select
                id="gender"
                {...register('gender')}
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                {genderOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="color">สี</Label>
              <Input
                id="color"
                placeholder="เช่น น้ำตาลอ่อน มีอกสีขาว"
                {...register('color')}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="distinctiveFeatures">ลักษณะเด่น</Label>
              <Input
                id="distinctiveFeatures"
                placeholder="เช่น ใส่ปลอกคอสีแดง หางสั้น"
                {...register('distinctiveFeatures')}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
              <textarea
                id="description"
                rows={4}
                placeholder="ข้อมูลที่ช่วยให้ผู้พบเห็นสังเกตและติดต่อได้ง่ายขึ้น"
                {...register('description')}
                className="w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>วันเวลาและสถานที่</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="eventDate">วันที่และเวลาเกิดเหตุ *</Label>
            <Input
              id="eventDate"
              type="datetime-local"
              {...register('eventDate')}
            />
            <FieldError message={errors.eventDate?.message} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={useCurrentLocation}
            >
              <LocateFixed className="size-4" />
              ใช้ตำแหน่งปัจจุบัน
            </Button>
            {locationNotice && (
              <p className="text-xs text-muted-foreground" role="status">
                {locationNotice}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="latitude">ละติจูด *</Label>
              <Input
                id="latitude"
                inputMode="decimal"
                {...register('latitude')}
              />
              <FieldError message={errors.latitude?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="longitude">ลองจิจูด *</Label>
              <Input
                id="longitude"
                inputMode="decimal"
                {...register('longitude')}
              />
              <FieldError message={errors.longitude?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="province">จังหวัด</Label>
              <Input id="province" {...register('province')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="district">เขต/อำเภอ</Label>
              <Input
                id="district"
                placeholder="เช่น ปทุมวัน"
                {...register('district')}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="locationDescription">รายละเอียดสถานที่</Label>
              <Input
                id="locationDescription"
                placeholder="เช่น หน้าสวนสาธารณะ ใกล้ประตูฝั่งเหนือ"
                {...register('locationDescription')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>ช่องทางติดต่อเพิ่มเติม (ไม่บังคับ)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="contactPhone">โทรศัพท์</Label>
            <Input id="contactPhone" type="tel" {...register('contactPhone')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactLineId">LINE ID</Label>
            <Input id="contactLineId" {...register('contactLineId')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactEmail">อีเมล</Label>
            <Input
              id="contactEmail"
              type="email"
              {...register('contactEmail')}
            />
            <FieldError message={errors.contactEmail?.message} />
          </div>
        </CardContent>
      </Card>

      {formError && (
        <div
          className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {formError}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting
            ? 'กำลังสร้างประกาศ...'
            : 'สร้างประกาศและไปหน้ารายละเอียด'}
        </Button>
      </div>
    </form>
  );
}
