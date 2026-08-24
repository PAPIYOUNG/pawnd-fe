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
  message: string;
}

export type LoginResponse = LoginTokensResponse | LoginOtpRequiredResponse;

export function isOtpRequired(
  response: LoginResponse,
): response is LoginOtpRequiredResponse {
  return 'tempToken' in response;
}
