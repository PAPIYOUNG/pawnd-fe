'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Plus,
  X,
  Sparkles,
  MapPin,
  Calendar,
  Phone,
  Wand2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Eye,
  Check,
  Share2,
  ShieldCheck,
  AlertCircle,
  Coins,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { PetGender, PetType } from '@/types/post';

/**
 * CreatePostForm Component (Client Component)
 * - ฟอร์มสร้างประกาศแจ้งสัตว์เลี้ยงหายแบบ 2 ขั้นตอน (2-Step Streamlined Flow):
 *   Step 1: กรอกข้อมูลสัตว์เลี้ยงและอัปโหลดรูปภาพ
 *   Step 2: ตรวจสอบและดูตัวอย่างประกาศ (Live Preview) ก่อนยืนยันเผยแพร่
 * - รองรับระบบ AI วิเคราะห์ภาพถ่ายและช่วยเขียนคำบรรยาย
 */
export function CreatePostForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State ขั้นตอน: 1 = กรอกข้อมูล, 2 = ตรวจสอบ & ดูตัวอย่าง (Preview)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // State รูปภาพที่อัปโหลด (สูงสุด 5 รูป)
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=600&auto=format&fit=crop',
  ]);

  // State ข้อมูลสัตว์เลี้ยง
  const [petName, setPetName] = useState('น้องส้มส้ม');
  const [petType, setPetType] = useState<PetType>('CAT');
  const [breed, setBreed] = useState('แมวไทย (สลิด)');
  const [color, setColor] = useState('สีส้มสลับขาว');
  const [gender, setGender] = useState<PetGender>('FEMALE');
  const [distinctiveFeatures, setDistinctiveFeatures] = useState(
    'น้องค่อนข้างเชื่อง กลัวคนแปลกหน้าเล็กน้อย มีปลอกคอสีแดงพร้อมกระดิ่งสีเงิน ชอบนอนตามพุ่มไม้เตี้ยๆ ติดขนสีส้มที่หาง'
  );
  const [locationDescription, setLocationDescription] = useState(
    'เขตลาดพร้าว, กรุงเทพมหานคร'
  );
  const [eventDate, setEventDate] = useState('12 ตุลาคม 2568 - เวลา 14:30 น.');
  const [rewardAmount, setRewardAmount] = useState('5,000');
  const [contactPhone, setContactPhone] = useState('089-123-4567');

  // State AI Assistant & Toast Notification
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // ฟังก์ชันอัปโหลดรูปภาพ (จำกัดสูงสุด 3 รูปตามกฎ Backend)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      if (images.length + newUrls.length < 3) {
        newUrls.push(URL.createObjectURL(files[i]));
      }
    }
    setImages((prev) => [...prev, ...newUrls].slice(0, 3));
  };

  // ลบรูปภาพเดี่ยว
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // เรียก AI วิเคราะห์สายพันธุ์และสีขนจากภาพถ่าย
  const handleAiAnalyzeImage = () => {
    setIsAnalyzingAi(true);
    setTimeout(() => {
      setIsAnalyzingAi(false);
      setBreed('แมวไทย พันธุ์ศุภลักษณ์ผสมเปอร์เซีย');
      setColor('สีส้ม ลายสลิด มีแต้มขาวที่อก');
      setShowToast('AI วิเคราะห์สายพันธุ์และสีขนเรียบร้อยแล้ว');
      setTimeout(() => setShowToast(null), 3000);
    }, 1200);
  };

  // เรียก AI ช่วยเขียนคำบรรยายลักษณะเด่น
  const handleAiGenerateDescription = () => {
    setIsGeneratingDesc(true);
    setTimeout(() => {
      setIsGeneratingDesc(false);
      setDistinctiveFeatures(
        `น้อง${petName} มีดวงตาสีอำพันสดใส รูปร่างสมส่วน ขนสั้นนุ่มสีส้มลายสลิด ปลายหางเรียวยาว สวมปลอกคอสีแดง นิสัยขี้อ้อนแต่ระแวงเสียงดัง`
      );
      setShowToast('AI สร้างคำบรรยายลักษณะเด่นสำเร็จ');
      setTimeout(() => setShowToast(null), 3000);
    }, 1000);
  };

  // ไปยังขั้นตอนที่ 2 (ตรวจสอบก่อนยืนยัน)
  const handleGoToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !breed || !locationDescription || !contactPhone) {
      alert('กรุณากรอกข้อมูลสำคัญให้ครบถ้วนก่อนไปขั้นตอนตรวจสอบ');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ยืนยันและเผยแพร่ประกาศทันที
  const handleFinalPublish = () => {
    setShowToast('เผยแพร่ประกาศสำเร็จ! ระบบกำลังเริ่มค้นหาด้วย AI Smart Matching');
    setTimeout(() => {
      router.push('/posts');
    }, 1500);
  };

  const getPetTypeLabel = (type: PetType) => {
    switch (type) {
      case 'CAT':
        return 'แมว';
      case 'DOG':
        return 'สุนัข';
      case 'BIRD':
        return 'นก';
      case 'HAMSTER':
        return 'แฮมสเตอร์';
      case 'EXOTIC':
        return 'สัตว์พิเศษ';
      default:
        return 'อื่นๆ';
    }
  };

  const getGenderLabel = (g: PetGender) => {
    switch (g) {
      case 'MALE':
        return 'ตัวผู้';
      case 'FEMALE':
        return 'ตัวเมีย';
      default:
        return 'ไม่ระบุเพศ';
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* 1. ส่วนหัวของหน้าประกาศ */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400 sm:text-3xl lg:text-4xl">
          {currentStep === 1 ? 'แจ้งสัตว์เลี้ยงหาย' : 'ตรวจสอบและยืนยันประกาศ'}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          {currentStep === 1
            ? 'กรอกข้อมูลสัตว์เลี้ยงของคุณเพื่อสร้างประกาศตามหาในระบบ แผนที่ และแชร์ไปยังชุมชน'
            : 'ตรวจสอบความถูกต้องของข้อมูลและตัวอย่างประกาศก่อนเผยแพร่สู่ระบบ'}
        </p>
      </div>

      {/* Toast แจ้งเตือน */}
      {showToast && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 p-4 text-xs font-bold text-emerald-800 sm:text-sm dark:text-emerald-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          <span>{showToast}</span>
        </div>
      )}

      {/* 2. ตัวระบุความคืบหน้า 2-Step Wizard (Streamlined Progress Bar) */}
      <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs sm:p-5">
        {/* Step 1 */}
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div
            className={cn(
              'flex size-8 items-center justify-center rounded-full text-xs font-bold shadow-xs transition-colors',
              currentStep === 1
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
            )}
          >
            {currentStep === 2 ? <Check className="size-4 stroke-[3]" /> : '1'}
          </div>
          <div className="flex flex-col">
            <span
              className={cn(
                'text-xs font-bold sm:text-sm transition-colors',
                currentStep === 1
                  ? 'text-emerald-800 dark:text-emerald-400'
                  : 'text-foreground'
              )}
            >
              1. กรอกข้อมูลสัตว์เลี้ยง
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              รูปภาพและรายละเอียด
            </span>
          </div>
        </button>

        {/* เส้นเชื่อมต่อระหว่าง Step */}
        <div className="mx-4 h-0.5 flex-1 bg-border/80 sm:mx-8" />

        {/* Step 2 */}
        <div className="flex items-center gap-2.5 text-left">
          <div
            className={cn(
              'flex size-8 items-center justify-center rounded-full text-xs font-bold shadow-xs transition-colors',
              currentStep === 2
                ? 'bg-emerald-700 text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            2
          </div>
          <div className="flex flex-col">
            <span
              className={cn(
                'text-xs font-bold sm:text-sm transition-colors',
                currentStep === 2
                  ? 'text-emerald-800 dark:text-emerald-400'
                  : 'text-muted-foreground'
              )}
            >
              2. ตรวจสอบ & ยืนยัน
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              ดูตัวอย่างก่อนเผยแพร่
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STEP 1: หน้าฟอร์มกรอกข้อมูลสัตว์เลี้ยง (Form View) */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-8 lg:p-10 dark:border-border/60 animate-in fade-in duration-200">
          <form onSubmit={handleGoToReview} className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            {/* ฝั่งซ้าย: รูปภาพสัตว์เลี้ยง (Pet Images) */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              <h3 className="text-base font-bold text-foreground sm:text-lg">
                รูปภาพสัตว์เลี้ยง
              </h3>

              {/* กล่อง Dashed Dropzone ขนาดใหญ่ */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-500/50 bg-emerald-50/40 p-6 text-center transition-all hover:border-emerald-600 hover:bg-emerald-50/80 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 sm:min-h-[250px]"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-xs transition-transform group-hover:scale-110 dark:bg-emerald-900/60 dark:text-emerald-300">
                  <Camera className="size-7 stroke-[2.2]" />
                </div>
                <span className="mt-3.5 text-sm font-bold text-foreground group-hover:text-emerald-700 sm:text-base dark:group-hover:text-emerald-300">
                  คลิกเพื่ออัปโหลดรูปภาพ
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  อัปโหลดได้สูงสุด 3 รูป (ไฟล์ JPG, PNG, WEBP)
                </span>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* รายการ Thumbnails */}
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative size-18 shrink-0 overflow-hidden rounded-2xl border-2 border-border shadow-xs"
                  >
                    <Image src={imgUrl} alt={`รูปที่ ${idx + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-white shadow-xs transition-transform hover:scale-110"
                      aria-label="ลบรูปภาพ"
                    >
                      <X className="size-3 stroke-[3]" />
                    </button>
                  </div>
                ))}

                {Array.from({ length: Math.max(0, 3 - images.length) }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex size-18 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    aria-label="เพิ่มรูปภาพเพิ่มเติม"
                  >
                    <Plus className="size-6" />
                  </button>
                ))}
              </div>

              {/* ปุ่ม AI วิเคราะห์สายพันธุ์และลักษณะสีขน */}
              <button
                type="button"
                onClick={handleAiAnalyzeImage}
                disabled={isAnalyzingAi}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-300 bg-purple-100/70 py-3 text-xs font-bold text-purple-800 shadow-2xs transition-all hover:bg-purple-100 active:scale-95 disabled:opacity-50 sm:text-sm dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
              >
                <Sparkles className="size-4 text-purple-600 dark:text-purple-400" />
                <span>
                  {isAnalyzingAi
                    ? 'กำลังวิเคราะห์ภาพถ่าย...'
                    : '✨ AI วิเคราะห์สายพันธุ์และลักษณะสีขน'}
                </span>
              </button>
            </div>

            {/* ฝั่งขวา: ข้อมูลรายละเอียดสัตว์เลี้ยง */}
            <div className="flex flex-col gap-4 lg:col-span-7">
              <h3 className="text-base font-bold text-foreground sm:text-lg">
                ข้อมูลรายละเอียดสัตว์เลี้ยง
              </h3>

              {/* ชื่อ & ประเภท */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="petName" className="text-xs font-semibold">
                    ชื่อสัตว์เลี้ยง <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="petName"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="เช่น น้องส้มส้ม"
                    className="rounded-2xl"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="petType" className="text-xs font-semibold">
                    ประเภทสัตว์เลี้ยง <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="petType"
                    value={petType}
                    onChange={(e) => setPetType(e.target.value as PetType)}
                    className="h-10 rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="CAT">แมว</option>
                    <option value="DOG">สุนัข</option>
                    <option value="BIRD">นก</option>
                    <option value="HAMSTER">แฮมสเตอร์</option>
                    <option value="EXOTIC">สัตว์พิเศษ</option>
                    <option value="OTHER">อื่นๆ</option>
                  </select>
                </div>
              </div>

              {/* สายพันธุ์ & สีขนหลัก */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="breed" className="text-xs font-semibold">
                    สายพันธุ์ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="เช่น แมวไทย (สลิด)"
                    className="rounded-2xl"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="color" className="text-xs font-semibold">
                    สีขนหลัก <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="เช่น สีส้มสลับขาว"
                    className="rounded-2xl"
                    required
                  />
                </div>
              </div>

              {/* เพศ */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">
                  เพศ <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap items-center gap-5 pt-1 text-xs sm:text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="MALE"
                      checked={gender === 'MALE'}
                      onChange={() => setGender('MALE')}
                      className="size-4 accent-emerald-600"
                    />
                    <span>ตัวผู้</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="FEMALE"
                      checked={gender === 'FEMALE'}
                      onChange={() => setGender('FEMALE')}
                      className="size-4 accent-emerald-600"
                    />
                    <span>ตัวเมีย</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="UNKNOWN"
                      checked={gender === 'UNKNOWN'}
                      onChange={() => setGender('UNKNOWN')}
                      className="size-4 accent-emerald-600"
                    />
                    <span>ไม่ทราบเพศ / ไม่ระบุ</span>
                  </label>
                </div>
              </div>

              {/* ลักษณะเด่น */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="features" className="text-xs font-semibold">
                    ลักษณะเด่น / ข้อมูลเพิ่มเติม <span className="text-destructive">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={handleAiGenerateDescription}
                    disabled={isGeneratingDesc}
                    className="flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 hover:bg-purple-200 dark:bg-purple-950 dark:text-purple-300"
                  >
                    <Wand2 className="size-3" />
                    <span>
                      {isGeneratingDesc ? 'กำลังเขียน...' : '✨ AI ช่วยเขียนคำบรรยาย'}
                    </span>
                  </button>
                </div>
                <textarea
                  id="features"
                  rows={3}
                  value={distinctiveFeatures}
                  onChange={(e) => setDistinctiveFeatures(e.target.value)}
                  placeholder="ระบุจุดสังเกต เช่น มีปลอกคอ แผลเป็น นิสัย หรือพฤติกรรม..."
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                  required
                />
              </div>

              {/* พิกัด & วันที่หาย */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="location" className="text-xs font-semibold">
                    พิกัด/สถานที่หาย <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary" />
                    <Input
                      id="location"
                      value={locationDescription}
                      onChange={(e) => setLocationDescription(e.target.value)}
                      placeholder="เช่น เขตลาดพร้าว, กรุงเทพมหานคร"
                      className="rounded-2xl pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="datetime" className="text-xs font-semibold">
                    วันที่และเวลาที่หาย <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary" />
                    <Input
                      id="datetime"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="เช่น 12 ตุลาคม 2568 - เวลา 14:30 น."
                      className="rounded-2xl pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* รางวัล & เบอร์ติดต่อ */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reward" className="text-xs font-semibold">
                    เงินรางวัลนำส่ง (ถ้ามี)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                      ฿
                    </span>
                    <Input
                      id="reward"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(e.target.value)}
                      placeholder="5,000"
                      className="rounded-2xl pl-8 font-semibold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold">
                    เบอร์ติดต่อเจ้าของ <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary" />
                    <Input
                      id="phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="เช่น 089-123-4567"
                      className="rounded-2xl pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* แถบ Action ด้านล่างของ Step 1 */}
            <div className="lg:col-span-12 flex items-center justify-between border-t border-dashed border-border/80 pt-5 mt-2">
              <Link
                href="/posts"
                className="text-xs font-bold text-muted-foreground hover:text-foreground sm:text-sm underline-offset-4 hover:underline"
              >
                ยกเลิก
              </Link>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowToast('บันทึกฉบับร่างเรียบร้อยแล้ว');
                    setTimeout(() => setShowToast(null), 3000);
                  }}
                  className="h-11 rounded-full sm:rounded-2xl border-emerald-700/60 px-5 text-xs font-bold text-emerald-800 sm:text-sm hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                >
                  บันทึกฉบับร่าง
                </Button>

                {/* ปุ่มไปยังขั้นตอนตรวจสอบ */}
                <Button
                  type="submit"
                  className="h-11 rounded-full sm:rounded-2xl bg-emerald-800 px-6 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 hover:bg-emerald-900 sm:text-sm"
                >
                  <span>ตรวจสอบก่อนยืนยัน</span>
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STEP 2: หน้าตรวจสอบและดูตัวอย่างประกาศ (Live Preview View) */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* แบนเนอร์ AI Readiness & Confirmation Alert */}
          <div className="flex items-center gap-3 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4.5 sm:p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-300">
                ระบบพร้อมกระจายประกาศและเปิดใช้งาน AI Smart Matching
              </span>
              <p className="text-xs text-muted-foreground">
                เมื่อกดยืนยัน ประกาศจะขึ้นบนหน้าฟีด แผนที่เรียลไทม์ และเริ่มสแกนจับคู่กับสัตว์เลี้ยงที่พบเห็นทันที
              </p>
            </div>
          </div>

          {/* กล่องแสดงตัวอย่างประกาศ (2 คอลัมน์) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* ฝั่งซ้าย: การ์ดตัวอย่างประกาศจริง (Feed Card Preview) - 5 Cols */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="size-4 text-primary" />
                <span>ตัวอย่างการ์ดบนหน้าฟีด</span>
              </h3>

              <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg">
                <div className="relative h-60 w-full bg-muted">
                  <Image
                    src={
                      images[0] ||
                      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=600&auto=format&fit=crop'
                    }
                    alt={petName}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-destructive px-3 py-1 text-xs font-bold text-white shadow-xs">
                      ตามหา (LOST)
                    </span>
                  </div>

                  {rewardAmount && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-xs">
                      <Coins className="size-3.5" />
                      <span>รางวัล ฿{rewardAmount}</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h4 className="text-lg font-bold text-foreground">{petName}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getPetTypeLabel(petType)} • {breed} • {getGenderLabel(gender)}
                  </p>

                  <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground border-t border-border/50 pt-3">
                    <span className="flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      {locationDescription}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      {eventDate}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-foreground">
                      <Phone className="size-3.5 text-primary shrink-0" />
                      {contactPhone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ฝั่งขวา: รายการสรุปข้อมูลทั้งหมด (Summary Fact Sheet) - 7 Cols */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                สรุปข้อมูลที่กรอกทั้งหมด
              </h3>

              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm flex flex-col gap-4">
                {/* ข้อมูลทั่วไป */}
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="rounded-2xl bg-muted/40 p-3">
                    <span className="text-xs text-muted-foreground">ชื่อสัตว์เลี้ยง</span>
                    <p className="font-bold text-foreground mt-0.5">{petName}</p>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-3">
                    <span className="text-xs text-muted-foreground">ประเภท & สายพันธุ์</span>
                    <p className="font-bold text-foreground mt-0.5">
                      {getPetTypeLabel(petType)} ({breed})
                    </p>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-3">
                    <span className="text-xs text-muted-foreground">สีขน & เพศ</span>
                    <p className="font-bold text-foreground mt-0.5">
                      {color} • {getGenderLabel(gender)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-3">
                    <span className="text-xs text-muted-foreground">เงินรางวัล</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {rewardAmount ? `฿ ${rewardAmount} บาท` : 'ไม่มีระบุ'}
                    </p>
                  </div>
                </div>

                {/* ลักษณะเด่น */}
                <div className="rounded-2xl bg-muted/30 p-4 border border-border/60">
                  <span className="text-xs font-bold text-foreground">
                    ลักษณะเด่น / จุดสังเกต:
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                    {distinctiveFeatures}
                  </p>
                </div>

                {/* สถานที่และเบอร์ติดต่อ */}
                <div className="flex flex-col gap-2 rounded-2xl bg-emerald-50/50 p-4 border border-emerald-500/20 text-xs sm:text-sm dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <MapPin className="size-4 text-emerald-600 shrink-0" />
                    <span>สถานที่: {locationDescription}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Calendar className="size-4 text-emerald-600 shrink-0" />
                    <span>เวลาที่หาย: {eventDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Phone className="size-4 text-emerald-600 shrink-0" />
                    <span>เบอร์ติดต่อ: {contactPhone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* แถบ Action ด้านล่างของ Step 2 */}
          <div className="flex items-center justify-between border-t border-dashed border-border/80 pt-6 mt-4">
            {/* ปุ่มกลับไปแก้ไขข้อมูล */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="h-11 rounded-full sm:rounded-2xl border-border px-5 text-xs font-bold text-foreground sm:text-sm hover:bg-muted"
            >
              <ArrowLeft className="mr-1.5 size-4" />
              <span>กลับไปแก้ไขข้อมูล</span>
            </Button>

            {/* ปุ่มบันทึกฉบับร่าง & ปุ่มยืนยันและเผยแพร่ประกาศ */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowToast('บันทึกฉบับร่างเรียบร้อยแล้ว');
                  setTimeout(() => setShowToast(null), 3000);
                }}
                className="h-11 rounded-full sm:rounded-2xl border-emerald-700/60 px-5 text-xs font-bold text-emerald-800 sm:text-sm hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
              >
                บันทึกฉบับร่าง
              </Button>

              <Button
                type="button"
                onClick={handleFinalPublish}
                className="h-11 rounded-full sm:rounded-2xl bg-emerald-800 px-7 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-900 sm:text-sm"
              >
                <Sparkles className="mr-1.5 size-4" />
                <span>ยืนยันและเผยแพร่ประกาศ</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
