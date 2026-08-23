"use client";

import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function OrganizationGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, organization } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !organization) {
      router.replace("/org-selection");
    }
  }, [isLoaded, organization, router]);

  if (!isLoaded || !organization) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
