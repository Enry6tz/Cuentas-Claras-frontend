import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/layout/top-bar';
import { UserSync } from '@/components/auth/user-sync';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { PageTransition } from '@/components/motion/page-transition';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <UserSync />
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <div className="flex-1 bg-muted/50 p-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
