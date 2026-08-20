import type { Metadata } from 'next';
import '@styles/globals.css';
import { cn } from '@/lib/utils';
import { notoSans } from '@/styles/font';

export const metadata: Metadata = {
  title: {
    template: '%s | PAWND',
    default: 'PAWND',
  },
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={cn('antialiased', 'font-sans', notoSans.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
