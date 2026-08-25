'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  MapPin,
  Calendar,
  DollarSign,
  Upload,
  ChevronLeft,
  Sparkles,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MOCK_PETS } from '@/services/pet.service';

/**
 * CreatePostPage Component (Client Component)
 * - หน้าสร้างประกาศตามหาสัตว์เลี้ยงหาย (LOST) หรือแจ้งพบสัตว์เลี้ยง (FOUND)
 */
export default function CreatePostPage() {
  const [postType, setPostType] = useState<'LOST' | 'FOUND'>('LOST');
  const [selectedPetId, setSelectedPetId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('สร้างประกาศสำเร็จ! ระบบกำลังเริ่มค้นหาด้วย AI Smart Matching');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      {/* ปุ่มย้อนกลับ */}
      <Link
        href="/posts"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        <span>กลับหน้ารวมประกาศ</span>
      </Link>

      {/* ส่วนหัวของฟอร์ม */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          สร้างประกาศตามหา / แจ้งพบสัตว์เลี้ยง
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          กรอกข้อมูลให้ละเอียดเพื่อให้ AI และคอมมูนิตี้ช่วยจับคู่และค้นหาได้อย่างรวดเร็ว
        </p>
      </div>

      {/* แบบฟอร์มสร้างประกาศ */}
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        {/* 1. เลือกประเภทประกาศ (LOST / FOUND) */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold">ประเภทประกาศ</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPostType('LOST')}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition-all ${
                postType === 'LOST'
                  ? 'border-destructive bg-destructive/10 text-destructive font-bold'
                  : 'border-border bg-card text-muted-foreground'
              }`}
            >
              <span className="text-base">📢 สัตว์เลี้ยงหาย (LOST)</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                ตามหาสัตว์เลี้ยงของฉัน
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPostType('FOUND')}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition-all ${
                postType === 'FOUND'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold'
                  : 'border-border bg-card text-muted-foreground'
              }`}
            >
              <span className="text-base">🐾 พบสัตว์เลี้ยง (FOUND)</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                พบสัตว์เลี้ยงหลงทาง
              </span>
            </button>
          </div>
        </div>

        {/* 2. เลือกจากโปรไฟล์สัตว์เลี้ยงเดิม (ถ้ามี) */}
        {postType === 'LOST' && (
          <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-muted/20 p-4">
            <Label htmlFor="selectPet" className="text-xs font-semibold">
              เลือกจากโปรไฟล์สัตว์เลี้ยงของคุณ
            </Label>
            <select
              id="selectPet"
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-xs sm:text-sm"
            >
              <option value="">-- กรอกข้อมูลสัตว์เลี้ยงใหม่ --</option>
              {MOCK_PETS.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.type === 'CAT' ? 'แมว' : 'สุนัข'} - {pet.breed})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 3. หัวข้อประกาศและชื่อสัตว์เลี้ยง */}
        <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="text-base font-bold text-foreground">ข้อมูลสัตว์เลี้ยง</h3>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">
              หัวข้อประกาศ <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="เช่น ตามหาน้องลูน่า แมววิเชียรมาศ หายแถวพญาไท"
              className="rounded-2xl"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">สายพันธุ์</Label>
              <Input placeholder="เช่น วิเชียรมาศ, ไซบีเรียน" className="rounded-2xl" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">สี / ลวดลาย</Label>
              <Input placeholder="เช่น สีครีม, ปลายหางเข้ม" className="rounded-2xl" />
            </div>
          </div>
        </div>

        {/* 4. สถานที่และเวลาที่พลัดหลง */}
        <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="text-base font-bold text-foreground">สถานที่และเวลา</h3>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">
              สถานที่พบเห็นล่าสุด <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="เช่น บริเวณซอยพญาไท 1 ใกล้สถานีรถไฟฟ้า BTS"
              className="rounded-2xl"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">จังหวัด</Label>
              <Input defaultValue="กรุงเทพมหานคร" className="rounded-2xl" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">วันที่และเวลาที่หาย</Label>
              <Input type="datetime-local" className="rounded-2xl" />
            </div>
          </div>
        </div>

        {/* 5. ปุ่ม Submit */}
        <Button
          type="submit"
          className="h-12 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          <Sparkles className="mr-2 size-5" />
          <span>เผยแพร่ประกาศและเริ่มค้นหาด้วย AI</span>
        </Button>
      </form>
    </div>
  );
}
