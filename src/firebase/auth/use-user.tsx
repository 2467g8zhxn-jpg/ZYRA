
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>({
    nombre: "Operador Zyra (Demo)",
    rol: "employee",
    nivel: 5,
    puntos: 1250,
    racha: 7,
    logros: ["Pionero", "Reporte Maestro"]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // En modo demo mantenemos el perfil mock
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

  return { user, profile, loading };
}
