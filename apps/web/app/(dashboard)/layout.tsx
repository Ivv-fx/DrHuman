import { AuthGuard } from "@/modules/auth/ui/auth-guard";
import { OrganizationGuard } from "@/modules/auth/ui/organization-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <OrganizationGuard>
        {children}
      </OrganizationGuard>
    </AuthGuard>
  );
}
