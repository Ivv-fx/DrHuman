"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { 
  MessageSquare, 
  Files, 
  Settings, 
  Blocks, 
  Mic, 
  CreditCard 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Conversations", url: "/conversations", icon: MessageSquare },
  { title: "Knowledge Base", url: "/files", icon: Files },
  { title: "Customization", url: "/customization", icon: Settings },
  { title: "Integrations", url: "/integrations", icon: Blocks },
  { title: "Vapi Settings", url: "/plugins/vapi", icon: Mic },
  { title: "Billing", url: "/billing", icon: CreditCard },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <OrganizationSwitcher 
          hidePersonal
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger: "w-full justify-between border rounded-md px-3 py-2",
            }
          }}
        />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={pathname.startsWith(item.url)}
                    render={
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3 px-2">
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8",
              }
            }}
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">My Account</span>
            <span className="text-xs text-muted-foreground">Manage profile</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
