
"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { 
  Trophy, 
  Flame, 
  Star, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  ClipboardList,
  Briefcase
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  // Datos mock para el dashboard
  const profile = {
    nombre: "Operador Zyra",
    nivel: 5,
    puntos: 1250,
    racha: 7,
    logros: ["Pionero", "Reporte Maestro"]
  };

  const nextLevelPoints = profile.nivel * 200;
  const progressPercentage = (profile.puntos % nextLevelPoints) / nextLevelPoints * 100;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Bienvenido, {profile.nombre}</h2>
        <p className="text-muted-foreground">Aquí tienes un resumen de tu actividad y progreso operacional.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Nivel Actual"
          value={profile.nivel}
          icon={Zap}
          description={`Próximo nivel: ${nextLevelPoints} pts`}
          progress={progressPercentage}
        />
        <StatCard
          title="Puntos Zyra"
          value={profile.puntos}
          icon={Star}
          description="Total acumulado"
        />
        <StatCard
          title="Racha Diaria"
          value={`${profile.racha} Días`}
          icon={Flame}
          description="¡No te detengas!"
        />
        <StatCard
          title="Logros"
          value={profile.logros.length}
          icon={Trophy}
          description="Medallas obtenidas"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-card border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Próximos Pasos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent/30 transition-all group">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-white">Reporte de Hoy</h4>
                  <Badge variant="outline" className="text-accent border-accent/30">Pendiente</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Completa tu reporte operativo diario para mantener tu racha y ganar 50 pts.</p>
                <a href="/reports" className="inline-flex items-center gap-1 text-xs text-accent mt-2 font-bold hover:underline">
                  CREAR REPORTE <Zap className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-white">Proyecto Las Palmas</h4>
                  <Badge variant="outline" className="text-primary border-primary/30">En curso</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Revisión de cableado pendiente en el sector B.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-card border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { label: "Reporte validado", time: "Hace 2h", points: "+50", icon: CheckCircle2, color: "text-green-500" },
                { label: "Nuevo nivel alcanzado", time: "Ayer", points: "Lv. 5", icon: TrendingUp, color: "text-accent" },
                { label: "Mantenimiento preventivo", time: "Ayer", points: "+50", icon: CheckCircle2, color: "text-green-500" },
                { label: "Check-in semanal", time: "2 días", points: "+100", icon: Star, color: "text-primary" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{activity.label}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${activity.color}`}>{activity.points}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
