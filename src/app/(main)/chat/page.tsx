import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { ChatClient } from './_components/chat-client';

export const metadata: Metadata = {
  title: 'กล่องข้อความสนทนา',
  description: 'แชทติดต่อเจ้าของประกาศสัตว์เลี้ยงแบบเรียลไทม์',
};

interface ChatPageProps {
  searchParams: Promise<{ room?: string | string[] }>;
}

/** Server Component ตรวจ session ก่อนส่งเฉพาะข้อมูลที่ Chat Client ต้องใช้ */
export default async function ChatPage({ searchParams }: ChatPageProps) {
  const session = await auth();
  if (
    !session?.user ||
    !session.accessToken ||
    session.error === 'RefreshAccessTokenError'
  ) {
    redirect('/login');
  }

  const query = await searchParams;
  const initialRoomId = Array.isArray(query.room) ? query.room[0] : query.room;
  const socketUrl = process.env.API_URL || 'http://localhost:8000';

  return (
    <ChatClient
      currentUser={session.user}
      accessToken={session.accessToken}
      socketUrl={socketUrl}
      initialRoomId={initialRoomId}
    />
  );
}
