import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { BottomNav } from '@/components/bottom-nav';
import { PageTransition } from '@/components/page-transition';
import { AuthProvider } from '@/hooks/use-auth';
import { StudentsProvider } from '@/hooks/use-students';
import { AuthGuard } from '@/components/auth-guard';
import { SubscriptionGuard } from '@/components/subscription-guard';
import { SnackbarProvider } from '@/components/snackbar';
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

export const viewport: Viewport = {
  themeColor: '#0ea495',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Note: Set to false prevents zoom. Good for native app feel, bad for accessibility.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable}`}>
      <body className="bg-background text-foreground antialiased font-sans" suppressHydrationWarning>
        <AuthProvider>
          <SnackbarProvider>
            {/* Make sure AuthGuard and SubscriptionGuard ignore public routes like /login */}
            <AuthGuard>
              <StudentsProvider>
                <SubscriptionGuard>
                  <div className="mx-auto min-h-screen max-w-md bg-background pb-20">
                    <PageTransition>
                      {children}
                    </PageTransition>
                    <BottomNav />
                  </div>
                </SubscriptionGuard>
              </StudentsProvider>
            </AuthGuard>
          </SnackbarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
