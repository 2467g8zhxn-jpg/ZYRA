
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  
  // Perfil inicial con soporte para alternar roles en modo demo
  const [profile, setProfile] = useState<any | null>(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('zyra-demo-role');
      if (savedRole === 'admin') {
        return {
          nombre: "Administrador Zyra",
          rol: "admin",
          puntos: 5000,
          nivel: 25,
          racha: 45
        };
      }
    }
    return {
      nombre: "Operador Zyra",
      rol: "employee",
      nivel: 5,
      puntos: 1250,
      racha: 7,
      logros: [
        { id: "1", nombre: "Pionero", completado: true },
        { id: "2", nombre: "Reporte Maestro", completado: true },
        { id: "3", nombre: "Racha 30 Días", completado: false },
        { id: "4", nombre: "Experto en Inversores", completado: false },
      ]
    };
  });

  const toggleRole = () => {
    const newRole = profile?.rol === 'admin' ? 'employee' : 'admin';
    localStorage.setItem('zyra-demo-role', newRole);
    window.location.reload(); // Recarga simple para aplicar cambios de rol en demo
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (user && db) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
        setLoading(false);
      }, () => {
        setLoading(false);
      });
      return () => unsubscribeDoc();
    }
  }, [user, db]);

  return { user, profile, loading, toggleRole };
}
