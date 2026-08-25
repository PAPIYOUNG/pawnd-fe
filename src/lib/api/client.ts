interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
  path: string;
}

interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
}

interface ApiRequestOptions extends RequestInit {
  accessToken?: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_PAWND_API_URL?.replace(/\/$/, '');

export async function apiRequest<T>(
  path: string,
  { accessToken, ...init }: ApiRequestOptions = {},
): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_PAWND_API_URL is not configured');
  }

  const headers = new Headers(init.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  const payload = (await response.json()) as ApiSuccess<T> | ApiErrorBody;

  if (!response.ok || !payload.success) {
    const message =
      'message' in payload
        ? Array.isArray(payload.message)
          ? payload.message.join(', ')
          : payload.message
        : 'Request failed';

    throw new Error(message);
  }

  return payload.data;
}
