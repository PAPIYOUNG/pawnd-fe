import { apiFetch } from '@/lib/api/api-fetch';
import {
  LoginResponse,
  SessionUser,
  GoogleLoginResponse,
  LineLoginResponse,
} from '@/types/auth';

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

export async function registerRequest(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: { ...payload },
  });
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export async function verifyEmailRequest(
  payload: VerifyEmailPayload,
): Promise<{ message: string }> {
  return apiFetch('/auth/verify-email', {
    method: 'POST',
    body: { ...payload },
  });
}

export interface ResendVerificationPayload {
  email: string;
}

export async function resendVerificationRequest(
  payload: ResendVerificationPayload,
): Promise<{ message: string }> {
  return apiFetch('/auth/resend-verification', {
    method: 'POST',
    body: { ...payload },
  });
}

export interface ForgotPasswordPayload {
  email: string;
}

export async function forgotPasswordRequest(
  payload: ForgotPasswordPayload,
): Promise<{ message: string }> {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: { ...payload },
  });
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export async function resetPasswordRequest(
  payload: ResetPasswordPayload,
): Promise<{ message: string }> {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: { ...payload },
  });
}

export interface LineLoginPayload {
  code: string;
  redirectUri: string;
}

export async function loginWithLineRequest(
  payload: LineLoginPayload,
): Promise<LineLoginResponse> {
  return apiFetch<LineLoginResponse>('/auth/line', {
    method: 'POST',
    body: { ...payload },
  });
}

export interface CompleteLineRegistrationPayload {
  tempToken: string;
  email: string;
}

export async function completeLineRegistrationRequest(
  payload: CompleteLineRegistrationPayload,
): Promise<GoogleLoginResponse> {
  return apiFetch<GoogleLoginResponse>('/auth/line/complete', {
    method: 'POST',
    body: { ...payload },
  });
}

export interface ResendTwoFactorPayload {
  tempToken: string;
}

export async function resendTwoFactorRequest(
  payload: ResendTwoFactorPayload,
): Promise<{ message: string }> {
  return apiFetch('/auth/2fa/resend', {
    method: 'POST',
    body: { ...payload },
  });
}
