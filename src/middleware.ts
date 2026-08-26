import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware สำหรับการป้องกัน Route (Route Protection)
 * ตรวจสอบสถานะการเข้าสู่ระบบผ่าน NextAuth session (JWT)
 * - หากยังไม่เข้าสู่ระบบแล้วพยายามเข้าถึง Protected Routes -> Redirect ไปหน้า /login
 * - หากเข้าสู่ระบบแล้วแล้วพยายามเข้าถึง /login -> Redirect ไปหน้า /dashboard
 */
export default auth((req) => {
  // session ที่ refresh token หมดอายุยังมี object อยู่ แต่ใช้ต่อไม่ได้แล้ว
  // ต้องถือว่า logged out เพื่อไม่ให้ /login กับ protected route redirect วนกัน
  const isLoggedIn =
    !!req.auth?.user &&
    !!req.auth.accessToken &&
    req.auth.error !== 'RefreshAccessTokenError';
  const { pathname } = req.nextUrl;

  // กำหนดรายการเส้นทางที่ต้องผ่านการเข้าสู่ระบบก่อน (Protected Routes)
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/posts/create') ||
    pathname.startsWith('/chat');

  // ถ้าเป็น Protected Route และยังไม่ได้ Login ให้ redirect ไปหน้า Login พร้อม callbackUrl
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ถ้า Login แล้วและพยายามเข้าหน้า Login ให้พาไปที่หน้า Dashboard
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
  }

  return NextResponse.next();
});

/**
 * Matcher configuration เพื่อระบุ routes ที่ middleware ควรทำงาน
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/posts/create',
    '/chat/:path*',
    '/login',
  ],
};
