
"use client";

import { useUser } from "@/firebase";
import { StatCard } from "@/components/dashboard/stat-card";
import { 
  Trophy, 
  Flame, 
  Star, 
  Zap, 
  CheckCircle2, 
  TrendingUp,
  Briefcase,
  Camera,
  Users
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const weeklyData = [
  { name: 'Sem 16/02', total: 1 },
  { name: 'Sem 23/02', total: 0 },
  { name: 'Sem 02/03', total: 0 },
  { name: 'Sem 09/03', total: 0 },
];

const projectProgressData = [
  { name: 'Finalizado', value: 1, color: '#8A2BE2' },
  { name: 'En progreso', value: 4, color: '#63D9F0' },
];

export default function DashboardPage() {
  const { profile, loading } = useUser();
  const isAdmin = profile?.rol === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto font-body">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Bienvenido, <span className="text-accent">Administrador.</span>
          </h2>
          <p className="text-muted-foreground">Visualiza y gestiona cada aspecto de tu operación.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="Proyectos Activos"
            value="3"
            icon={Briefcase}
            description="de 5 proyectos totales"
            className="border-white/10"
          />
          <StatCard
            title="Reportes Subidos Hoy"
            value="+0"
            icon={Camera}
            description="5 en total"
            className="border-white/10"
          />
          <StatCard
            title="Empleados Activos"
            value="6"
            icon={Users}
            description="7 miembros en total"
            className="border-white/10"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Reportes por Semana</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer config={{ total: { label: "Reportes", color: "#8A2BE2" } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff50" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#ffffff50" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="total" 
                      fill="#8A2BE2" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Avance General de Obras</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex flex-col items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectProgressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {projectProgressData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-muted-foreground">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista de Empleado (Existente)
  const puntos = profile?.puntos || 0;
  const nivel = profile?.nivel || 1;
  const racha = profile?.racha || 0;
  const progressPercentage = (puntos / (nivel * 200)) * 100;

  const logrosMock = profile?.logros || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-body">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Panel de Control: <span className="text-accent">{profile?.nombre}</span>
        </h2>
        <p className="text-muted-foreground">Progreso operativo y metas de rendimiento.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

        <Card className="bg-card border-white/10 overflow-hidden group hover:border-orange-500/50 transition-all">
          <CardContent className="p-6 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-[#FF4500]/10 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(255,69,0,0.3)]">
              <Flame className="h-7 w-7 text-[#FF4500]" />
            </div>
            <h3 className="text-3xl font-bold text-white">{racha} Días</h3>
            <p className="text-xs font-bold text-[#FF4500] uppercase mt-1">Racha Imparable</p>
          </CardContent>
        </Card>

        <StatCard
          title="Puntos Totales"
          value={puntos}
          icon={Star}
          description="Puntos Zyra ganados"
          className="border-white/10"
        />

        <StatCard
          title="Medallas"
          value={logrosMock.filter((l: any) => l.completado).length}
          icon={Trophy}
          description="Logros desbloqueados"
          className="border-white/10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" /> Tus Logros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {logrosMock.map((logro: any) => (
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
