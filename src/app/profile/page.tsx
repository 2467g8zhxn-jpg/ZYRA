
"use client";

import { useState, useRef } from "react";
import DashboardLayout from "../dashboard/layout";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Mail, User, Hash, Shield, Zap, Trophy, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function ProfilePage() {
  const { profile, user, loading: userLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!db || !user) return;
    
    setIsUpdating(true);
    const userRef = doc(db, "users", user.uid);
    const updateData: any = {};
    
    if (newPhoto) {
      updateData.photoURL = newPhoto;
    }

    try {
      await updateDoc(userRef, updateData);
      toast({ title: "Perfil actualizado", description: "Los cambios se han guardado correctamente." });
      setNewPhoto(null);
    } catch (error: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: updateData,
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  if (userLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const nameInitial = profile?.nombre?.substring(0, 1).toUpperCase() || "Z";

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 font-body">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <User className="h-8 w-8 text-accent" /> Mi Perfil
          </h2>
          <p className="text-muted-foreground">Gestiona tu identidad digital y revisa tu estado en ZYRA.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Foto y Avatar */}
          <Card className="md:col-span-1 bg-card border-white/10 overflow-hidden flex flex-col items-center p-8">
            <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
              <Avatar className="h-32 w-32 border-4 border-accent/20 transition-transform group-hover:scale-105">
                <AvatarImage src={newPhoto || profile?.photoURL} alt={profile?.nombre} className="object-cover" />
                <AvatarFallback className="bg-accent text-white text-4xl font-black">{nameInitial}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-xl font-bold text-white">{profile?.nombre}</h3>
              <p className="text-xs text-accent font-black uppercase tracking-widest mt-1">
                {profile?.rol === 'admin' ? "Administrador" : "Técnico Operativo"}
              </p>
            </div>
            
            <div className="mt-8 w-full space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  <span className="text-xs font-bold text-white">Nivel</span>
                </div>
                <span className="text-sm font-black text-accent">{profile?.nivel || 1}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-bold text-white">Puntos</span>
                </div>
                <span className="text-sm font-black text-yellow-500">{profile?.puntos || 0}</span>
              </div>
            </div>
          </Card>

          {/* Información y Formulario */}
          <Card className="md:col-span-2 bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Datos del Empleado</CardTitle>
              <CardDescription>Información registrada en el sistema central de ZYRA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                    <User className="h-3 w-3" /> Nombre Completo
                  </Label>
                  <Input 
                    value={profile?.nombre || ""} 
                    readOnly 
                    className="bg-white/5 border-white/5 text-sm cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                    <Hash className="h-3 w-3" /> ID Empleado
                  </Label>
                  <Input 
                    value={user?.uid?.substring(0, 12).toUpperCase() || "ZY-XXXX-XXXX"} 
                    readOnly 
                    className="bg-white/5 border-white/5 font-mono text-sm cursor-not-allowed text-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                    <Mail className="h-3 w-3" /> Correo Electrónico
                  </Label>
                  <Input 
                    value={profile?.emailAcceso || profile?.email || "N/A"} 
                    readOnly 
                    className="bg-white/5 border-white/5 text-sm cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                    <Shield className="h-3 w-3" /> Rol en Sistema
                  </Label>
                  <div className="h-10 px-3 flex items-center bg-white/5 border border-white/5 rounded-md text-sm text-white font-bold uppercase">
                    {profile?.rol === 'admin' ? "Acceso Total Command" : "Acceso Operativo"}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 mt-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-accent font-bold">Nota:</span> Los datos de identificación y acceso son gestionados únicamente por el departamento administrativo. Si necesita actualizar su nombre o correo, contacte a su supervisor.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/5 pt-6 bg-white/2">
              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-12 gap-2"
                onClick={handleSaveProfile}
                disabled={!newPhoto || isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isUpdating ? "Guardando..." : "Guardar Cambios en Perfil"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
