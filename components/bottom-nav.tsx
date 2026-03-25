'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, LayoutGrid, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Roster', icon: Users, href: '/students' },
  { label: 'Seats', icon: LayoutGrid, href: '/seats' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/trial' || pathname === '/payment';

  if (isAuthPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 transition-all',
                isActive ? 'text-teal-500' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive && "scale-110")} />
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
