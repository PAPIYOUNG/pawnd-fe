import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // รองรับการส่งรูปสูงสุด 3 ไฟล์ตาม Backend (ไฟล์ละไม่เกิน 5MB) ผ่าน Server Action
  experimental: {
    serverActions: {
      bodySizeLimit: '16mb',
    },
  },
  // อนุญาตให้เข้าถึง dev server จากเครื่องอื่นใน LAN (เช่น ทดสอบผ่านมือถือ)
  allowedDevOrigins: ['192.168.1.67'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
