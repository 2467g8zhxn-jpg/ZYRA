"use client";

import DashboardLayout from "../dashboard/layout";
import { useAuth } from "@/lib/firebase/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Crown, Users as UsersIcon, Zap } from "lucide-react";

const TEAM_MEMBERS = [
  { nombre: "Carlos Rivera", rol: "admin", nivel: 12, puntos: 2450, racha: 15, lider: true },
  { nombre: "Andrea Soto", rol: "employee", nivel: 8, puntos: 1560, racha: 4, lider: false },
  { nombre: "Miguel Ángel", rol: "employee", nivel: 5, puntos: 890, racha: 1, lider: false },
];

export default function TeamPage() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <UsersIcon className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Equipo Alpha Operativo</h2>
            <p className="text-muted-foreground">Colaboradores asignados al proyecto actual.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member, i) => (
            <Card key={i} className={`bg-card border-white/5 overflow-hidden relative ${member.lider ? 'border-l-4 border-l-yellow-500' : ''}`}>
              {member.lider && (
                <div className="absolute top-2 right-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-20 w-20 border-4 border-white/5 ring-2 ring-accent">
                    <AvatarImage src={`https://picsum.photos/seed/${member.nombre}/200`} />
                    <AvatarFallback>{member.nombre.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-white">{member.nombre}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">{member.rol}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 w-full gap-2 pt-2">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Nivel</p>
                      <p className="text-lg font-bold text-accent">{member.nivel}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Puntos</p>
                      <p className="text-lg font-bold text-primary">{member.puntos}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">
                      <Mail className="h-4 w-4" />
                    </button>
                    <button className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-background transition-colors">
                      <Phone className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-violet/10 border-violet/30 border shadow-lg overflow-hidden">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-violet flex items-center justify-center shadow-[0_0_30px_rgba(138,43,226,0.6)]">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Desafío de Equipo</h3>
                <p className="text-muted-foreground mt-1">Completen 5 reportes consecutivos cada uno para ganar un bonus de +500 pts.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-bold text-violet">PROGRESO GRUPAL</span>
              <div className="flex items-center gap-2">
                {[1,1,1,0,0].map((dot, i) => (
                  <div key={i} className={`h-3 w-3 rounded-full ${dot ? 'bg-violet shadow-[0_0_10px_#8A2BE2]' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
