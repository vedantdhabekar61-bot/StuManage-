import { Link, useLocation } from 'wouter';
import { Home, Users, LayoutGrid, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Roster', icon: Users, href: '/students' },
  { label: 'Seats', icon: LayoutGrid, href: '/seats' },
  { label: 'Add', icon: PlusCircle, href: '/add' },
];

export function BottomNav() {
  const [pathname] = useLocation();
  const isAuthPage = ['/login', '/auth', '/trial', '/billing', '/privacy', '/terms'].some(p => pathname === p || pathname.startsWith(`${p}/`));
  if (isAuthPage) return null;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-border/10 bg-card/90 backdrop-blur-md shadow-soft">
      <div className="flex items-center justify-around pb-4 pt-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn('relative flex flex-1 flex-col items-center justify-end gap-1 transition-all py-1', isActive ? 'text-primary' : 'text-muted hover:text-primary/70')}>
              {isActive && <div className="absolute -top-2 w-8 h-1 bg-primary rounded-full" />}
              <div className="flex h-8 items-center justify-center"><item.icon className={cn("h-6 w-6 transition-transform", isActive && "fill-current")} /></div>
              <span className={cn("text-[11px] leading-none tracking-wide", isActive ? "font-bold" : "font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
