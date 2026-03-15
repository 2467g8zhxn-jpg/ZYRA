
"use client";

import * as React from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  ClipboardList, 
  Building2,
  Package,
  UserCircle,
  Zap
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useUser } from "@/firebase";

export function AppSidebar() {
  const pathname = usePathname();
  const { profile } = useUser();
  const isAdmin = profile?.rol === 'admin';

  const navItems = isAdmin ? [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { title: "Proyectos", icon: Briefcase, href: "/projects" },
    { title: "Clientes", icon: Building2, href: "/clients" },
    { title: "Equipos", icon: Users, href: "/team" },
    { title: "Empleados", icon: UserCircle, href: "/employees" },
    { title: "Reportes", icon: ClipboardList, href: "/reports" },
    { title: "Materiales", icon: Package, href: "/materials" },
  ] : [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { title: "Proyectos", icon: Briefcase, href: "/projects" },
    { title: "Equipo", icon: Users, href: "/team" },
    { title: "Reportes", icon: ClipboardList, href: "/reports" },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-data-[collapsible=icon]:hidden">
            ZYRA <span className="text-accent">{isAdmin ? "COMMAND" : "OPERATIVO"}</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            {isAdmin ? "Panel de Administración" : "General"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="hover:bg-accent/10 active:bg-accent/20"
                  >
                    <a href={item.href} className="flex items-center gap-3">
                      <item.icon className={pathname === item.href ? "text-accent" : ""} />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
