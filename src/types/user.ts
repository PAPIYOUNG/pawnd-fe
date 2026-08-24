import { PetProfile } from './pet';
import { LatestPostItem } from './post';

export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'PENDING_EMAIL_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'BLACKLISTED' | 'DELETED';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

/**
 * ข้อมูลโปรไฟล์ผู้ใช้งาน
 * ตรงตาม User model ของ pawnd-be-template
 */
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  lineId?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  verificationStatus?: VerificationStatus;
  notificationEnabled: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
  stats?: {
    totalPets: number;
    totalLostPosts: number;
    totalReunited: number;
  };
  pets?: PetProfile[];
  postsHistory?: LatestPostItem[];
}
