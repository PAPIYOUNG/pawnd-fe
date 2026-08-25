import NextAuth, { type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { SessionUser } from '@/types/auth';

interface AuthorizedUser {
  id: string;
  accessToken: string;
  refreshToken: string;
  pawndUser: SessionUser;
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
    jwt({ token, user }) {
      // next-auth v5 ยังเป็น beta, type ของ user ในนี้ผูกกับ AdapterUser
      // แบบไม่สมบูรณ์ (เราไม่ได้ใช้ adapter เลย) จึง cast ผ่าน unknown
      // เฉพาะจุดอ่านนี้จุดเดียว แทนการ augment interface User ทั้งระบบ
      const authorizedUser = user as unknown as AuthorizedUser | undefined;

      if (authorizedUser) {
        token.accessToken = authorizedUser.accessToken;
        token.refreshToken = authorizedUser.refreshToken;
        token.pawndUser = authorizedUser.pawndUser;
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        user: token.pawndUser,
      } as unknown as Session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
