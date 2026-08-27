'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera, Loader2 } from 'lucide-react';

import { UserProfile } from '@/types/user';
import { UserAvatar } from '@/components/common/UserAvatar';
import { uploadAvatarAction } from '../_actions/profile.actions';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface AvatarUploadProps {
  user: UserProfile;
}

/**
 * AvatarUpload Component (Client Component)
 * - แสดงรูป Avatar ของผู้ใช้ พร้อมปุ่มกล้องสำหรับอัปโหลดรูปใหม่ (คลุมด้วย overlay ตอน hover)
 * - ตรวจไฟล์เบื้องต้นฝั่ง Client ก่อนส่ง (ชนิดไฟล์ JPEG/PNG/WEBP, ขนาดไม่เกิน 5MB) ให้ตรงกับกฎ Backend (PATCH /users/me/avatar)
 * - อัปโหลดผ่าน Server Action (uploadAvatarAction) แล้ว router.refresh() เพื่อดึงรูปล่าสุดจาก Backend มาแสดง
 */
export function AvatarUpload({ user }: AvatarUploadProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickFile = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);

    if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type)) {
      setError('รองรับเฉพาะไฟล์ JPEG, PNG หรือ WEBP เท่านั้น');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    const res = await uploadAvatarAction(formData);

    setIsUploading(false);
    if (res.success && res.data) {
      // อัปเดต avatarUrl ใน session token ทันที (trigger: 'update' ใน auth.ts's jwt callback)
      // เพื่อให้ Header ที่อ่านจาก useSession() เห็นรูปใหม่โดยไม่ต้อง login ใหม่
      await updateSession({ user: { avatarUrl: res.data.avatarUrl } });
      router.refresh();
    } else {
      setError(res.error || 'ไม่สามารถอัปโหลดรูปอวาตาร์ได้');
      setPreviewUrl(null);
      URL.revokeObjectURL(localPreview);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-border/80 shadow-md sm:size-22">
        <UserAvatar
          src={previewUrl || user.avatarUrl}
          alt={`${user.firstName} ${user.lastName}`}
          sizes="(min-width: 640px) 88px, 64px"
          priority
        />

        {/* Overlay ปุ่มกล้อง สำหรับเปิด File Picker เพื่อเปลี่ยนรูป */}
        <button
          type="button"
          onClick={handlePickFile}
          disabled={isUploading}
          aria-label="เปลี่ยนรูปโปรไฟล์"
          className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors hover:bg-black/40 hover:text-white disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 className="size-5 animate-spin text-white" />
          ) : (
            <Camera className="size-5" />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <span className="max-w-[6.5rem] text-center text-[10px] font-semibold text-destructive sm:max-w-none">
          {error}
        </span>
      )}
    </div>
  );
}
