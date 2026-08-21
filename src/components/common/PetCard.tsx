import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LatestPostItem } from '@/types/post';

interface PetCardProps {
  post: LatestPostItem;
}

export function PetCard({ post }: PetCardProps) {
  const isLost = post.type === 'LOST';

  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        {/* Pet Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={post.coverImageUrl}
            alt={post.petName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Status Badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant={isLost ? 'lost' : 'found'}
              className="px-2.5 py-0.5 text-[11px] font-medium shadow-xs"
            >
              {isLost ? 'สัตว์หาย' : 'พบสัตว์พลัดหลง'}
            </Badge>
          </div>
        </div>

        {/* Card Details */}
        <div className="flex flex-col gap-2 p-4">
          <div>
            <h3 className="line-clamp-1 text-base font-bold text-foreground transition-colors group-hover:text-primary">
              {post.petName}
            </h3>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {post.ageDescription || post.breed || 'ข้อมูลสัตว์เลี้ยง'}
            </p>
          </div>

          <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground border-t border-border/40">
            <div className="flex items-center gap-1.5 line-clamp-1">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{post.locationDetail || post.province}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0 text-muted-foreground/80" />
              <span>{post.timeAgo}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
