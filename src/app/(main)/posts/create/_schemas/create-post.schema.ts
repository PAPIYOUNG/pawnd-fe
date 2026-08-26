import { z } from 'zod';

/**
 * Schema ตรวจสอบค่าจากฟอร์ม Create Post ก่อนเข้าสู่หน้า Preview
 * กฎความยาวและค่าที่จำเป็นยึดตาม CreatePostDto ของ Backend ที่มีอยู่จริง
 */
export const createPostFormSchema = z.object({
  petName: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกชื่อสัตว์เลี้ยง')
    .max(100, 'ชื่อสัตว์เลี้ยงต้องไม่เกิน 100 ตัวอักษร'),
  petType: z.enum(['DOG', 'CAT', 'BIRD', 'HAMSTER', 'EXOTIC', 'OTHER']),
  breed: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกสายพันธุ์ หรือระบุว่าไม่ทราบสายพันธุ์')
    .max(150, 'สายพันธุ์ต้องไม่เกิน 150 ตัวอักษร'),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']),
  color: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกสีหรือลักษณะภายนอก')
    .max(150, 'สีหรือลักษณะภายนอกต้องไม่เกิน 150 ตัวอักษร'),
  distinctiveFeatures: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกลักษณะเด่นหรือข้อมูลเพิ่มเติม'),
  locationDescription: z.string().trim().min(1, 'กรุณากรอกสถานที่เกิดเหตุ'),
  eventDate: z.string().trim().min(1, 'กรุณาระบุวันที่และเวลาเกิดเหตุ'),
  rewardAmount: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;

      const normalized = value.replace(/,/g, '');
      return (
        /^\d+$/.test(normalized) && Number.isSafeInteger(Number(normalized))
      );
    }, 'เงินรางวัลต้องเป็นจำนวนเต็มที่ไม่ติดลบ เช่น 5,000'),
  contactPhone: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกเบอร์ติดต่อ')
    .max(30, 'เบอร์ติดต่อยาวเกิน 30 ตัวอักษร')
    .regex(/^[0-9+()\-\s]+$/, 'รูปแบบเบอร์ติดต่อไม่ถูกต้อง'),
});

export type CreatePostFormValues = z.infer<typeof createPostFormSchema>;
