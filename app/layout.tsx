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

export const viewport = {
  themeColor: '#0ea495',
};

import { BottomNav } from '@/components/bottom-nav';
import { PageTransition } from '@/components/page-transition';
import { AuthProvider } from '@/hooks/use-auth';
import { StudentsProvider } from '@/hooks/use-students';
import { AuthGuard } from '@/components/auth-guard';
import { SubscriptionGuard } from '@/components/subscription-guard';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable}`}>
      <body className="bg-[#FDFBF7] text-[#1C1917] antialiased font-sans" suppressHydrationWarning>
        <AuthProvider>
          <StudentsProvider>
            <AuthGuard>
              <SubscriptionGuard>
                <div className="mx-auto min-h-screen max-w-md bg-[#FDFBF7] pb-20">
                  <PageTransition>
                    {children}
                  </PageTransition>
                  <BottomNav />
                </div>
              </SubscriptionGuard>
            </AuthGuard>
          </StudentsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
