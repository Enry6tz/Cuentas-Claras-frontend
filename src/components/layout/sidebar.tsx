'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Map,
  Receipt,
  CreditCard,
  Settings,
  ChevronRight,
  X,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/trips', label: 'Viajes', icon: Map },
  { href: '/expenses', label: 'Gastos', icon: Receipt },
  { href: '/payments', label: 'Pagos', icon: CreditCard },
  { href: '/account', label: 'Cuenta', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { sidebarExpanded, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  const isAdmin = user?.publicMetadata?.admin === true;

  return (
    <>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r bg-card transition-transform lg:hidden',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <Link href="/dashboard" className="text-lg font-bold text-primary">
            Cuentas Claras
          </Link>
          <button onClick={() => setMobileSidebarOpen(false)}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    pathname.startsWith('/admin')
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950',
                  )}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <ShieldCheck className="h-5 w-5" />
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      {/* Desktop sidebar — slim icon bar */}
      <aside
        className={cn(
          'hidden lg:flex h-full flex-col border-r bg-card transition-all duration-200',
          sidebarExpanded ? 'w-52' : 'w-16',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center border-b py-4 px-2">
          <Link href="/dashboard" className="flex items-center justify-center rounded-lg bg-primary p-2">
            <span className="text-sm font-bold text-primary-foreground">CC</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-lg transition-colors',
                    sidebarExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {sidebarExpanded && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );

              return (
                <li key={item.href}>{linkContent}</li>
              );
            })}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className={cn(
                    'flex items-center rounded-lg transition-colors',
                    sidebarExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5',
                    pathname.startsWith('/admin')
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950',
                  )}
                >
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  {sidebarExpanded && (
                    <span className="text-sm font-medium">Admin</span>
                  )}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Expand toggle */}
        <div className="border-t px-2 py-3">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                sidebarExpanded && 'rotate-180',
              )}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
