import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // อนุญาตให้เข้าถึง dev server จากเครื่องอื่นใน LAN (เช่น ทดสอบผ่านมือถือ)
  allowedDevOrigins: ['192.168.1.67'],
  experimental: {
    serverActions: {
      // รองรับการส่งรูปสูงสุด 3 ไฟล์ตาม Backend (ไฟล์ละไม่เกิน 5MB) ผ่าน Server Action
      // ค่า default ของ Next.js คือ 1MB ซึ่งเล็กเกินไปสำหรับ FormData ที่มีไฟล์รูปภาพ
      // (avatar เดี่ยวสูงสุด 5MB, รูปสัตว์เลี้ยงสูงสุด 3 รูป x 5MB ต่อ request) เลยต้องขยายเผื่อไว้
      bodySizeLimit: '20mb',
    },
  },
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
      {
        protocol: 'https',
        hostname: 'profile.line-scdn.net',
      },
    ],
  },
};

export default nextConfig;
