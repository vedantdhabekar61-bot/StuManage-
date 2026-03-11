'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Grid3X3, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', icon: LayoutDashboard, href: '/' },
  { label: 'Students', icon: Users, href: '/students' },
  { label: 'Seats', icon: Grid3X3, href: '/seats' },
  { label: 'Add', icon: PlusCircle, href: '/add' },
];

export function BottomNav() {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/trial' || pathname === '/payment';

  if (isAuthPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 transition-colors',
                isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
