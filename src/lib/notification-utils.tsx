import {
  Bell,
  Sparkles,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

import type { NotificationItem, NotificationType } from '@/types/notification';

/**
 * เลือกไอคอนตามประเภทการแจ้งเตือน ใช้ร่วมกันทั้งหน้า /notifications เต็มและ
 * dropdown preview บนกระดิ่งที่ Header เพื่อไม่ให้ต้องเขียน switch-case ซ้ำสองที่
 */
export function getNotificationIcon(type: NotificationType) {
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
export function getNotificationLink(item: NotificationItem): string {
  if (item.relatedChatRoomId) return `/chat?room=${item.relatedChatRoomId}`;
  if (item.relatedPostId) return `/posts/${item.relatedPostId}`;
  if (item.type === 'PROFILE_VERIFICATION') return '/profile';
  return '/dashboard';
}

/** แปลง createdAt (ISO string) เป็นข้อความเวลาแบบสัมพัทธ์ภาษาไทย */
export function formatNotificationTimeAgo(dateStr: string): string {
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
