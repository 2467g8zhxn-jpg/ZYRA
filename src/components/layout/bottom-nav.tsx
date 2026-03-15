"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  ClipboardList,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useUser();
  const isAdmin = profile?.rol === 'admin';

  // Si es admin, no mostramos la barra inferior para mantener el diseño original de escritorio
  if (isAdmin) return null;

  const navItems = [
    { title: "Inicio", icon: LayoutDashboard, href: "/dashboard" },
    { title: "Proyectos", icon: Briefcase, href: "/projects" },
    { title: "Equipo", icon: Users, href: "/team" },
    { title: "Reportes", icon: ClipboardList, href: "/reports" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-white/5 pb-safe">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.title} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-all",
                isActive ? "text-accent" : "text-muted-foreground hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {item.title}
              </span>
              {isActive && (
                <div className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
