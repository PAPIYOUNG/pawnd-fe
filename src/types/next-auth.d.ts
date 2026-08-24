import { SessionUser } from '@/types/auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    refreshToken: string;
    user: SessionUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    pawndUser?: SessionUser;
  }
}
