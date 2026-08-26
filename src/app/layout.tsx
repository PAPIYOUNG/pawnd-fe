import type { Metadata } from 'next';
import '@styles/globals.css';
import { cn } from '@/lib/utils';
import { notoSans } from '@/styles/font';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import 'leaflet/dist/leaflet.css';
import '@/styles/globals.css';

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
      lang="th"
      suppressHydrationWarning
      className={cn('antialiased', 'font-sans', notoSans.variable)}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('pawnd-theme') || 'system';
                var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
