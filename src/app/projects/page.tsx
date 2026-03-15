
"use client";

import DashboardLayout from "../dashboard/layout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  ArrowRight, 
  Plus,
  Sparkles,
  Camera,
  Loader2,
  Briefcase
} from "lucide-react";
import Image from "next/image";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { doc, setDoc, collection, addDoc, query, where, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { aiReportDraftingAssistant } from "@/ai/flows/ai-report-drafting-assistant-flow";

export default function ProjectsPage() {
  const { profile, user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const isAdmin = profile?.rol === 'admin';
  
  const [loading, setLoading] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [newProject, setNewProject] = useState({
    Pry_Nombre_Proyecto: "",
    Cl_ID: "",
    Srv_ID: "Instalación",
    Eq_ID: "",
    ubicacion: "",
    imageUrl: "https://picsum.photos/seed/solar-default/800/450"
  });

  const [reportContent, setReportContent] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [checklist, setChecklist] = useState({
    epp_completo: false,
    herramientas_listas: false,
    seguridad_area: false
  });

  const userTeamsQuery = useMemoFirebase(() => {
    if (!db || !user || isAdmin) return null;
    return query(collection(db, "teams"), where("members", "array-contains", user.uid));
  }, [db, user, isAdmin]);

  const { data: myTeams } = useCollection(userTeamsQuery);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !profile) return null;
    if (isAdmin) return collection(db, "proyectos");
    if (myTeams && myTeams.length > 0) {
      const teamIds = myTeams.map(t => t.id);
      return query(collection(db, "proyectos"), where("assignedTeamId", "in", teamIds));
    }
    return query(collection(db, "proyectos"), where("assignedTeamId", "==", "no-team"));
  }, [db, isAdmin, profile, myTeams]);

  const teamsQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collection(db, "teams");
  }, [db, isAdmin]);

  const { data: firestoreProjects, isLoading: projectsLoading } = useCollection(projectsQuery);
  const { data: teams } = useCollection(teamsQuery);

  const createNotification = async (userId: string, title: string, message: string, type: string) => {
    if (!db) return;
    await addDoc(collection(db, "notifications"), {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    });
  };

  const handleCreateProject = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const projRef = await addDoc(collection(db, "proyectos"), {
        ...newProject,
        Pry_Estado: "Pendiente",
        progreso: 0,
        assignedTeamId: newProject.Eq_ID,
        fecha_creacion: new Date().toISOString(),
      });

      // Notify team members
      const selectedTeam = teams?.find(t => t.id === newProject.Eq_ID);
      if (selectedTeam) {
        for (const memberId of selectedTeam.members) {
          await createNotification(
            memberId,
            "Proyecto Asignado",
            `Tu equipo ha sido asignado al proyecto: ${newProject.Pry_Nombre_Proyecto}`,
            "project"
          );
        }
      }

      toast({ title: "¡Éxito!", description: "Proyecto creado correctamente." });
      setIsCreateDialogOpen(false);
      setNewProject({
        Pry_Nombre_Proyecto: "",
        Cl_ID: "",
        Srv_ID: "Instalación",
        Eq_ID: "",
        ubicacion: "",
        imageUrl: "https://picsum.photos/seed/solar-default/800/450"
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo crear el proyecto." });
    } finally {
      setLoading(false);
    }
  };

  const handleStartDay = async (project: any) => {
    if (!user || !db) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        projectStatus: {
          ...profile?.projectStatus,
          [project.id]: {
            checklist_completado: true,
            timestamp_inicio: new Date().toISOString(),
            en_curso: true
          }
        }
      }, { merge: true });

      toast({ title: "Jornada Iniciada", description: "Protocolo de seguridad validado." });
      setIsSheetOpen(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Error al iniciar jornada." });
    } finally {
      setLoading(false);
    }
  };

  const handleFinishDayAndReport = async (project: any) => {
    if (!user || !db || !profile) return;
    if (!reportContent) {
      toast({ variant: "destructive", title: "Reporte requerido", description: "Describe las tareas antes de finalizar." });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "reports"), {
        projectId: project.id,
        projectName: project.Pry_Nombre_Proyecto,
        content: reportContent,
        authorName: profile.nombre || "Técnico Zyra",
        employeeId: user.uid,
        assignedTeamId: project.assignedTeamId || "sin-equipo",
        status: "Pendiente",
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
        imageUrl: project.imageUrl || "https://picsum.photos/seed/report-final/800/600"
      });

      const currentPoints = profile.puntos || 0;
      const currentLevel = profile.level || 1;
      const newPoints = currentPoints + 50;
      let newLevel = currentLevel;
      
      // Basic level up logic
      if (newPoints >= currentLevel * 200) {
        newLevel = currentLevel + 1;
        await createNotification(
          user.uid,
          "¡SUBISTE DE NIVEL!",
          `Felicidades, ahora eres Nivel ${newLevel}`,
          "level"
        );
      }

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        projectStatus: {
          ...profile?.projectStatus,
          [project.id]: {
            checklist_completado: false,
            en_curso: false,
            ultimo_reporte: new Date().toISOString()
          }
        },
        puntos: newPoints,
        level: newLevel
      }, { merge: true });

      toast({ title: "Reporte Enviado", description: "Has finalizado tu jornada con éxito. +50 pts." });
      setIsSheetOpen(false);
      setReportContent("");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo enviar el reporte." });
    } finally {
      setLoading(false);
    }
  };

  const handleAiDraft = async (projectName: string) => {
    if (!reportContent) {
      toast({ title: "Notas requeridas", description: "Escribe algunas notas básicas para que la IA pueda ayudarte." });
      return;
    }

    setIsAiDrafting(true);
    try {
      const result = await aiReportDraftingAssistant({
        reportNotes: reportContent,
        projectName: projectName,
        employeeName: profile?.nombre || "Técnico"
      });

      setReportContent(result.draftedReportDescription);
      toast({ title: "Asistente AI", description: "Reporte estructurado profesionalmente." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error AI", description: "No se pudo conectar con el asistente." });
    } finally {
      setIsAiDrafting(false);
    }
  };

  if (isUserLoading || (isAdmin && projectsLoading)) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 font-body">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {isAdmin ? "Proyectos" : "Mis Proyectos"}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {isAdmin ? "Gestión y creación de obras." : "Toca un proyecto para iniciar o finalizar tu jornada."}
            </p>
          </div>
          
          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 text-white font-bold gap-2">
                  <Plus className="h-4 w-4" /> Nuevo Proyecto
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-accent text-xl">Nuevo Frente de Trabajo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nombre del Proyecto</Label>
                    <Input 
                      className="bg-white/5 border-white/10 h-11"
                      value={newProject.Pry_Nombre_Proyecto}
                      onChange={(e) => setNewProject({...newProject, Pry_Nombre_Proyecto: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Cliente</Label>
                      <Input 
                        className="bg-white/5 border-white/10 h-11"
                        value={newProject.Cl_ID}
                        onChange={(e) => setNewProject({...newProject, Cl_ID: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Equipo (EQ)</Label>
                      <Select onValueChange={(val) => setNewProject({...newProject, Eq_ID: val})}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-11">
                          <SelectValue placeholder="Asignar" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-white/10 text-white">
                          {teams?.map((team) => (
                            <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    className="bg-accent hover:bg-accent/90 text-white w-full h-12 font-bold"
                    disabled={!newProject.Pry_Nombre_Proyecto || !newProject.Cl_ID || loading}
                    onClick={handleCreateProject}
                  >
                    {loading ? "Creando..." : "Registrar Proyecto"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {firestoreProjects && firestoreProjects.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {firestoreProjects.map((project: any) => {
              const isEnCurso = profile?.projectStatus?.[project.id]?.en_curso;
              const statusColor = project.Pry_Estado === 'EnProceso' ? 'bg-emerald-500' : project.Pry_Estado === 'Finalizado' ? 'bg-primary' : 'bg-yellow-500';

              return (
                <Card key={project.id} className="bg-card border-white/10 overflow-hidden flex flex-col h-full shadow-lg relative group">
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={project.imageUrl || "https://picsum.photos/seed/solar-pan/800/450"}
                      alt={project.Pry_Nombre_Proyecto}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge className={cn("font-bold text-[9px] px-2 py-0.5", statusColor)}>
                        {(project.Pry_Estado || 'PENDIENTE').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">{project.Pry_Nombre_Proyecto}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold mb-3">
                        <MapPin className="h-3 w-3 text-accent" />
                        <span className="truncate">{project.ubicacion || "Ubicación Pendiente"}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase">
                        <span>Avance</span>
                        <span className="text-white">{project.progreso || 0}%</span>
                      </div>
                      <Progress value={project.progreso || 0} className="h-1 bg-white/5" />
                    </div>
                  </CardContent>

                  <CardFooter className="p-0 border-t border-white/5">
                    {isAdmin ? (
                      <div className="grid grid-cols-2 w-full">
                        <Button variant="ghost" className="h-10 text-[10px] font-bold border-r border-white/5 rounded-none uppercase">Equipo</Button>
                        <Button variant="ghost" className="h-10 text-[10px] font-bold rounded-none uppercase text-accent">Reportes</Button>
                      </div>
                    ) : (
                      <Sheet open={isSheetOpen && selectedProject?.id === project.id} onOpenChange={(open) => {
                        setIsSheetOpen(open);
                        if (open) setSelectedProject(project);
                      }}>
                        <SheetTrigger asChild>
                          <Button 
                            className={cn(
                              "w-full h-12 rounded-none font-black text-xs uppercase tracking-widest",
                              isEnCurso ? "bg-emerald-600 hover:bg-emerald-700" : "bg-accent hover:bg-accent/90"
                            )}
                          >
                            {isEnCurso ? "Finalizar Jornada" : "Iniciar Jornada"}
                            <ArrowRight className="h-3 w-3 ml-2" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="bg-card border-white/10 text-white h-[90vh] rounded-t-3xl overflow-y-auto px-6">
                          <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 mt-2" />
                          <SheetHeader className="text-left mb-8">
                            <SheetTitle className="text-accent text-2xl font-black">{project.Pry_Nombre_Proyecto}</SheetTitle>
                            <SheetDescription className="text-muted-foreground text-xs uppercase font-bold tracking-widest">
                              {isEnCurso ? "Cierre técnico del día" : "Checklist de seguridad obligatorio"}
                            </SheetDescription>
                          </SheetHeader>
                          
                          <div className="space-y-6 pb-20">
                            {!isEnCurso ? (
                              <div className="space-y-6">
                                <div className="space-y-4">
                                  {[
                                    { key: 'epp_completo', label: 'EPP COMPLETO (Casco, Guantes, Zapatos)' },
                                    { key: 'seguridad_area', label: 'ÁREA DE TRABAJO DELIMITADA Y SEGURA' },
                                    { key: 'herramientas_listas', label: 'HERRAMIENTAS EN BUEN ESTADO' },
                                  ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                                      <Label className="text-xs font-bold leading-tight max-w-[70%]">{item.label}</Label>
                                      <Switch 
                                        checked={(checklist as any)[item.key]} 
                                        onCheckedChange={(v) => setChecklist({...checklist, [item.key]: v})} 
                                      />
                                    </div>
                                  ))}
                                </div>
                                <Button 
                                  className="w-full bg-accent hover:bg-accent/90 text-white font-black h-16 text-lg rounded-2xl shadow-xl shadow-accent/20"
                                  disabled={!checklist.epp_completo || !checklist.seguridad_area || !checklist.herramientas_listas || loading}
                                  onClick={() => handleStartDay(project)}
                                >
                                  {loading ? "Validando..." : "CONFIRMAR E INICIAR"}
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Resumen de Actividades</Label>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-8 text-[10px] border-accent/30 text-accent font-black gap-1.5 rounded-full"
                                      onClick={() => handleAiDraft(project.Pry_Nombre_Proyecto)}
                                      disabled={isAiDrafting}
                                    >
                                      {isAiDrafting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                      ASISTENTE IA
                                    </Button>
                                  </div>
                                  <Textarea 
                                    placeholder="Describe las tareas realizadas hoy..." 
                                    className="bg-white/2 border-white/10 min-h-[180px] text-sm rounded-2xl p-4"
                                    value={reportContent}
                                    onChange={(e) => setReportContent(e.target.value)}
                                  />
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="aspect-square w-full rounded-2xl bg-white/2 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent/40 transition-colors">
                                      <Camera className="h-6 w-6" />
                                      <span className="text-[9px] font-bold uppercase tracking-tighter">FOTO OBRA</span>
                                    </div>
                                    <div className="aspect-square w-full rounded-2xl bg-white/2 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent/40 transition-colors">
                                      <Camera className="h-6 w-6" />
                                      <span className="text-[9px] font-bold uppercase tracking-tighter">FOTO MATERIAL</span>
                                    </div>
                                  </div>
                                </div>

                                <Button 
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-16 text-lg rounded-2xl shadow-xl shadow-emerald-900/20"
                                  disabled={!reportContent || loading}
                                  onClick={() => handleFinishDayAndReport(project)}
                                >
                                  {loading ? "Enviando..." : "FINALIZAR JORNADA"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6 bg-white/2 rounded-3xl border border-dashed border-white/5">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Sin proyectos</h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
              {isAdmin ? "No hay obras registradas en el sistema." : "No tienes obras asignadas para hoy."}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
