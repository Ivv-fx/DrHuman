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
              {/* Top Header Bar */}
              <header className="flex items-center justify-between h-14 px-4 border-b border-border/60 shrink-0 bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
                  <div className="w-px h-4 bg-border/60" />
                  <span className="font-semibold text-sm tracking-tight">Echo Dashboard</span>
                </div>
                <ThemeToggle />
              </header>
              
              {/* Page Content — no extra padding; pages control their own layout */}
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </OrganizationGuard>
    </AuthGuard>
  );
}
