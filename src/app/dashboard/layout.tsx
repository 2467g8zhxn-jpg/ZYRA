"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useUser } from "@/firebase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useUser();
  const isAdmin = profile?.rol === 'admin';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <SidebarTrigger className={isAdmin ? "flex" : "hidden md:flex"} />
          <div className="h-4 w-px bg-white/10 mx-2" />
          <h1 className="text-xs md:text-sm font-semibold text-muted-foreground truncate">
            {isAdmin ? "Sistema de Gestión Operativa ZYRA" : `ZYRA OPERATIVO - ${profile?.nombre || "Técnico"}`}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
