const API_URL = process.env.API_URL || 'http://localhost:8000';

interface PetQrPdfContext {
  params: Promise<{ qrToken: string }>;
}

/**
 * ส่งต่อคำขอไฟล์ PDF ป้ายปลอกคอจาก browser ไปยัง PAWND Backend
 * (GET /pets/public/qr/:qrToken/pdf เป็น public endpoint ไม่ต้องใช้ access token)
 * ต้องพร็อกซีผ่าน route นี้เพราะ API_URL เป็น server-only env var เข้าถึงจาก client component ไม่ได้
 */
export async function GET(request: Request, context: PetQrPdfContext) {
  const { qrToken } = await context.params;

  const response = await fetch(`${API_URL}/pets/public/qr/${qrToken}/pdf`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return Response.json(
      { success: false, message: 'ไม่สามารถสร้างไฟล์ PDF ป้ายปลอกคอได้' },
      { status: response.status },
    );
  }

  const buffer = await response.arrayBuffer();
  return new Response(buffer, {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
    },
  });
}
