import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import '@/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif' 
});

export const metadata: Metadata = {
  title: 'MyStudents - Smart Library Management',
  description: 'Manage your reading room and study library efficiently.',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#2563eb',
};

import { BottomNav } from '@/components/bottom-nav';
import { PageTransition } from '@/components/page-transition';
import { AuthProvider } from '@/hooks/use-auth';
import { AuthGuard } from '@/components/auth-guard';
import { SubscriptionGuard } from '@/components/subscription-guard';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-slate-50 text-slate-900 antialiased font-sans" suppressHydrationWarning>
        <AuthProvider>
          <AuthGuard>
            <SubscriptionGuard>
              <div className="mx-auto min-h-screen max-w-md bg-white shadow-xl pb-20">
                <PageTransition>
                  {children}
                </PageTransition>
                <BottomNav />
              </div>
            </SubscriptionGuard>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
