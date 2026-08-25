'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleIcon, LineIcon } from '@/components/auth/BrandIcons';
import { PasswordInput } from '@/components/auth/PasswordInput';

export function RegisterForm() {
  return (
    <form className="flex w-full flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">สมัครสมาชิก</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ร่วมสร้างคอมมูนิตี้สี่ขาแสนอบอุ่นกับเรา 💚
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">ชื่อ</Label>
          <Input id="firstName" placeholder="กรอกชื่อจริง" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">นามสกุล</Label>
          <Input id="lastName" placeholder="กรอกนามสกุล" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" type="email" placeholder="example@email.com" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <PasswordInput id="password" placeholder="อย่างน้อย 8 ตัวอักษร" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="กรอกรหัสผ่านอีกครั้ง"
        />
      </div>

      <Label htmlFor="terms" className="items-start gap-2 font-normal">
        <Checkbox id="terms" className="mt-0.5" />
        <span className="text-sm text-muted-foreground">
          ฉันยอมรับ ข้อกำหนดในการให้บริการ และนโยบายความเป็นส่วนตัว
        </span>
      </Label>

      <Button type="submit" size="lg" className="w-full">
        สร้างบัญชี
      </Button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">หรือ</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="outline" size="lg" className="w-full">
        <GoogleIcon className="size-4" />
        สมัครใช้งานด้วย Google
      </Button>

      <Button
        type="button"
        size="lg"
        className="w-full bg-[#06C755] text-white hover:bg-[#05b34c]"
      >
        <LineIcon className="size-4" />
        สมัครใช้งานด้วย LINE
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว?{' '}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
