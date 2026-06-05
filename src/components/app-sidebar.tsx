'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Plane,
  Receipt,
  CreditCard,
  Mail,
  Settings,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { SidebarAddTripForm } from '@/components/sidebar-add-trip-form';
import { Badge } from '@/components/ui/badge';
import { useMyInvitations } from '@/hooks/querys/invitations/useMyInvitations';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/trips', label: 'Viajes', icon: Plane },
  { href: '/expenses', label: 'Gastos', icon: Receipt },
  { href: '/payments', label: 'Pagos', icon: CreditCard },
  { href: '/invitations', label: 'Invitaciones', icon: Mail },
  { href: '/account', label: 'Cuenta', icon: Settings },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.admin === true;
  const isActive = (href: string) => pathname.startsWith(href);

  const { data: invitations = [] } = useMyInvitations();
  const invitationCount = invitations.length;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Wallet className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Cuentas Claras</span>
                <span className="text-xs text-sidebar-foreground/70">Gastos de viaje</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const showCount =
                item.href === '/invitations' && invitationCount > 0;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    {showCount && (
                      <Badge
                        variant="secondary"
                        className="ml-auto bg-destructive/10 text-destructive border-transparent group-data-[collapsible=icon]:hidden"
                      >
                        {invitationCount}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive('/admin')}
                  tooltip="Admin"
                  render={<Link href="/admin" />}
                >
                  <ShieldCheck />
                  <span>Admin</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        {/* Oculto en modo colapsado (icon) para no romper el rail angosto */}
        <div className="p-1 group-data-[collapsible=icon]:hidden">
          <SidebarAddTripForm />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
