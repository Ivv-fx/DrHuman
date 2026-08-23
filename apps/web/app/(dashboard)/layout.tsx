import { AuthGuard } from "@/modules/auth/ui/auth-guard";
import { OrganizationGuard } from "@/modules/auth/ui/organization-guard";
import { DashboardSidebar } from "@/modules/dashboard/ui/dashboard-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <OrganizationGuard>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden w-full bg-background">
            <DashboardSidebar />
            
            <div className="flex flex-col flex-1 w-full min-w-0">
              <header className="flex items-center justify-between h-14 px-4 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <span className="font-semibold text-sm">Echo Dashboard</span>
                </div>
                <ThemeToggle />
              </header>
              
              <main className="flex-1 overflow-auto p-4 sm:p-6">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </OrganizationGuard>
    </AuthGuard>
  );
}
