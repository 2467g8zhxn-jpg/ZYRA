
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Zap, 
  Sparkles, 
  Send, 
  Image as ImageIcon, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { aiReportDraftingAssistant } from "@/ai/flows/ai-report-drafting-assistant-flow";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "../dashboard/layout";

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportNotes, setReportNotes] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftedContent, setDraftedContent] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAIDraft = async () => {
    if (!reportNotes.trim()) return;
    setDrafting(true);
    try {
      const result = await aiReportDraftingAssistant({
        reportNotes,
        projectName: "Proyecto Demo Solar",
        employeeName: "Operador Zyra",
      });
      setDraftedContent(result.draftedReportDescription);
      setHighlights(result.keyHighlights);
      toast({ title: "Draft generado", description: "La IA ha estructurado tu reporte." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error de IA", description: "No pudimos generar el borrador." });
    } finally {
      setDrafting(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!draftedContent) return;
    setSubmitting(true);
    
    // Simulación de envío
    setTimeout(() => {
      toast({ title: "Reporte enviado (Demo)", description: "Se ha simulado el envío del reporte con éxito." });
      setReportNotes("");
      setDraftedContent("");
      setHighlights([]);
      setSelectedFile(null);
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Operaciones Diarias</h2>
        <p className="text-muted-foreground">Utiliza el asistente de IA para redactar reportes precisos y profesionales.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-1">
        <Card className="bg-card border-white/5 border-l-4 border-l-accent shadow-xl overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-accent" />
              Asistente de Redacción IA
            </CardTitle>
            <CardDescription>Cuéntanos brevemente qué hiciste hoy y la IA lo estructurará por ti.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">Notas rápidas</Label>
                <Textarea
                  id="notes"
                  placeholder="Instalé 5 paneles, revisión de inversor terminada, clima soleado..."
                  className="min-h-[120px] bg-white/5 border-white/10 focus:border-accent text-white"
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleAIDraft} 
                disabled={drafting || !reportNotes}
                className="w-full bg-accent hover:bg-accent/90 text-white gap-2 h-11"
              >
                {drafting ? <Loader2 className="animate-spin h-5 w-5" /> : <Zap className="h-5 w-5" />}
                {drafting ? "Procesando notas..." : "Generar Draft Profesional"}
              </Button>
            </div>

            {draftedContent && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6 pt-6 border-t border-white/10">
                <div className="space-y-2">
                  <Label className="text-accent font-bold uppercase tracking-wider text-xs">REPORTE GENERADO</Label>
                  <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-sm text-white leading-relaxed whitespace-pre-wrap">
                    {draftedContent}
                  </div>
                </div>

                {highlights.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-primary font-bold uppercase tracking-wider text-xs">HIGHLIGHTS</Label>
                    <ul className="grid gap-2">
                      {highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor="photo" className="cursor-pointer">
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-white/20 hover:border-accent transition-all text-sm text-muted-foreground">
                          <ImageIcon className="h-5 w-5" />
                          {selectedFile ? selectedFile.name : "Adjuntar foto de obra (opcional)"}
                        </div>
                        <Input 
                          id="photo" 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          accept="image/*"
                        />
                      </Label>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubmitReport} 
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary/90 text-background font-bold h-12 gap-2"
                  >
                    {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                    {submitting ? "Enviando..." : "Confirmar y Enviar Reporte"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
