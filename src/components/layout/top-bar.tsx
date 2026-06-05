'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { HeaderBreadcrumb } from '@/components/layout/header-breadcrumb';
import { NotificationsBell } from '@/components/layout/notifications-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { TripSearchDialog } from '@/components/layout/trip-search-dialog';

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Atajo de teclado ⌘K / Ctrl+K para abrir el buscador de viajes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 bg-muted/50 px-4">
      <SidebarTrigger className="-ml-1" />
     
      <HeaderBreadcrumb />

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchOpen(true)}
          className="gap-2 text-muted-foreground"
        >
          <Search className="size-4" />
          <span className="hidden md:inline">Buscar viaje</span>
          <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 text-[10px] font-medium md:inline">
            ⌘K
          </kbd>
        </Button>
        <ThemeToggle />
        <NotificationsBell />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <UserButton />
      </div>

      <TripSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
