import { SessionUser } from '@/types/auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    refreshToken: string;
    user: SessionUser;
    /** ตั้งเป็น 'RefreshAccessTokenError' เมื่อ refresh accessToken ไม่สำเร็จ (refreshToken หมดอายุ/ถูกเพิกถอน) */
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    pawndUser?: SessionUser;
    /** เวลาหมดอายุของ accessToken (timestamp มิลลิวินาที) ถอดจาก JWT exp claim */
    accessTokenExpires?: number;
    error?: string;
  }
}
