import NextAuth, { type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { SessionUser } from '@/types/auth';
import { apiFetch } from '@/lib/api/api-fetch';

interface AuthorizedUser {
  id: string;
  accessToken: string;
  refreshToken: string;
  pawndUser: SessionUser;
}

/**
 * ถอด exp claim จาก JWT accessToken (ไม่ verify signature เพราะแค่ต้องการรู้เวลาหมดอายุ)
 * คืนค่าเป็น timestamp มิลลิวินาที หรือ null ถ้า decode ไม่ได้
 */
function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8'),
    ) as { exp?: number };
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * ขอ accessToken ใหม่จาก Backend ด้วย refreshToken เดิม (POST /auth/refresh)
 */
async function refreshAccessToken(refreshToken: string) {
  return apiFetch<{ accessToken: string; refreshToken: string }>(
    '/auth/refresh',
    {
      method: 'POST',
      body: { refreshToken },
    },
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30 วัน
  },
  providers: [
    Credentials({
      credentials: {
        accessToken: {},
        refreshToken: {},
        user: {},
      },
      authorize: async (credentials) => {
        if (
          typeof credentials?.accessToken !== 'string' ||
          typeof credentials?.refreshToken !== 'string' ||
          typeof credentials?.user !== 'string'
        ) {
          return null;
        }

        const pawndUser = JSON.parse(credentials.user) as SessionUser;

        const authorizedUser: AuthorizedUser = {
          id: pawndUser.id,
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
          pawndUser,
        };

        return authorizedUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token: rawToken, user, trigger, session }) {
      // Auth.js core ประกาศ JWT ให้ extends Record<string, unknown> การ augment
      // interface ผ่าน next-auth/jwt ไม่ทำให้ field ที่เราเพิ่มเข้ามาถูก narrow เป็น
      // ชนิดที่ถูกต้องตอนอ่านค่า จึง cast ผ่าน type เฉพาะของเราเองอีกชั้นเพื่อความชัวร์
      const token = rawToken as typeof rawToken & {
        accessToken?: string;
        refreshToken?: string;
        pawndUser?: SessionUser;
        accessTokenExpires?: number;
        error?: string;
      };

      // next-auth v5 ยังเป็น beta, type ของ user ในนี้ผูกกับ AdapterUser
      // แบบไม่สมบูรณ์ (เราไม่ได้ใช้ adapter เลย) จึง cast ผ่าน unknown
      // เฉพาะจุดอ่านนี้จุดเดียว แทนการ augment interface User ทั้งระบบ
      const authorizedUser = user as unknown as AuthorizedUser | undefined;

      // Login ครั้งแรก: เก็บ token คู่ใหม่ + คำนวณเวลาหมดอายุจาก JWT exp claim
      if (authorizedUser) {
        token.accessToken = authorizedUser.accessToken;
        token.refreshToken = authorizedUser.refreshToken;
        token.pawndUser = authorizedUser.pawndUser;
        token.accessTokenExpires =
          decodeJwtExpiry(authorizedUser.accessToken) ?? undefined;
        delete token.error;
        return token;
      }

      // Client เรียก useSession().update({ user: { avatarUrl } }) หลังเปลี่ยนรูปโปรไฟล์สำเร็จ
      // อัปเดตเฉพาะ avatarUrl ใน token.pawndUser เพื่อให้ session ใหม่สะท้อนรูปที่เปลี่ยนทันที
      if (trigger === 'update' && session?.user?.avatarUrl && token.pawndUser) {
        token.pawndUser = {
          ...token.pawndUser,
          avatarUrl: session.user.avatarUrl,
        };
      }

      // accessToken ยังไม่หมดอายุ (เผื่อ buffer 30 วิ) ใช้ต่อได้เลย
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 30_000
      ) {
        return token;
      }

      // ไม่มี refreshToken ให้ใช้ (ไม่ควรเกิดขึ้นถ้า login ผ่าน flow ปกติ)
      if (!token.refreshToken) {
        return token;
      }

      // accessToken หมดอายุแล้ว -> ขอคู่ใหม่ด้วย refreshToken
      try {
        const refreshed = await refreshAccessToken(token.refreshToken);
        token.accessToken = refreshed.accessToken;
        token.refreshToken = refreshed.refreshToken;
        token.accessTokenExpires =
          decodeJwtExpiry(refreshed.accessToken) ?? undefined;
        delete token.error;
      } catch {
        // refreshToken หมดอายุ/ถูกเพิกถอนแล้ว ต้องให้ผู้ใช้ login ใหม่
        token.error = 'RefreshAccessTokenError';
      }

      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        user: token.pawndUser,
        error: token.error,
      } as unknown as Session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
