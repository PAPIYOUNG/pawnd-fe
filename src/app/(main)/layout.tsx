import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SplashScreen } from '@/components/common/SplashScreen';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 1. Splash Screen แสดงภาพแอนิเมชัน Pet Hug 3 วินาทีแรกอย่างราบรื่น */}
      <SplashScreen duration={3000} />

      {/* 2. ส่วนหัวของเว็บไซต์ */}
      <Header />

      {/* 3. เนื้อหาหลักของแต่ละหน้า */}
      <main className="flex-1">{children}</main>

      {/* 4. ส่วนท้ายของเว็บไซต์ */}
      <Footer />
    </div>
  );
}
