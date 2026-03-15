
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock,
  FileText,
  Search,
  ImageIcon
} from "lucide-react";
import DashboardLayout from "../dashboard/layout";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function ReportsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Historial de reportes del empleado (Demo) con URLs de evidencia vinculadas
  const myReports = [
    { 
      id: "1", 
      fecha: "2024-03-20T07:30:00Z", 
      contenido: "Finalizada la conexión de los inversores en el bloque B. Se realizaron pruebas de tensión satisfactorias.", 
      proyecto: "Residencial Las Palmas",
      highlights: ["Inversores conectados", "Pruebas de tensión OK"],
      imageUrl: PlaceHolderImages.find(img => img.id === "evidencia-inversores")?.imageUrl || "https://picsum.photos/seed/solar-inv/800/450",
      imageHint: "solar inverter"
    },
    { 
      id: "2", 
      fecha: "2024-03-19T10:15:00Z", 
      contenido: "Montaje de estructura de soporte para paneles en techumbre norte completado al 100%.", 
      proyecto: "Residencial Las Palmas",
      highlights: ["Estructura completada", "Fase 1 terminada"],
      imageUrl: PlaceHolderImages.find(img => img.id === "evidencia-paneles")?.imageUrl || "https://picsum.photos/seed/solar-pan/800/450",
      imageHint: "solar panels"
    },
    { 
      id: "3", 
      fecha: "2024-03-15T09:00:00Z", 
      contenido: "Revisión de cableado AC en el sector C. Se detectó una falla en el térmico principal.", 
      proyecto: "Bodega Logística Norte",
      highlights: ["Revisión AC", "Falla detectada"],
      imageUrl: PlaceHolderImages.find(img => img.id === "evidencia-falla")?.imageUrl || "https://picsum.photos/seed/solar-fail/800/450",
      imageHint: "electrical cables"
    }
  ];

  const filteredReports = myReports.filter(report => 
    report.proyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.contenido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">Mis Reportes</h2>
            <p className="text-muted-foreground">Historial exclusivo de tu actividad operativa validada.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar reportes..." 
              className="pl-10 bg-white/5 border-white/10 focus:border-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="bg-card border-white/5 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            {filteredReports.length > 0 ? (
              <div className="divide-y divide-white/5">
                {filteredReports.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-white/2 transition-colors space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge className="bg-accent/10 text-accent border-accent/20 mb-2">
                          {report.proyecto}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {isMounted ? (
                            format(new Date(report.fecha), "PPP 'a las' p", { locale: es })
                          ) : (
                            "Cargando fecha..."
                          )}
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3">VALIDADO</Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                          <p className="text-sm text-white leading-relaxed italic">
                            "{report.contenido}"
                          </p>
                        </div>

                        {report.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {report.highlights.map((h, i) => (
                              <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative group aspect-video md:aspect-square w-full rounded-lg border border-white/10 overflow-hidden shadow-lg">
                        <Image
                          src={report.imageUrl}
                          alt={`Evidencia de ${report.proyecto}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                          data-ai-hint={report.imageHint}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <button className="flex items-center gap-2 text-xs font-medium text-accent hover:underline">
                        <FileText className="h-4 w-4" />
                        Ver reporte completo en PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-white">No se encontraron reportes</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                  {searchTerm 
                    ? `No hay resultados para "${searchTerm}".`
                    : "Aún no has registrado reportes en el sistema."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
