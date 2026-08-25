import { apiFetch } from '@/lib/api/api-fetch';
import { LoginResponse, SessionUser, GoogleLoginResponse } from '@/types/auth';

export interface LoginPayload {
  email: string;
  password: string;
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

export interface GoogleLoginPayload {
  idToken: string;
}

export async function loginWithGoogleRequest(
  payload: GoogleLoginPayload,
): Promise<GoogleLoginResponse> {
  return apiFetch<GoogleLoginResponse>('/auth/google', {
    method: 'POST',
    body: { ...payload },
  });
}
