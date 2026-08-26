import { auth } from '@/auth';

const API_URL = process.env.API_URL || 'http://localhost:8000';

interface ChatProxyContext {
  params: Promise<{ path: string[] }>;
}

/**
 * ส่งต่อคำขอ Chat จาก browser ไป PAWND Backend โดยเติม access token จาก
 * NextAuth session ฝั่ง server ทำให้ UI ไม่ต้องจัดการ Authorization header เอง
 */
async function proxyChatRequest(
  request: Request,
  context: ChatProxyContext,
): Promise<Response> {
  const session = await auth();

  if (!session?.accessToken) {
    return Response.json(
      { success: false, message: 'กรุณาเข้าสู่ระบบก่อนใช้งานแชท' },
      { status: 401 },
    );
  }

  const { path } = await context.params;
  const sourceUrl = new URL(request.url);
  const backendUrl = new URL(`/chat/${path.join('/')}`, API_URL);
  backendUrl.search = sourceUrl.search;

  const headers = new Headers();
  headers.set('Authorization', `Bearer ${session.accessToken}`);
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    // ใช้ binary body เพื่อรักษา multipart boundary และ bytes ของรูปภาพให้ครบถ้วน
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: 'no-store',
  });

  if (response.status === 204) {
    return new Response(null, { status: 204 });
  }

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      'content-type':
        response.headers.get('content-type') ?? 'application/json',
    },
  });
}

export const GET = proxyChatRequest;
export const POST = proxyChatRequest;
export const PATCH = proxyChatRequest;
export const DELETE = proxyChatRequest;
