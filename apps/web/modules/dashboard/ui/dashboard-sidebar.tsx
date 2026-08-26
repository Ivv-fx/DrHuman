"use client";

import { OrganizationSwitcher, UserButton, useUser } from "@clerk/nextjs";
import { 
  MessageSquare, 
  Files, 
  Settings, 
  Blocks, 
  Mic, 
  CreditCard,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Conversations", url: "/conversations", icon: MessageSquare },
  { title: "Knowledge Base", url: "/files", icon: Files },
];

const configNav = [
  { title: "Customization", url: "/customization", icon: Settings },
  { title: "Integrations", url: "/integrations", icon: Blocks },
  { title: "Vapi Settings", url: "/plugins/vapi", icon: Mic },
];

const accountNav = [
  { title: "Billing", url: "/billing", icon: CreditCard },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar className="border-r border-border/60">
      {/* Brand Header */}
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="relative w-8 h-8 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 via-green-100 to-teal-200 opacity-90 blur-[1px]"></div>
            <Zap className="w-4 h-4 text-emerald-700 relative z-10" />
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-emerald-800 to-green-600 bg-clip-text text-transparent">DrHuman AI</span>
        </div>
        <OrganizationSwitcher 
          hidePersonal
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger:
                "w-full justify-between rounded-lg px-3 py-2 text-sm border border-border/60 bg-muted/40 hover:bg-muted transition-colors",
            }
          }}
        />
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-muted-foreground/70 uppercase px-2 mb-1">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const active = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={active}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                      render={
                        <Link href={item.url} className="flex items-center gap-3 w-full">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3 opacity-50" />

        {/* Config Nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-muted-foreground/70 uppercase px-2 mb-1">
            Configuration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configNav.map((item) => {
                const active = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={active}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                      render={
                        <Link href={item.url} className="flex items-center gap-3 w-full">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3 opacity-50" />

        {/* Account Nav */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNav.map((item) => {
                const active = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={active}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                      render={
                        <Link href={item.url} className="flex items-center gap-3 w-full">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-4 py-4 border-t border-border/60">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent transition-colors cursor-pointer group">
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8 ring-2 ring-border group-hover:ring-primary/30 transition-all",
              }
            }}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate">{user?.firstName ?? "My Account"}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress ?? "Manage profile"}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
