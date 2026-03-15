"use client";

import { useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
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
  CheckCircle2,
  Calendar
} from "lucide-react";
import { aiReportDraftingAssistant } from "@/ai/flows/ai-report-drafting-assistant-flow";
import { db, storage } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "../dashboard/layout";

export default function ReportsPage() {
  const { profile } = useAuth();
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
        projectName: "Proyecto Asignado", // This would ideally come from the user's active project
        employeeName: profile?.nombre || "Colaborador",
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
    try {
      let imageUrl = "";
      if (selectedFile) {
        const fileRef = ref(storage, `proyectos/general/${Date.now()}_${selectedFile.name}`);
        const uploadResult = await uploadBytes(fileRef, selectedFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const reportData = {
        fecha: serverTimestamp(),
        empleadoID: profile?.uid,
        contenido: draftedContent,
        highlights,
        imageUrl,
        puntosOtorgados: 50,
        proyectoID: "general", // Dynamic assignment in production
      };

      await addDoc(collection(db, "reportes"), reportData);

      // Gamification Logic simulation (usually in Cloud Functions)
      if (profile?.uid) {
        const userRef = doc(db, "users", profile.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        
        let newPuntos = (userData?.puntos || 0) + 50;
        let newNivel = userData?.nivel || 1;
        
        if (newPuntos >= newNivel * 200) {
          newNivel += 1;
          toast({ title: "¡NUEVO NIVEL!", description: `Has alcanzado el nivel ${newNivel}`, className: "bg-accent text-white" });
        }

        await updateDoc(userRef, {
          puntos: newPuntos,
          nivel: newNivel,
          racha: increment(1) // Simplified streak logic
        });
      }

      toast({ title: "Reporte enviado", description: "Has ganado 50 pts Zyra." });
      setReportNotes("");
      setDraftedContent("");
      setHighlights([]);
      setSelectedFile(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo enviar el reporte." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Operaciones Diarias</h2>
          <p className="text-muted-foreground">Utiliza el asistente de IA para redactar reportes precisos y profesionales.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-1">
          <Card className="bg-card border-white/5 border-l-4 border-l-accent shadow-xl overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Asistente de Redacción IA
              </CardTitle>
              <CardDescription>Cuéntanos brevemente qué hiciste hoy y la IA lo estructurará por ti.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas rápidas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Instalé 5 paneles, revisión de inversor terminada, clima soleado..."
                    className="min-h-[120px] bg-white/5 border-white/10 focus:border-accent"
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
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-sm leading-relaxed whitespace-pre-wrap">
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
    </DashboardLayout>
  );
}
