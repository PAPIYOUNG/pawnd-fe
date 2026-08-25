import { CommunityFeed } from '@/components/community/Commu-Feed';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ชุมชน',
  description: 'พูดคุย แลกเปลี่ยนความรู้ และเรื่องราวของคนรักสัตว์',
};

export default function CommunityPage() {
  return <CommunityFeed />;
}
