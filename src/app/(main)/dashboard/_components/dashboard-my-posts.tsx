'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { deleteMyPostAction } from '../_actions/dashboard.actions';

export interface MyPostDashboardItem {
  id: string;
  type: 'LOST' | 'FOUND';
  /** สถานะประกาศ ใช้ตัดสินการคาดลายน้ำ: REUNITED = กลับบ้านแล้ว (โทนเขียว), CLOSED = ปิดประกาศ (โทนขาวดำ) */
  status?: 'ACTIVE' | 'REUNITED' | 'CLOSED' | 'HIDDEN' | 'DELETED';
  petName: string;
  petType: string;
  breed: string;
  age: string;
  location: string;
  lastUpdated: string;
  rewardAmount?: string | null;
  imageUrl: string;
}

/**
 * DashboardMyPosts Component (Client Component)
 * - การ์ดรายการประกาศตามหาของฉันในหน้า Dashboard ตรงตามดีไซน์ UI
 * - แสดงสถานะ LOST / FOUND
 * - รายละเอียด: ชื่อ, ชนิด, สายพันธุ์, อายุ, พิกัดสถานที่ และเวลาอัปเดต
 * - แถบล่าง: ป้ายรางวัล และปุ่ม Action (ดูใบปลิว/Flyer, แก้ไข, ลบผ่าน Backend จริง)
 */
export function DashboardMyPosts({
  initialPosts = [],
}: {
  initialPosts?: MyPostDashboardItem[];
}) {
  const [posts, setPosts] = useState<MyPostDashboardItem[]>(initialPosts);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeletePost = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบประกาศของ "${name}" ใช่หรือไม่?`)) {
      setDeletingId(id);
      setFeedback(null);
      try {
        const res = await deleteMyPostAction(id);
        if (res.success) {
          setPosts((prev) => prev.filter((p) => p.id !== id));
          triggerFeedback('success', `ลบประกาศของ "${name}" เรียบร้อยแล้ว`);
        } else {
          triggerFeedback('error', res.error || 'ไม่สามารถลบประกาศได้');
        }
      } catch {
        triggerFeedback('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ส่วนหัวคอลัมน์ */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground sm:text-lg">
          ประกาศตามหาของฉัน
        </h2>
        <Link
          href="/posts"
          className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ดูทั้งหมด
        </Link>
      </div>

      {/* แจ้งเตือนสถานะผลลัพธ์การลบประกาศ */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-3.5 text-xs font-semibold animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
              : 'bg-destructive/15 text-destructive'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* กริดการ์ดประกาศ หรือ Empty State */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-12 text-center">
          <p className="text-sm font-semibold text-foreground">
            คุณยังไม่มีประกาศตามหาในขณะนี้
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            สร้างประกาศเพื่อเริ่มตามหาหรือแจ้งเบาะแสสัตว์เลี้ยง
          </p>
          <Link href="/posts/create" className="mt-4">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-2xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
            >
              + สร้างประกาศใหม่
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {posts.map((post) => {
            const isLost = post.type === 'LOST';
            const isReunited = post.status === 'REUNITED';
            const isClosed = post.status === 'CLOSED';

            return (
              <div
                key={post.id}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xs transition-all hover:shadow-md ${
                  isClosed ? 'grayscale' : ''
                }`}
              >
                {/* คาดทับสีทั้งการ์ด: กลับบ้านแล้ว = โทนเขียว, ปิดประกาศ = โทนขาวดำ (ใช้ grayscale ที่ตัวการ์ด) */}
                {isReunited && (
                  <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-emerald-500/15" />
                )}

                {/* ริบบิ้นลายน้ำคาดทแยงมุมทั้งการ์ด */}
                {(isReunited || isClosed) && (
                  <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
                    <div
                      className={`w-[150%] rotate-[-35deg] py-1.5 text-center text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg ${
                        isReunited ? 'bg-emerald-600/90' : 'bg-neutral-700/90'
                      }`}
                    >
                      {isReunited ? 'กลับบ้านแล้ว' : 'CLOSE'}
                    </div>
                  </div>
                )}

                {/* รูปภาพสัตว์เลี้ยงพร้อมป้ายสถานะ LOST/FOUND */}
                <div className="relative h-44 w-full bg-muted">
                  <Image
                    src={post.imageUrl}
                    alt={post.petName}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* ป้ายประเภทประกาศ (LOST สีส้ม/เหลือง, FOUND สีน้ำเงิน) */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-black text-white shadow-xs ${
                        isLost ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                    >
                      {isLost ? 'LOST' : 'FOUND'}
                    </span>
                  </div>
                </div>

                {/* ข้อมูลเนื้อหา */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-lg font-bold text-foreground">
                    {post.petName}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {post.petType} • {post.breed} • {post.age}
                  </p>

                  {/* พิกัดสถานที่และเวลา */}
                  <div className="mt-3 flex flex-col gap-1 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">{post.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="size-2 rounded-full bg-muted-foreground/50 shrink-0" />
                      <span className="truncate">{post.lastUpdated}</span>
                    </span>
                  </div>

                  {/* แถบล่างสุด: เงินรางวัล & ปุ่ม Action ไอคอน */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    {/* เงินรางวัล */}
                    <div>
                      {post.rewardAmount ? (
                        <span className="inline-flex items-center rounded-lg bg-emerald-100/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          รางวัล ฿{post.rewardAmount}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          ไม่มีรางวัลนำจับ
                        </span>
                      )}
                    </div>

                    {/* ปุ่ม Action 3 ปุ่ม: ดู/ใบปลิว (Eye), แก้ไข (Edit), ลบ (Trash) */}
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/posts/${post.id}/flyer`}
                        className="flex size-7.5 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                        title="ดูใบปลิวตามหา"
                      >
                        <Eye className="size-3.5" />
                      </Link>

                      <Link
                        href={`/posts/${post.id}/progress`}
                        className="flex size-7.5 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-colors hover:bg-amber-500/20 hover:text-amber-600"
                        title="แก้ไขประกาศ / อัปเดตไทม์ไลน์"
                      >
                        <Edit2 className="size-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id, post.petName)}
                        disabled={deletingId === post.id}
                        className="flex size-7.5 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive disabled:opacity-50"
                        title="ลบประกาศ"
                      >
                        {deletingId === post.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
