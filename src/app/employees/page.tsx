"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "../dashboard/layout";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { firebaseConfig } from "@/firebase/config";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Users, Plus, Search, Mail, Phone, ShieldCheck, UserCircle, Star, Lock, Key, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function EmployeesPage() {
  const { profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const isAdmin = profile?.rol === 'admin';

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // States for showing generated credentials
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState({ email: "", password: "" });

  const [newEmployee, setNewEmployee] = useState({
    Emp_Nombre: "",
    Emp_CorreoPersonal: "",
    Emp_Telefono: "",
  });

  const employeesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const { data: employees, isLoading: employeesLoading } = useCollection(employeesQuery);

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter(e => 
      (e.Emp_Nombre || e.nombre)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.emailAcceso || e.email)?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const handleCreateEmployee = async () => {
    if (!db) return;
    setLoading(true);
    
    // 1. Generar credenciales automáticamente
    const baseId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const cleanName = newEmployee.Emp_Nombre.toLowerCase().split(' ')[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const generatedEmail = `${cleanName}.${baseId}@zyracommand.com`;
    const generatedPassword = Math.random().toString(36).slice(-8) + "!";

    let secondaryApp;
    try {
      secondaryApp = initializeApp(firebaseConfig, "secondary-registration");
      const secondaryAuth = getAuth(secondaryApp);
      
      // 2. Crear usuario en Auth con el correo generado por el sistema
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        generatedEmail, 
        generatedPassword
      );
      
      const uid = userCredential.user.uid;

      // 3. Crear perfil en Firestore
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, {
        uid: uid,
        nombre: newEmployee.Emp_Nombre,
        emailPersonal: newEmployee.Emp_CorreoPersonal,
        emailAcceso: generatedEmail, // Este es el correo con el que iniciará sesión
        email: generatedEmail, // Backwards compatibility with standard email field
        telefono: newEmployee.Emp_Telefono,
        rol: "employee",
        nivel: 1,
        puntos: 0,
        racha: 0,
        logros: [],
        createdAt: serverTimestamp(),
      });

      // Guardar credenciales para mostrar al administrador
      setGeneratedCreds({ email: generatedEmail, password: generatedPassword });
      setShowCredentials(true);
      
      toast({ 
        title: "Registro Exitoso", 
        description: `Se han generado las credenciales para ${newEmployee.Emp_Nombre}.` 
      });

      setNewEmployee({
        Emp_Nombre: "",
        Emp_CorreoPersonal: "",
        Emp_Telefono: "",
      });
    } catch (e: any) {
      console.error(e);
      toast({ 
        variant: "destructive", 
        title: "Error de registro", 
        description: e.message || "No se pudo crear la cuenta de acceso." 
      });
    } finally {
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Copiado al portapapeles" });
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <Users className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-white">Acceso Denegado</h2>
          <p className="text-muted-foreground max-w-md">
            Solo el personal administrativo tiene permisos para gestionar la nómina de empleados y sus credenciales de acceso.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 font-body">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <UserCircle className="h-8 w-8 text-accent" /> Empleados (EMP)
            </h2>
            <p className="text-muted-foreground">Gestión de capital humano y generación de accesos automáticos.</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setShowCredentials(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-white font-bold gap-2">
                <Plus className="h-4 w-4" /> Registrar Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 text-white sm:max-w-lg">
              {!showCredentials ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-accent">Nuevo Registro Operativo</DialogTitle>
                    <CardDescription>
                      Ingrese los datos básicos. El sistema generará automáticamente un correo y contraseña de acceso único.
                    </CardDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs uppercase font-bold text-muted-foreground">Nombre Completo</Label>
                      <Input 
                        id="name" 
                        placeholder="Ej: Juan Antonio Pérez" 
                        className="bg-white/5 border-white/10"
                        value={newEmployee.Emp_Nombre}
                        onChange={(e) => setNewEmployee({...newEmployee, Emp_Nombre: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">E-mail Personal</Label>
                        <Input 
                          type="email"
                          placeholder="personal@gmail.com" 
                          className="bg-white/5 border-white/10"
                          value={newEmployee.Emp_CorreoPersonal}
                          onChange={(e) => setNewEmployee({...newEmployee, Emp_CorreoPersonal: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Teléfono</Label>
                        <Input 
                          placeholder="+56 9..." 
                          className="bg-white/5 border-white/10"
                          value={newEmployee.Emp_Telefono}
                          onChange={(e) => setNewEmployee({...newEmployee, Emp_Telefono: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <p className="text-xs text-accent leading-relaxed flex items-start gap-2">
                        <Key className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Al guardar, se generará un correo <b>@zyracommand.com</b> y una clave segura para este empleado.</span>
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      className="bg-accent hover:bg-accent/90 text-white w-full h-12 text-lg font-bold"
                      disabled={!newEmployee.Emp_Nombre || !newEmployee.Emp_CorreoPersonal || loading}
                      onClick={handleCreateEmployee}
                    >
                      {loading ? "Generando Acceso..." : "Guardar Empleado y Generar Acceso"}
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-emerald-500 flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6" /> Registro Completado
                    </DialogTitle>
                    <CardDescription>
                      Las siguientes credenciales han sido generadas. Por favor, entréguelas al empleado para su primer inicio de sesión.
                    </CardDescription>
                  </DialogHeader>
                  <div className="py-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">E-mail de Acceso ZYRA</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={generatedCreds.email} 
                          className="bg-white/5 border-white/10 font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="border-white/10 hover:bg-accent/10"
                          onClick={() => copyToClipboard(generatedCreds.email)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Contraseña Provisional</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={generatedCreds.password} 
                          className="bg-white/5 border-white/10 font-mono text-sm text-accent"
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="border-white/10 hover:bg-accent/10"
                          onClick={() => copyToClipboard(generatedCreds.password)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-md">
                      <p className="text-[10px] text-yellow-500 uppercase font-bold tracking-tighter flex items-center gap-2">
                        <Lock className="h-3 w-3" /> Importante: Por seguridad, esta contraseña no se volverá a mostrar.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      className="bg-white text-black hover:bg-white/90 w-full font-bold"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setShowCredentials(false);
                      }}
                    >
                      Entendido, Cerrar
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card border-white/5 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg font-bold">Nómina Activa</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nombre o acceso..." 
                  className="pl-10 bg-white/5 border-white/5 text-xs h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {employeesLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground uppercase text-[10px] font-bold">Empleado</TableHead>
                    <TableHead className="text-muted-foreground uppercase text-[10px] font-bold">Acceso Sistema</TableHead>
                    <TableHead className="text-muted-foreground uppercase text-[10px] font-bold">Rol</TableHead>
                    <TableHead className="text-muted-foreground uppercase text-[10px] font-bold">Nivel / Puntos</TableHead>
                    <TableHead className="text-right text-muted-foreground uppercase text-[10px] font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow key={emp.id} className="border-white/5 hover:bg-white/2 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                            <span className="text-xs font-bold text-accent">{(emp.Emp_Nombre || emp.nombre || "?").substring(0,2).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{emp.Emp_Nombre || emp.nombre}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">ID: {emp.id.substring(0,8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-white">
                            <Mail className="h-3 w-3 text-accent" /> {emp.emailAcceso || emp.email || "N/A"}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 text-muted-foreground opacity-50" /> <span className="italic">{emp.emailPersonal || "Sin correo personal"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={emp.rol === 'admin' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-primary/10 text-primary border-primary/20"}>
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          {emp.rol === 'admin' ? "ADMIN" : "OPERATIVO"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-accent" />
                            <span className="text-xs font-bold text-white">Nivel {emp.nivel || 1}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-muted-foreground">{emp.puntos || 0} pts</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-accent hover:bg-accent/10 font-bold text-[10px]">
                          VER PERFIL
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Sin registros de empleados</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                  Comience registrando un empleado operativo para asignarle equipos y proyectos en el sistema.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
