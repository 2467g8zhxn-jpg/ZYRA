
"use client";

import { useUser } from "@/firebase";
import { StatCard } from "@/components/dashboard/stat-card";
import { 
  Trophy, 
  Flame, 
  Star, 
  Zap, 
  CheckCircle2, 
  TrendingUp
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { profile, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
      </div>
    );
  }

  // Lógica de gamificación solicitada
  const puntos = profile?.puntos || 0;
  const nivel = profile?.nivel || 1;
  const racha = profile?.racha || 0;
  // Fórmula: (puntos_actuales / (nivel * 200)) * 100
  const progressPercentage = (puntos / (nivel * 200)) * 100;

  // Mapeo de logros (Demo con lógica de completado)
  const logrosMock = [
    { id: "1", nombre: "Pionero", completado: true },
    { id: "2", nombre: "Reporte Maestro", completado: true },
    { id: "3", nombre: "Racha 30 Días", completado: false },
    { id: "4", nombre: "Experto en Inversores", completado: false },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-body">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Panel de Control: <span className="text-accent">{profile?.nombre}</span>
        </h2>
        <p className="text-muted-foreground">Progreso operativo y metas de rendimiento.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Progreso de Nivel */}
        <Card className="bg-card border-white/10 overflow-hidden group hover:border-accent/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-accent/20">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nivel {nivel}</span>
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-bold text-white">{Math.floor(progressPercentage)}%</h3>
              <p className="text-xs text-muted-foreground">Progreso al nivel {nivel + 1}</p>
              <Progress value={progressPercentage} className="h-2 bg-white/5" />
            </div>
          </CardContent>
        </Card>

        {/* Métrica de Racha con color específico #FF4500 */}
        <Card className="bg-card border-white/10 overflow-hidden group hover:border-orange-500/50 transition-all">
          <CardContent className="p-6 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-[#FF4500]/10 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(255,69,0,0.3)]">
              <Flame className="h-7 w-7 text-[#FF4500]" />
            </div>
            <h3 className="text-3xl font-bold text-white">{racha} Días</h3>
            <p className="text-xs font-bold text-[#FF4500] uppercase mt-1">Racha Imparable</p>
          </CardContent>
        </Card>

        {/* Puntos Acumulados */}
        <StatCard
          title="Puntos Totales"
          value={puntos}
          icon={Star}
          description="Puntos Zyra ganados"
          className="border-white/10"
        />

        {/* Total de Logros */}
        <StatCard
          title="Medallas"
          value={logrosMock.filter(l => l.completado).length}
          icon={Trophy}
          description="Logros desbloqueados"
          className="border-white/10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Sección de Logros: Violeta (#8A2BE2) para completados, Opacidad 30% para bloqueados */}
        <Card className="md:col-span-4 bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" /> Tus Logros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {logrosMock.map((logro) => (
                <div 
                  key={logro.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all",
                    logro.completado 
                      ? "bg-[#8A2BE2]/10 border-[#8A2BE2]/30 text-white" 
                      : "bg-white/5 border-white/5 text-muted-foreground opacity-30"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    logro.completado ? "bg-[#8A2BE2] text-white" : "bg-muted"
                  )}>
                    <Star className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-sm">{logro.nombre}</span>
                  {logro.completado && <CheckCircle2 className="h-4 w-4 ml-auto text-[#8A2BE2]" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="md:col-span-3 bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Historial de Puntos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Reporte Validado", pts: "+50", date: "Hoy", color: "text-green-500" },
              { label: "Bono de Racha", pts: "+100", date: "Ayer", color: "text-orange-500" },
              { label: "Logro Desbloqueado", pts: "+200", date: "Hace 2 días", color: "text-[#8A2BE2]" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <TrendingUp className={cn("h-4 w-4", item.color)} />
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <span className={cn("font-bold", item.color)}>{item.pts}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
