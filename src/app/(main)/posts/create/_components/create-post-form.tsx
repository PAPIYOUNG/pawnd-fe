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
  Search,
  PawPrint,
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
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PetGender, PetType, PostType } from '@/types/post';
import { AiAnalysisResult } from '@/services/ai.service';
import {
  createPostAction,
  analyzeImageAction,
  uploadPostImagesAction,
} from '../_actions/create-post.actions';

// ขนาดด้านยาวสุดของรูปหลัง resize และคุณภาพ JPEG ที่ใช้ส่งให้ AI วิเคราะห์
// รูปจากกล้องมือถือ (2-8MB) พอ resize ตามนี้แล้วมักจะเหลือไม่เกินไม่กี่ร้อย KB
// ป้องกัน error "Body exceeded 1 MB limit" ของ Next.js Server Action ตอนส่ง Base64
const AI_IMAGE_MAX_DIMENSION = 1024;
const AI_IMAGE_JPEG_QUALITY = 0.8;

/** ตัวเลือกประเภทประกาศที่ตรงกับ PostType enum ของ Backend */
const POST_TYPE_OPTIONS: Array<{
  value: PostType;
  title: string;
  description: string;
}> = [
  {
    value: 'LOST',
    title: 'สัตว์เลี้ยงของฉันหาย',
    description: 'ฉันกำลังตามหาสัตว์เลี้ยงของตัวเอง',
  },
  {
    value: 'FOUND',
    title: 'ฉันพบสัตว์',
    description: 'ฉันพบสัตว์ที่อาจเป็นของคนอื่น',
  },
];

/**
 * ย่อขนาดรูปภาพด้วย Canvas แล้วแปลงเป็น Base64 Data URL (JPEG)
 * ใช้สำหรับส่งรูปภาพที่ยังไม่ได้อัปโหลดขึ้น server ไปให้ AI วิเคราะห์
 * (เพราะตอนกรอกฟอร์มยังไม่มีประกาศให้ผูกไฟล์ด้วย จึงยังไม่มี URL สาธารณะ)
 * ใช้ window.Image ตรงๆ (ไม่ใช่ตัว Image ที่ import จาก next/image) เพื่อสร้าง HTMLImageElement
 */
function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      const scale = Math.min(1, AI_IMAGE_MAX_DIMENSION / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(objectUrl);

      if (!ctx) {
        reject(new Error('ไม่สามารถประมวลผลรูปภาพได้'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', AI_IMAGE_JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('ไม่สามารถโหลดรูปภาพได้'));
    };
    img.src = objectUrl;
  });
}

/**
 * สร้าง key สำหรับระบุตัวตนของรูปภาพที่ใช้วิเคราะห์ (ใช้เทียบว่าเป็นรูปเดิมหรือไม่)
 * ไฟล์จริงใช้ name+size+lastModified ส่วน URL (เช่นรูปตัวอย่าง mock) ใช้ค่า URL เป็น key ตรงๆ
 */
function getImageKey(file: File | null, fallbackUrl: string): string {
  return file ? `${file.name}-${file.size}-${file.lastModified}` : fallbackUrl;
}

/**
 * CreatePostForm Component (Client Component)
 * - ฟอร์มสร้างประกาศ Lost & Found แบบ 3 ขั้นตอน:
 *   Step 0: เลือกประเภทประกาศ
 *   Step 1: กรอกข้อมูลสัตว์เลี้ยงและอัปโหลดรูปภาพ
 *   Step 2: ตรวจสอบและดูตัวอย่างประกาศ (Live Preview) ก่อนยืนยันเผยแพร่
 * - รองรับระบบ AI วิเคราะห์ภาพถ่ายและช่วยเขียนคำบรรยาย
 */
export function CreatePostForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State ขั้นตอน: 0 = เลือกประเภท, 1 = กรอกข้อมูล, 2 = ตรวจสอบ & ดูตัวอย่าง
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0);

  // State ประเภทประกาศที่เลือก ซึ่งจะถูกส่งเป็น PostType ไปยัง Backend ตอนเผยแพร่
  const [postType, setPostType] = useState<PostType | null>(null);

  // State รูปภาพที่อัปโหลด (สูงสุด 5 รูป) — เก็บเป็น Preview URL สำหรับแสดงผล
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=600&auto=format&fit=crop',
  ]);

  // State ไฟล์ต้นฉบับของรูปภาพ (คู่กับ images ตาม index) ใช้แปลงเป็น Base64 ส่งให้ AI วิเคราะห์
  // รูปตัวอย่างเริ่มต้น (mock) ไม่มีไฟล์จริง จึงเป็น null
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null]);

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
  const [isPublishing, setIsPublishing] = useState(false);
  // เก็บ id ของโพสต์ที่สร้างสำเร็จแต่ยังอัปโหลดรูปไม่ผ่าน เพื่อให้กดลองอัปโหลดซ้ำได้โดยไม่สร้างโพสต์ซ้ำ
  const [pendingUploadPostId, setPendingUploadPostId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Cache ผลวิเคราะห์ AI ล่าสุด ผูกกับ imageKey ของรูปที่ใช้วิเคราะห์
  // ป้องกันการยิง /analyze-image ซ้ำเมื่อกดปุ่ม AI ทั้งสองปุ่มกับรูปเดิม
  const [aiAnalysisCache, setAiAnalysisCache] = useState<{
    imageKey: string;
    data: AiAnalysisResult;
  } | null>(null);

  // ฟังก์ชันอัปโหลดรูปภาพ (จำกัดสูงสุด 3 รูปตามกฎ Backend)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];
    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (images.length + newUrls.length < 3) {
        newUrls.push(URL.createObjectURL(files[i]));
        newFiles.push(files[i]);
      }
    }
    setImages((prev) => [...prev, ...newUrls].slice(0, 3));
    setImageFiles((prev) => [...prev, ...newFiles].slice(0, 3));
    // รูปแรกอาจเปลี่ยน (ถ้าเดิมยังไม่มีรูปเลย) → ล้าง cache ผลวิเคราะห์เก่าทิ้ง
    setAiAnalysisCache(null);
  };

  // ลบรูปภาพเดี่ยว (ลบทั้ง Preview URL และไฟล์ต้นฉบับที่ index เดียวกัน)
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    // รูปแรกอาจเปลี่ยนไปเป็นรูปอื่น → ล้าง cache ผลวิเคราะห์เก่าทิ้ง
    setAiAnalysisCache(null);
  };

  // เรียก AI วิเคราะห์รูปภาพ (POST /analyze-image) จากรูปแรกที่อัปโหลด
  // ถ้ารูปเดิมเคยวิเคราะห์แล้ว (imageKey ตรงกับ cache) จะ reuse ผลลัพธ์เดิมแทนการยิง request ซ้ำ
  // คืนค่า Promise<AiAnalysisResult> เพื่อให้ handler แต่ละตัวนำ field ที่ต้องการไปใช้ต่อได้เอง
  const runAiImageAnalysis = async () => {
    const file = imageFiles[0];
    const imageKey = getImageKey(file, images[0]);

    if (aiAnalysisCache?.imageKey === imageKey) {
      return { success: true as const, data: aiAnalysisCache.data };
    }

    // ถ้ามีไฟล์จริง (ผู้ใช้เพิ่งอัปโหลด) ต้อง resize + แปลงเป็น Base64 ก่อน
    // (ยังไม่มีประกาศให้ผูกไฟล์ และต้อง resize ไม่ให้เกิน limit ของ Server Action)
    // ถ้าไม่มีไฟล์ (เช่นรูปตัวอย่าง mock) แปลว่า images[0] เป็น URL ที่เข้าถึงได้อยู่แล้ว
    const imageUrl = file ? await resizeImageToDataUrl(file) : images[0];
    const res = await analyzeImageAction(imageUrl);

    if (res.success && res.data) {
      setAiAnalysisCache({ imageKey, data: res.data });
    }

    return res;
  };

  // เรียก AI วิเคราะห์ประเภท สายพันธุ์ และสีขนจากภาพถ่าย
  const handleAiAnalyzeImage = async () => {
    if (images.length === 0) {
      setShowToast('กรุณาอัปโหลดรูปภาพก่อนเริ่มวิเคราะห์');
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    setIsAnalyzingAi(true);
    try {
      const res = await runAiImageAnalysis();
      if (res.success && res.data) {
        setPetType(res.data.type);
        if (res.data.breed) setBreed(res.data.breed);
        if (res.data.color) setColor(res.data.color);
        setShowToast('AI วิเคราะห์สายพันธุ์และสีขนเรียบร้อยแล้ว');
      } else {
        setShowToast(`วิเคราะห์รูปภาพไม่สำเร็จ: ${res.error ?? 'กรุณาลองใหม่อีกครั้ง'}`);
      }
    } catch {
      setShowToast('เกิดข้อผิดพลาดขณะวิเคราะห์รูปภาพ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsAnalyzingAi(false);
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  // เรียก AI ช่วยเขียนคำบรรยายลักษณะเด่น (ใช้ field "description" จากผลวิเคราะห์ภาพชุดเดียวกัน)
  const handleAiGenerateDescription = async () => {
    if (images.length === 0) {
      setShowToast('กรุณาอัปโหลดรูปภาพก่อนให้ AI ช่วยเขียนคำบรรยาย');
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    setIsGeneratingDesc(true);
    try {
      const res = await runAiImageAnalysis();
      const generatedText = res.data?.description || res.data?.distinctiveFeatures;

      if (res.success && generatedText) {
        setDistinctiveFeatures(generatedText);
        setShowToast('AI สร้างคำบรรยายลักษณะเด่นสำเร็จ');
      } else {
        setShowToast(
          res.success
            ? 'AI ไม่สามารถสร้างคำบรรยายจากรูปภาพนี้ได้'
            : `สร้างคำบรรยายไม่สำเร็จ: ${res.error ?? 'กรุณาลองใหม่อีกครั้ง'}`
        );
      }
    } catch {
      setShowToast('เกิดข้อผิดพลาดขณะสร้างคำบรรยาย กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGeneratingDesc(false);
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  // ไปยังขั้นตอนที่ 2 (ตรวจสอบก่อนยืนยัน)
  const handleGoToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postType) {
      setCurrentStep(0);
      setShowToast('กรุณาเลือกประเภทประกาศก่อนกรอกข้อมูล');
      return;
    }
    if (!petName || !breed || !locationDescription || !contactPhone) {
      alert('กรุณากรอกข้อมูลสำคัญให้ครบถ้วนก่อนไปขั้นตอนตรวจสอบ');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ยืนยันและเผยแพร่ประกาศทันที (เชื่อมต่อ Backend createPostAction)
  const handleFinalPublish = async () => {
    setIsPublishing(true);

    try {
      if (!postType) {
        setCurrentStep(0);
        setShowToast('กรุณาเลือกประเภทประกาศก่อนเผยแพร่');
        return;
      }

      const selectedFiles = imageFiles.filter(
        (file): file is File => file !== null,
      );

      if (selectedFiles.length === 0) {
        setShowToast('กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูปก่อนเผยแพร่ประกาศ');
        return;
      }

      // สร้าง FormData เฉพาะจากไฟล์จริง แล้วส่งไปยัง endpoint รูปภาพหลังมี post id แล้ว
      const uploadImages = async (postId: string) => {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('images', file));
        return uploadPostImagesAction(postId, formData);
      };

      let postId = pendingUploadPostId;

      // ถ้ามีโพสต์ค้างจากการอัปโหลดครั้งก่อน ให้ลอง upload ต่อโดยไม่สร้างโพสต์ใหม่
      if (!postId) {
        const numReward = rewardAmount
          ? parseInt(rewardAmount.replace(/,/g, ''), 10)
          : undefined;
        const res = await createPostAction({
          type: postType,
          petName,
          petType,
          breed,
          gender,
          color,
          distinctiveFeatures,
          locationDescription,
          eventDate: new Date().toISOString(),
          latitude: 13.7563,
          longitude: 100.5018,
          rewardAmount: isNaN(numReward as number) ? undefined : numReward,
          contactPhone,
        });

        if (!res.success) {
          setShowToast(
            res.error ||
              'เกิดข้อผิดพลาดในการเผยแพร่ประกาศ กรุณาเข้าสู่ระบบและลองใหม่อีกครั้ง',
          );
          return;
        }

        postId = res.data.post.id;
        setPendingUploadPostId(postId);
      }

      const uploadRes = await uploadImages(postId);
      if (!uploadRes.success) {
        setShowToast(
          `สร้างประกาศแล้ว แต่อัปโหลดรูปภาพไม่สำเร็จ: ${uploadRes.error ?? 'กรุณาลองใหม่อีกครั้ง'}`,
        );
        return;
      }

      setPendingUploadPostId(null);
      setShowToast(
        'เผยแพร่ประกาศและอัปโหลดรูปภาพสำเร็จ! ระบบกำลังเริ่มค้นหาด้วย AI Smart Matching',
      );
      router.refresh();
      setTimeout(() => {
        router.push(`/posts/${postId}`);
      }, 1500);
    } catch {
      setShowToast('เกิดข้อผิดพลาดในการเผยแพร่ประกาศ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsPublishing(false);
      setTimeout(() => setShowToast(null), 4000);
    }
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
      <div className={cn(currentStep === 0 && 'text-center')}>
        <h1 className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400 sm:text-3xl lg:text-4xl">
          {currentStep === 0
            ? 'เลือกประเภทประกาศที่ตรงกับสถานการณ์ของคุณ'
            : currentStep === 1
              ? postType === 'FOUND'
                ? 'แจ้งพบสัตว์'
                : 'แจ้งสัตว์เลี้ยงหาย'
              : 'ตรวจสอบและยืนยันประกาศ'}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          {currentStep === 0
            ? 'เลือกประเภทประกาศเพื่อเริ่มกรอกข้อมูล'
            : currentStep === 1
              ? postType === 'FOUND'
                ? 'กรอกข้อมูลสัตว์ที่พบ เพื่อช่วยตามหาเจ้าของผ่านระบบและชุมชน'
                : 'กรอกข้อมูลสัตว์เลี้ยงของคุณเพื่อสร้างประกาศตามหาในระบบ แผนที่ และแชร์ไปยังชุมชน'
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

      {/* 2. ตัวระบุความคืบหน้าของฟอร์มหลังเลือกประเภทประกาศแล้ว */}
      {currentStep !== 0 && (
        <div className="flex items-center justify-center rounded-3xl border border-border/80 bg-card p-4 shadow-2xs sm:p-5">
          <div className="flex items-center justify-center gap-3 sm:gap-6 max-w-lg w-full">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
            >
              <div
                className={cn(
                  'flex size-8.5 items-center justify-center rounded-full text-xs font-bold shadow-xs transition-colors',
                  currentStep === 1
                    ? 'bg-emerald-700 text-white ring-4 ring-emerald-600/15'
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
                  ข้อมูลสัตว์เลี้ยง
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  รูปภาพและรายละเอียด
                </span>
              </div>
            </button>

            {/* เส้นเชื่อมต่อระหว่าง Step (ความยาวพอดี ไม่ห่างเกินไป) */}
            <div className="h-0.5 w-12 sm:w-20 bg-border rounded-full shrink-0" />

            {/* Step 2 */}
            <div className="flex items-center gap-2.5 text-left shrink-0">
              <div
                className={cn(
                  'flex size-8.5 items-center justify-center rounded-full text-xs font-bold shadow-xs transition-colors',
                  currentStep === 2
                    ? 'bg-emerald-700 text-white ring-4 ring-emerald-600/15'
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
                  ตรวจสอบ & ยืนยัน
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  ดูตัวอย่างก่อนเผยแพร่
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STEP 0: เลือกประเภทประกาศก่อนเริ่มกรอกข้อมูล */}
      {currentStep === 0 && (
        <section className="mx-auto w-full max-w-2xl animate-in fade-in duration-200">
          <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-8">
            <div
              role="radiogroup"
              aria-label="ประเภทประกาศ"
              className="flex flex-col gap-4"
            >
              {POST_TYPE_OPTIONS.map((option) => {
                const isSelected = postType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setPostType(option.value)}
                    className={cn(
                      'flex min-h-28 w-full items-center gap-4 rounded-3xl border-2 px-5 py-5 text-left transition-all sm:px-7',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/15'
                        : 'border-border bg-background hover:border-primary/50 hover:bg-muted/30',
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                        isSelected
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {option.value === 'LOST' ? (
                        <Search className="size-7" aria-hidden="true" />
                      ) : (
                        <PawPrint className="size-7" aria-hidden="true" />
                      )}
                    </div>

                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold text-foreground sm:text-lg">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground sm:text-sm">
                        {option.description}
                      </span>
                    </span>

                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full border-2',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/40',
                      )}
                      aria-hidden="true"
                    >
                      {isSelected && <Check className="size-4 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              disabled={!postType}
              onClick={() => {
                if (!postType) return;
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mt-7 h-12 w-full rounded-2xl text-base font-bold"
            >
              ถัดไป
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. STEP 1: หน้าฟอร์มกรอกข้อมูลสัตว์เลี้ยง (Form View) */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-8 lg:p-10 dark:border-border/60 animate-in fade-in duration-200">
          <div className="mb-6 flex items-center justify-between gap-3 border-b border-border/60 pb-5">
            <div>
              <span className="text-xs text-muted-foreground">ประเภทประกาศ</span>
              <p className="text-sm font-bold text-foreground sm:text-base">
                {postType === 'FOUND' ? 'ฉันพบสัตว์' : 'สัตว์เลี้ยงของฉันหาย'}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(0)}
              className="text-xs font-bold text-primary sm:text-sm"
            >
              เปลี่ยนประเภท
            </Button>
          </div>
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
                    <Image
                      src={imgUrl}
                      alt={`รูปที่ ${idx + 1}`}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
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
                    {postType === 'FOUND' ? 'พิกัด/สถานที่พบ' : 'พิกัด/สถานที่หาย'}{' '}
                    <span className="text-destructive">*</span>
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
                    วันที่และเวลาที่{postType === 'FOUND' ? 'พบ' : 'หาย'}{' '}
                    <span className="text-destructive">*</span>
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
            <div className="lg:col-span-12 flex items-center justify-between border-t border-dashed border-border/80 pt-6 mt-2">
              <Link
                href="/posts"
                className="inline-flex h-11 items-center justify-center rounded-full sm:rounded-2xl border border-destructive/40 bg-destructive/5 px-6 text-xs font-bold text-destructive transition-all hover:bg-destructive/15 hover:border-destructive/60 active:scale-95 sm:text-sm"
              >
                ยกเลิก
              </Link>

              {/* ปุ่มไปยังขั้นตอนตรวจสอบ */}
              <Button
                type="submit"
                className="h-11 rounded-full sm:rounded-2xl bg-emerald-800 px-7 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 hover:bg-emerald-900 sm:text-sm"
              >
                <span>ตรวจสอบก่อนยืนยัน</span>
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STEP 2: หน้าตรวจสอบและดูตัวอย่างประกาศ (Live Preview View) */}
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
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-destructive px-3 py-1 text-xs font-bold text-white shadow-xs">
                      {postType === 'FOUND' ? 'พบสัตว์ (FOUND)' : 'ตามหา (LOST)'}
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
                    <span>
                      วันที่และเวลาที่{postType === 'FOUND' ? 'พบ' : 'หาย'}: {eventDate}
                    </span>
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

            {/* ปุ่มยืนยันและเผยแพร่ประกาศ */}
            <Button
              type="button"
              onClick={handleFinalPublish}
              disabled={isPublishing}
              className="gap-2 h-11 rounded-full sm:rounded-2xl bg-emerald-800 px-7 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-900 sm:text-sm"
            >
              {isPublishing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              <span>
                {isPublishing
                  ? 'กำลังเผยแพร่...'
                  : pendingUploadPostId
                    ? 'ลองอัปโหลดรูปภาพอีกครั้ง'
                    : 'ยืนยันและเผยแพร่ประกาศ'}
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
