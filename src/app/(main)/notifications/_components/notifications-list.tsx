'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import {
  Bell,
  Sparkles,
  MapPin,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  Clock,
  ChevronRight,
  Loader2,
  BellOff,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NotificationItem, NotificationType } from '@/types/notification';
import {
  markAsReadAction,
  markAllAsReadAction,
  deleteNotificationAction,
} from '../_actions/notifications.actions';

interface NotificationsListProps {
  /** รายการแจ้งเตือนเริ่มต้น ดึงมาจาก Backend ผ่าน Server Component ชั้นบน */
  initialNotifications: NotificationItem[];
  /** จำนวนที่ยังไม่อ่านเริ่มต้น ใช้ตัดสินใจว่าจะโชว์ปุ่ม "อ่านทั้งหมดแล้ว" ไหม */
  initialUnreadCount: number;
  /** JWT access token จาก NextAuth session ใช้ยืนยันตัวตนตอนต่อ Socket.IO */
  accessToken: string;
  /** URL ของ Backend สำหรับต่อ Socket.IO (จาก process.env.API_URL ฝั่ง Server) */
  socketUrl: string;
}

/** เลือกไอคอนตามประเภทการแจ้งเตือน */
function getIcon(type: NotificationType) {
  switch (type) {
    case 'AI_MATCH':
      return <Sparkles className="size-5 text-emerald-500" />;
    case 'NEW_MESSAGE':
      return <MessageCircle className="size-5 text-primary" />;
    case 'NEW_CLUE':
      return <MapPin className="size-5 text-amber-500" />;
    case 'PROFILE_VERIFICATION':
      return <ShieldCheck className="size-5 text-primary" />;
    default:
      return <Bell className="size-5 text-muted-foreground" />;
  }
}

/** หาลิงก์ปลายทางที่ควรพาไปเมื่อกดการ์ดแจ้งเตือน โดยดูจาก related id ก่อนเป็นอันดับแรก */
function getLink(item: NotificationItem): string {
  if (item.relatedChatRoomId) return `/chat/${item.relatedChatRoomId}`;
  if (item.relatedPostId) return `/posts/${item.relatedPostId}`;
  if (item.type === 'PROFILE_VERIFICATION') return '/profile';
  return '/dashboard';
}

/** แปลง createdAt (ISO string) เป็นข้อความเวลาแบบสัมพัทธ์ภาษาไทย */
function formatTimeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * NotificationsList Component (Client Component)
 * - แสดงรายการการแจ้งเตือนจริงจาก Backend พร้อม mark-as-read / mark-all-as-read / ลบ ที่ใช้งานได้จริง
 * - รับ initialNotifications/initialUnreadCount จาก Server Component ชั้นบน แล้วเก็บ state ในเครื่อง
 *   เพื่อทำ Optimistic Update ตอนผู้ใช้กดอ่าน/ลบ โดยไม่ต้องรอ revalidate ทั้งหน้า
 * - ต่อ Socket.IO (namespace /notifications, auth ผ่าน query.token ตาม Backend contract)
 *   เพื่อรับการแจ้งเตือนใหม่และจำนวนที่ยังไม่อ่านแบบ real-time โดยไม่ต้อง refresh หน้า
 */
export function NotificationsList({
  initialNotifications,
  initialUnreadCount,
  accessToken,
  socketUrl,
}: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isMarkingAll, startMarkAllTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  // ต่อ Socket.IO เพื่อรับแจ้งเตือนใหม่และจำนวนที่ยังไม่อ่านแบบ real-time
  // Backend gateway อ่าน token จาก handshake.query.token (คนละแบบกับ Chat ที่ใช้ auth.token)
  useEffect(() => {
    if (!accessToken) return;

    const namespaceUrl = `${socketUrl.replace(/\/$/, '')}/notifications`;
    const socket = io(namespaceUrl, { query: { token: accessToken } });

    const handleNewNotification = (notification: NotificationItem) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    const handleCountUpdate = (payload: { unreadCount: number }) => {
      setUnreadCount(payload.unreadCount);
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('notification_count_update', handleCountUpdate);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('notification_count_update', handleCountUpdate);
      socket.disconnect();
    };
  }, [accessToken, socketUrl]);

  // กดการ์ดแจ้งเตือนที่ยังไม่อ่าน -> อัปเดต UI ทันที (optimistic) แล้วค่อยยิง Server Action ตามหลัง
  // ไม่ await เพื่อไม่ให้การนำทางไปหน้าอื่นต้องรอ API ตอบกลับ
  const handleItemClick = (item: NotificationItem) => {
    if (item.isRead) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    void markAsReadAction(item.id);
  };

  // กดปุ่ม "อ่านทั้งหมดแล้ว" -> อัปเดต UI ทันที แล้วยิง Server Action จริง
  // ถ้าล้มเหลวให้ย้อนสถานะกลับและแจ้งเตือนผู้ใช้
  const handleMarkAllRead = () => {
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setFeedback(null);

    startMarkAllTransition(async () => {
      const res = await markAllAsReadAction();
      if (!res.success) {
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
        setFeedback(res.error || 'ไม่สามารถทำเครื่องหมายว่าอ่านทั้งหมดแล้วได้');
      }
    });
  };

  // ลบการแจ้งเตือนออกจากรายการทันที (optimistic) แล้วยิง Server Action ตามหลัง
  // ถ้าล้มเหลวให้เอารายการที่ลบกลับมาแสดง และคืนค่า unreadCount ถ้ารายการนั้นยังไม่เคยอ่าน
  const handleDelete = (id: string) => {
    const previousNotifications = notifications;
    const wasUnread = notifications.find((n) => n.id === id)?.isRead === false;

    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
    setFeedback(null);

    void deleteNotificationAction(id).then((res) => {
      if (!res.success) {
        setNotifications(previousNotifications);
        if (wasUnread) setUnreadCount((prev) => prev + 1);
        setFeedback(res.error || 'ไม่สามารถลบการแจ้งเตือนได้');
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      {/* 1. ส่วนหัวของการแจ้งเตือน */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Bell className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Notifications
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            การแจ้งเตือน
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            ติดตามผลการจับคู่ AI ข่าวสารเบาะแส และข้อความสำคัญ
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="h-9 gap-2 rounded-2xl text-xs font-semibold"
          >
            {isMarkingAll && <Loader2 className="size-3.5 animate-spin" />}
            อ่านทั้งหมดแล้ว
          </Button>
        )}
      </div>

      {/* ข้อความแจ้ง Error กรณี mark-all-as-read / ลบ ล้มเหลว */}
      {feedback && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-destructive/15 p-3.5 text-xs font-semibold text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. รายการการแจ้งเตือน หรือ Empty State ถ้าไม่มีรายการเลย */}
      {notifications.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border/70 py-16 text-center">
          <BellOff className="size-10 text-muted-foreground/60" />
          <p className="text-sm font-semibold text-foreground">
            ยังไม่มีการแจ้งเตือน
          </p>
          <p className="text-xs text-muted-foreground">
            เมื่อมี AI จับคู่ เบาะแสใหม่ หรือข้อความ จะแสดงที่นี่
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {notifications.map((item) => (
            <Link
              key={item.id}
              href={getLink(item)}
              onClick={() => handleItemClick(item)}
              className={cn(
                'group flex items-start gap-4 rounded-2xl border p-4 transition-all hover:shadow-md sm:p-5',
                item.isRead
                  ? 'border-border/70 bg-card/60'
                  : 'border-primary/40 bg-primary/5 dark:bg-primary/10',
              )}
            >
              {/* ไอคอนประเภทการแจ้งเตือน */}
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card shadow-2xs">
                {getIcon(item.type)}
              </div>

              {/* ข้อความการแจ้งเตือน */}
              <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary">
                    {item.title}
                  </h4>
                  {!item.isRead && (
                    <span className="size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {item.message}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="size-3" />
                  <span>{formatTimeAgo(item.createdAt)}</span>
                </div>
              </div>

              {/* ปุ่มลบ + ลูกศรนำทาง ทางขวาสุด */}
              <div className="flex shrink-0 items-center gap-1 self-center">
                <button
                  type="button"
                  aria-label="ลบการแจ้งเตือนนี้"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="flex size-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
