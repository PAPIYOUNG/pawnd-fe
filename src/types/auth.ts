export type UserRole = 'USER' | 'ADMIN';

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
}

export interface LoginTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

export interface LoginOtpRequiredResponse {
  tempToken: string;
  type: 'OTP_REQUIRED';
  message: string;
}

export interface LineEmailRequiredResponse {
  tempToken: string;
  type: 'LINE_EMAIL_REQUIRED';
  message: string;
}

export interface PendingEmailVerificationResponse {
  email: string;
  message: string;
}

type AnyLoginResult =
  | LoginTokensResponse
  | LoginOtpRequiredResponse
  | LineEmailRequiredResponse
  | PendingEmailVerificationResponse;

export type LoginResponse = LoginTokensResponse | LoginOtpRequiredResponse;

export type GoogleLoginResponse =
  | LoginTokensResponse
  | LoginOtpRequiredResponse
  | PendingEmailVerificationResponse;

export type LineLoginResponse = AnyLoginResult;

export function isOtpRequired(
  response: AnyLoginResult,
): response is LoginOtpRequiredResponse {
  return 'type' in response && response.type === 'OTP_REQUIRED';
}

export function isLineEmailRequired(
  response: AnyLoginResult,
): response is LineEmailRequiredResponse {
  return 'type' in response && response.type === 'LINE_EMAIL_REQUIRED';
}

export function isPendingEmailVerification(
  response: AnyLoginResult,
): response is PendingEmailVerificationResponse {
  return !('tempToken' in response);
}
