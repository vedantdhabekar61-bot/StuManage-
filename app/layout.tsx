import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '@/globals.css';

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: 'StuManage app',
  description: 'Manage your reading room and study library efficiently.',
  manifest: '/manifest.json',
};

import type { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#0ea495',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

import { BottomNav } from '@/components/bottom-nav';
import { PageTransition } from '@/components/page-transition';
import { AuthProvider } from '@/hooks/use-auth';
import { StudentsProvider } from '@/hooks/use-students';
import { AuthGuard } from '@/components/auth-guard';
import { SubscriptionGuard } from '@/components/subscription-guard';
import { SnackbarProvider } from '@/components/snackbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable}`}>
      <body className="bg-background text-foreground antialiased font-sans" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `
          }}
        />
        <AuthProvider>
          <AuthGuard>
            <StudentsProvider>
              <SubscriptionGuard>
                <SnackbarProvider> 
                  <div className="mx-auto min-h-screen max-w-md bg-background pb-20">
                    <PageTransition>
                      {children}
                    </PageTransition>
                    <BottomNav />
                  </div>
                </SnackbarProvider>
              </SubscriptionGuard>
            </StudentsProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
