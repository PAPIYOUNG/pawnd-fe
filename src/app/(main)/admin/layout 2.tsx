import AdminSideBar from '@/components/layout/AdminSideBar';
import Header from '@/components/layout/Header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSideBar />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
