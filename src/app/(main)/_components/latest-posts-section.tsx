import { PetCard } from '@/components/common/PetCard';
import { LatestPostItem } from '@/types/post';

interface LatestPostsSectionProps {
  posts: LatestPostItem[];
}

export function LatestPostsSection({ posts }: LatestPostsSectionProps) {
  return (
    <section className="w-full py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            ประกาศตามหาและพบสัตว์ล่าสุด
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            ร่วมสอดส่องดูแลและส่งต่อกำลังใจให้แก่เพื่อนร่วมโลก เพื่อเพิ่มโอกาสพาน้องกลับบ้านได้เร็วขึ้น
          </p>
        </div>

        {/* Posts Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <PetCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
