import { LatestPostItem } from './post';

export interface SummaryStats {
  totalLost: number;
  totalFound: number;
  totalReunited: number;
  totalUsers: number;
}

export interface ReunitedStory {
  id: string;
  petName: string;
  ownerName: string;
  quote: string;
  province?: string;
  coverImageUrl: string;
  reunitedAt?: string;
  detailUrl?: string;
}

export interface EmergencyGuide {
  id: string;
  title: string;
  summary: string;
  category: string;
}

export interface HomePageData {
  stats: SummaryStats;
  latestPosts: LatestPostItem[];
  reunitedStories: ReunitedStory[];
  guides?: EmergencyGuide[];
}
