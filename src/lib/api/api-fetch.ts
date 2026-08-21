import { ApiError } from '@/lib/api/api-error';

export type ApiFetchOption = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown> | FormData;
  token?: string;
};

const API_URL = process.env.API_URL ?? 'http://localhost:8000';
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOption = {},
): Promise<T> {
  const { body, headers, token, ...init } = options;

  const newHeaders = new Headers(headers);
  if (token) {
    newHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (body !== undefined && !(body instanceof FormData)) {
    newHeaders.set('content-type', 'application/json');
  }

  let newBody: BodyInit | undefined;
  if (!(body instanceof FormData)) {
    newBody = body !== undefined ? JSON.stringify(body) : undefined;
  } else {
    newBody = body;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    body: newBody,
    headers: newHeaders,
  });

  //จะสร้าง class ApiError (api-error.ts) เอง เพื่อเวลาเกิดไรขึ้น เราจะให้ server action ดักจับ
  if (!response.ok) {
    const errorText = await response.text();
    let message = response.statusText;
    if (errorText) {
      try {
        message = JSON.parse(errorText).message ?? message;
      } catch {
        message = errorText;
      }
    }
    throw new ApiError(response.status, message);
  }
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
