import { apiFetch } from '@/lib/api/api-fetch';
import { LoginResponse, SessionUser } from '@/types/auth';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  };
  message: string;
}

/** สมัครบัญชีใหม่และให้ Backend ส่ง verification OTP */
export function registerRequest(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: { ...payload },
  });
}

/** ยืนยันอีเมลด้วย OTP ที่ Backend สร้าง */
export function verifyEmailRequest(email: string, otp: string): Promise<void> {
  return apiFetch<void>('/auth/verify-email', {
    method: 'POST',
    body: { email, otp },
  });
}

/** ขอ verification OTP ชุดใหม่สำหรับบัญชีที่ยัง pending */
export function resendVerificationRequest(email: string): Promise<void> {
  return apiFetch<void>('/auth/resend-verification', {
    method: 'POST',
    body: { email },
  });
}

export async function loginRequest(
  payload: LoginPayload,
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { ...payload },
  });
}

export interface VerifyTwoFactorPayload {
  tempToken: string;
  otp: string;
}

export interface OtpVerifiedTokens {
  accessToken: string;
  refreshToken: string;
}

export async function verifyTwoFactorRequest(
  payload: VerifyTwoFactorPayload,
): Promise<OtpVerifiedTokens> {
  return apiFetch<OtpVerifiedTokens>('/auth/2fa/verify', {
    method: 'POST',
    body: { ...payload },
  });
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await apiFetch('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  });
}

interface GetMeResponse {
  user: SessionUser;
}

export async function getMeRequest(
  accessToken: string,
): Promise<GetMeResponse> {
  return apiFetch<GetMeResponse>('/auth/me', {
    method: 'GET',
    token: accessToken,
  });
}
