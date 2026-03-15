
'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export function initializeFirebase(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
} {
  try {
    // Solo inicializamos si tenemos una API Key válida (no el placeholder de demo)
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo-key') {
      console.warn("Firebase operando en modo desconectado (sin API Key válida).");
      return { app: null, auth: null, db: null };
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const auth = getAuth(app);
    const db = getFirestore(app);

    return { app, auth, db };
  } catch (error) {
    console.error("Error inicializando Firebase:", error);
    return { app: null, auth: null, db: null };
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
