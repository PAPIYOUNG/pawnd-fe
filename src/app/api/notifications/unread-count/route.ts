import { auth } from '@/auth';

const API_URL = process.env.API_URL || 'http://localhost:8000';

/**
 * BFF proxy สำหรับ Header (Client Component) เรียกขอจำนวนแจ้งเตือนที่ยังไม่อ่าน
 * แยกออกจาก MainLayout เพื่อไม่ให้ทั้งเว็บถูกบังคับเป็น Dynamic Rendering
 * (การอ่าน session ใน Server Layout ระดับบนสุดจะทำให้ทุกหน้าใน (main) เสีย static caching)
 * ไม่มี session หรือ token หมดอายุ ให้ตอบ unreadCount: 0 เงียบๆ ไม่ต้อง error
 */
export async function GET() {
  const session = await auth();

  if (!session?.accessToken || session.error === 'RefreshAccessTokenError') {
    return Response.json({ unreadCount: 0 });
  }

  const response = await fetch(`${API_URL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    return Response.json({ unreadCount: 0 });
  }

  const envelope = (await response.json()) as {
    data?: { unreadCount?: number };
  };

  return Response.json({ unreadCount: envelope.data?.unreadCount ?? 0 });
}
