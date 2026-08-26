import { AuthGuard } from "@/modules/auth/ui/auth-guard";
import { OrganizationGuard } from "@/modules/auth/ui/organization-guard";
import { DashboardSidebar } from "@/modules/dashboard/ui/dashboard-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <OrganizationGuard>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden w-full p-4 md:p-6 lg:p-10">
            <div className="flex w-full h-full rounded-[2rem] overflow-hidden border border-white/20 dark:border-white/30 bg-background/20 dark:bg-white/[0.08] backdrop-blur-3xl shadow-2xl dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] relative">
              <DashboardSidebar />

              <div className="flex flex-col flex-1 w-full min-w-0 bg-transparent">
                {/* Top Header Bar */}
                <header className="flex items-center justify-between h-14 px-4 border-b border-border/30 shrink-0 bg-transparent">
                  <div className="flex items-center gap-3">
                    <SidebarTrigger className="text-foreground/80 hover:text-foreground transition-colors" />
                    <div className="w-px h-4 bg-border/40" />
                    <span className="font-semibold text-sm tracking-tight">DrHuman Dashboard</span>
                  </div>
                  <ThemeToggle />
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-transparent">
                  {children}
                </main>
              </div>
            </div>
          </div>
          <Toaster richColors position="top-center" />
        </SidebarProvider>
      </OrganizationGuard>
    </AuthGuard>
  );
}
