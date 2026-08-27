import Image from 'next/image';
import { UserRound } from 'lucide-react';

interface UserAvatarProps {
  /** URL รูปโปรไฟล์ผู้ใช้ ถ้าเป็น null/undefined/ว่าง จะแสดงไอคอนสำรองแทน */
  src?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
}

/**
 * UserAvatar Component (ใช้แทน <Image fill /> เดิมทุกจุดที่แสดงรูปโปรไฟล์ผู้ใช้)
 * - ใช้แทนที่ตำแหน่ง <Image fill /> โดยตรง: parent ต้องมี position: relative,
 *   overflow-hidden, rounded-full และกำหนดขนาดไว้แล้ว (เช่น size-10)
 * - มี avatarUrl -> แสดงรูปโปรไฟล์จริงผ่าน next/image
 * - ไม่มี avatarUrl -> แสดงไอคอนสำรอง: วงกลมพื้นเข้ม (bg-foreground) + ไอคอนรูปคนสีขาว (text-background)
 *   ใช้ Semantic Color Tokens เพื่อให้กลับสีถูกต้องอัตโนมัติเมื่อสลับ Dark Mode
 */
export function UserAvatar({ src, alt, sizes, priority }: UserAvatarProps) {
  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-foreground">
        <UserRound className="h-3/5 w-3/5 text-background" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover"
      priority={priority}
    />
  );
}
