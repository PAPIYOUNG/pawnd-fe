import { Metadata } from 'next';
import Image from 'next/image';
import { MessageCircle, Send, Image as ImageIcon, MapPin, CheckCheck } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'กล่องข้อความสนทนา (Live Chat) | PAWND',
  description: 'แชทสนทนาระหว่างเจ้าของสัตว์เลี้ยงและผู้พบเห็นเบาะแสแบบเรียลไทม์',
};

/**
 * ChatPage (Server Component - RSC)
 * - หน้าระบบแชทสนทนาและการติดต่อเจ้าของ (Live Messaging & Chat)
 */
export default function ChatPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex h-[75vh] overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg">
        {/* รายชื่อห้องแชท (Inbox List) */}
        <div className="w-full sm:w-80 border-r border-border/60 bg-muted/20 p-4 flex flex-col gap-3">
          <h2 className="font-bold text-base text-foreground flex items-center gap-2">
            <MessageCircle className="size-5 text-primary" />
            <span>กล่องข้อความ</span>
          </h2>

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-3 rounded-2xl bg-primary/10 p-3 text-left border border-primary/30">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-full border">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                  alt="คุณอารยา"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">คุณอารยา</span>
                  <span className="text-[10px] text-muted-foreground">15:42</span>
                </div>
                <span className="text-xs text-primary truncate font-medium">
                  สวัสดีค่ะ เจอน้องแมวตรงพญาไท...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* หน้าต่างสนทนา (Chat Thread) */}
        <div className="hidden sm:flex flex-1 flex-col justify-between bg-card p-4">
          {/* ส่วนหัวห้องแชท */}
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="relative size-10 overflow-hidden rounded-full border">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                alt="คุณอารยา"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">คุณอารยา (ผู้พบเห็นเบาะแส)</h3>
              <span className="text-[11px] text-emerald-600 font-semibold">● กำลังออนไลน์</span>
            </div>
          </div>

          {/* กล่องข้อความแชท */}
          <div className="flex flex-1 flex-col justify-end gap-3 p-4 overflow-y-auto">
            <div className="flex justify-start">
              <div className="max-w-md rounded-2xl bg-muted/60 p-3.5 text-xs sm:text-sm text-foreground">
                สวัสดีค่ะ พอดีเดินผ่านซอยพญาไท 1 แล้วเจอน้องแมววิเชียรมาศคล้ายกับในประกาศเลยค่ะ หลบอยู่ข้างร้านกาแฟ
              </div>
            </div>

            <div className="flex justify-end">
              <div className="max-w-md rounded-2xl bg-primary p-3.5 text-xs sm:text-sm text-primary-foreground shadow-xs">
                ขอบคุณมากๆ เลยครับ! ตอนนี้น้องยังอยู่ตรงนั้นไหมครับ เดี๋ยวผมรีบออกไปดูทันทีเลยครับ
              </div>
            </div>
          </div>

          {/* ช่องพิมพ์ข้อความ */}
          <div className="flex items-center gap-2 border-t border-border/60 pt-3">
            <Input
              placeholder="พิมพ์ข้อความตอบกลับ..."
              className="rounded-2xl text-xs sm:text-sm h-11"
            />
            <Button className="h-11 rounded-2xl bg-primary px-5 text-primary-foreground">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
