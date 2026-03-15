"use client";

import { useState, useMemo } from "react";
import { 
  FileText,
  Search,
  Briefcase,
  Check,
  X,
  Clock,
  AlertCircle
} from "lucide-react";
import DashboardLayout from "../dashboard/layout";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { cn } from "@/lib/utils";
import { doc, updateDoc, collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

// Mock data normalized to Report entity schema for fallback/demo
const FALLBACK_REPORTS = [
  { 
    id: "demo-1", 
    timestamp: "2026-02-16T10:00:00Z", 
    content: "Fuga detectada en tubería de desagüe del sótano. Se requiere acción inmediata para evitar filtraciones mayores.", 
    projectName: "Residencial Las Palmas",
    authorName: "Mia Rodriguez",
    status: "Pendiente",
    imageUrl: "https://picsum.photos/seed/leak/800/600",
    imageHint: "leak repair"
  },
  { 
    id: "demo-2", 
    timestamp: "2026-02-15T15:30:00Z", 
    content: "Instalación de cuadro eléctrico principal finalizada en planta 3. Todo según norma NCH4.", 
    projectName: "Parque Solar Atacama",
    authorName: "Leo Martinez",
    status: "Aprobado",
    imageUrl: "https://picsum.photos/seed/electric/800/600",
    imageHint: "electrical panel"
  },
  { 
    id: "demo-3", 
    timestamp: "2026-02-14T09:15:00Z", 
    content: "Paneles instalados y cableado final en unidad 12A. Pendiente validación de inversor.", 
    projectName: "Residencial Las Palmas",
    authorName: "Leo Martinez",
    status: "Aprobado",
    imageUrl: "https://picsum.photos/seed/panels/800/600",
    imageHint: "solar panels"
  },
  { 
    id: "demo-4", 
    timestamp: "2026-02-12T11:00:00Z", 
    content: "Revisión de unidad de aire acondicionado en azotea. Filtros limpios y carga de gas verificada.", 
    projectName: "Planta Industrial BioBio",
    authorName: "David Kim",
    status: "Aprobado",
    imageUrl: "https://picsum.photos/seed/hvac/800/600",
    imageHint: "air conditioning"
  },
  { 
    id: "demo-5", 
    timestamp: "2026-02-10T08:00:00Z", 
    content: "Mantenimiento preventivo bloqueado por falta de acceso a sala de máquinas.", 
    projectName: "Edificio Horizonte",
    authorName: "Mia Rodriguez",
    status: "Rechazado",
    imageUrl: "https://picsum.photos/seed/locked/800/600",
    imageHint: "locked door"
  }
];

export default function ReportsPage() {
  const { profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const isAdmin = profile?.rol === 'admin';
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Firestore connection
  const reportsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "reports");
  }, [db]);

  const { data: firestoreReports, isLoading } = useCollection(reportsQuery);

  // Merge real data with fallback data for demo completeness
  const reports = useMemo(() => {
    const realData = firestoreReports || [];
    if (realData.length === 0) return FALLBACK_REPORTS;
    return realData;
  }, [firestoreReports]);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = 
        (report.content || report.contenido || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.authorName || report.autor || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.projectName || report.proyecto || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const status = report.status || "Pendiente";
      const matchesFilter = activeFilter === "Todos" || status === activeFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [reports, searchTerm, activeFilter]);

  const handleUpdateStatus = (reportId: string, newStatus: "Aprobado" | "Rechazado") => {
    if (!db) return;
    
    // Prevent actions on demo/fallback data that isn't in Firestore
    if (reportId.startsWith('demo-')) {
      toast({
        title: "Modo Demo",
        description: "Esta acción solo se puede realizar en reportes reales guardados en la base de datos.",
        variant: "destructive"
      });
      return;
    }

    setProcessingId(reportId);
    const reportRef = doc(db, "reports", reportId);
    const updateData = { status: newStatus };

    // Update document using the standard Firebase SDK
    updateDoc(reportRef, updateData)
      .then(() => {
        toast({ 
          title: `Reporte ${newStatus}`, 
          description: `El registro ha sido movido a la sección de ${newStatus.toLowerCase()}.` 
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: reportRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setProcessingId(null));
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Acceso Restringido</h2>
          <p className="text-muted-foreground max-w-md">
            Solo el personal de supervisión técnica puede validar y auditar los reportes operativos de obra.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 font-body">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-4xl font-bold tracking-tight text-white font-headline">
              Auditoría de Reportes (REP)
            </h2>
            <p className="text-muted-foreground">
              Supervisión de evidencias operativas y validación de protocolos de seguridad.
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4">
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full lg:w-auto">
            <TabsList className="bg-white/5 border border-white/10 p-1">
              {["Todos", "Pendiente", "Aprobado", "Rechazado"].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-xs font-semibold px-4"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por obra, técnico o contenido..." 
              className="pl-10 bg-white/5 border-white/10 focus:border-accent h-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid View */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            {filteredReports.map((report) => {
              const currentStatus = report.status || "Pendiente";
              const content = report.content || report.contenido;
              const author = report.authorName || report.autor;
              const project = report.projectName || report.proyecto;
              const date = report.timestamp || report.fecha;

              return (
                <div 
                  key={report.id} 
                  className="bg-card/40 border border-white/10 rounded-2xl overflow-hidden group hover:border-accent/40 transition-all flex flex-col shadow-xl backdrop-blur-sm"
                >
                  {/* Card Image and Status Badge */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={report.imageUrl || "https://picsum.photos/seed/solar-report/800/600"}
                      alt={content}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      data-ai-hint={report.imageHint || "construction report"}
                    />
                    <div className="absolute top-3 right-3">
                      <Badge 
                        className={cn(
                          "font-bold text-[10px] px-2 py-0.5 border-none shadow-lg",
                          currentStatus === "Pendiente" && "bg-yellow-500 text-white",
                          currentStatus === "Aprobado" && "bg-emerald-500 text-white",
                          currentStatus === "Rechazado" && "bg-red-500 text-white"
                        )}
                      >
                        {currentStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-accent">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{project}</span>
                      </div>
                      <p className="text-sm font-semibold text-white leading-snug line-clamp-3">
                        {content}
                      </p>
                    </div>
                    
                    <div className="space-y-3 border-t border-white/5 pt-4 mt-auto">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-bold text-white/70">{author}</span>
                        <span>{date ? format(new Date(date), "d/M/yyyy") : "N/A"}</span>
                      </div>

                      {/* Action Buttons for Pending Reports */}
                      {currentStatus === "Pendiente" && (
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-[10px] h-8 gap-1.5"
                            disabled={processingId === report.id}
                            onClick={() => handleUpdateStatus(report.id, "Aprobado")}
                          >
                            <Check className="h-3 w-3" /> APROBAR
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-bold text-[10px] h-8 gap-1.5"
                            disabled={processingId === report.id}
                            onClick={() => handleUpdateStatus(report.id, "Rechazado")}
                          >
                            <X className="h-3 w-3" /> RECHAZAR
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredReports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
              <Clock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Sin reportes en esta sección</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              No se encontraron registros bajo el filtro "{activeFilter}" que coincidan con su búsqueda.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
