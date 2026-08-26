'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { X } from 'lucide-react';

import {
  createCommunityPost,
  uploadCommunityImages,
} from '@/lib/api/community';
import type { CreatableCommunityPostType } from '@/types/type-community';

interface CommunityPostFormProps {
  open: boolean;
  accessToken?: string;
  onClose: () => void;
  onCreated: () => void;
}

const postTypes: Array<{
  value: CreatableCommunityPostType;
  label: string;
}> = [
  { value: 'STORY', label: 'เรื่องราว' },
  { value: 'QUESTION', label: 'ถาม-ตอบ' },
  { value: 'RECOMMENDATION', label: 'แนะนำ' },
];

const acceptedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const maxImageSize = 5 * 1024 * 1024;

export function CommunityPostForm({
  open,
  accessToken,
  onClose,
  onCreated,
}: CommunityPostFormProps) {
  const [type, setType] = useState<CreatableCommunityPostType>('STORY');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      setError('กรุณาเข้าสู่ระบบก่อนสร้างโพสต์');
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get('title') ?? '').trim();
    const content = String(formData.get('content') ?? '').trim();

    if (!title || !content) {
      setError('กรุณากรอกหัวข้อและเนื้อหา');
      return;
    }

    if (files.length > 3) {
      setError('อัปโหลดรูปได้สูงสุด 3 รูป');
      return;
    }

    const invalidFile = files.find(
      (file) => !acceptedImageTypes.has(file.type) || file.size > maxImageSize,
    );

    if (invalidFile) {
      setError('รองรับเฉพาะ JPEG, PNG, WebP และไม่เกิน 5 MB ต่อรูป');
      return;
    }

    setSubmitting(true);
    setError(undefined);

    try {
      const post = await createCommunityPost(
        {
          type,
          title,
          content,
        },
        accessToken,
      );

      if (files.length > 0) {
        await uploadCommunityImages(post.id, files, accessToken);
      }

      form.reset();
      setFiles([]);
      setType('STORY');
      onCreated();
      onClose();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : 'ไม่สามารถสร้างโพสต์ได้',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/45 px-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="community-form-title"
        className="w-full max-w-xl rounded-3xl bg-card p-6 shadow-2xl"
      >
        <header className="flex items-center justify-between">
          <h2
            id="community-form-title"
            className="text-xl font-bold text-card-foreground"
          >
            สร้างโพสต์ใหม่
          </h2>

          <button
            type="button"
            aria-label="ปิดหน้าต่าง"
            disabled={submitting}
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </header>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">ประเภทโพสต์</span>

            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as CreatableCommunityPostType)
              }
              className="h-11 w-full rounded-xl border bg-background px-3"
            >
              {postTypes.map((postType) => (
                <option key={postType.value} value={postType.value}>
                  {postType.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">หัวข้อ</span>
            <input
              name="title"
              required
              className="h-11 w-full rounded-xl border bg-background px-3"
              placeholder="หัวข้อโพสต์"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">เนื้อหา</span>
            <textarea
              name="content"
              required
              rows={6}
              className="w-full resize-none rounded-xl border bg-background p-3"
              placeholder="แบ่งปันเรื่องราวหรือคำถามของคุณ"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">
              รูปภาพ ({files.length}/3)
            </span>

            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setFiles(Array.from(event.target.files ?? []).slice(0, 3))
              }
              className="block w-full text-sm"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="h-10 rounded-full border px-5 text-sm font-semibold"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {submitting ? 'กำลังบันทึก...' : 'สร้างโพสต์'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
