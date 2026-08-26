const API_URL = process.env.API_URL || 'http://localhost:8000';

interface FlyerPdfContext {
  params: Promise<{ id: string }>;
}

/**
 * Next.js API Route (Proxy): ส่งต่อไฟล์ PDF ใบปลิวจาก Backend
 * - เรียก GET /posts/:id/flyer/download ของ Backend ซึ่งเป็น Public Endpoint
 * - ตอบกลับด้วย content-type: application/pdf เพื่อให้ Browser สามารถเปิด Preview และสั่งพิมพ์ได้โดยตรง
 * - ป้องกันปัญหา Browser ภายนอกเข้าถึง URL หลังบ้านไม่ได้โดยตรง
 */
export async function GET(request: Request, context: FlyerPdfContext) {
  const { id } = await context.params;

  try {
    const response = await fetch(`${API_URL}/posts/${id}/flyer/download`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return Response.json(
        { success: false, message: 'ไม่สามารถโหลดไฟล์ PDF ใบปลิวได้' },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `inline; filename="flyer-${id}.pdf"`,
      },
    });
  } catch {
    return Response.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}
