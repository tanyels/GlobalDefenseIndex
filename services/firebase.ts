import { Country, Aircraft, StatDefinition } from "../types";
// @ts-ignore
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged, User as FirebaseUser, Auth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, Firestore } from "firebase/firestore";

// --- TYPES ---
export type User = FirebaseUser;

export interface GlobalData {
  countries: Country[];
  statDefinitions: StatDefinition[];
  categories: string[];
  aircrafts: Aircraft[];
  aircraftStats: StatDefinition[];
  aircraftCats: string[];
}

// --- CONFIGURATION ---

const getEnv = (key: string) => {
    // Vite / Modern browsers
    if ((import.meta as any).env && (import.meta as any).env[key]) {
        return (import.meta as any).env[key];
    }
    // Node / Polyfill
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    return "";
};

const apiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY || (import.meta as any).env?.VITE_API_KEY || ((typeof process !== 'undefined' && process.env) ? process.env.API_KEY : "");
const projectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "global-defense-index";

// Log configuration status (without leaking the full key)
console.log(`[Firebase Config] Project: ${projectId}`);
console.log(`[Firebase Config] API Key Status: ${apiKey ? 'Present' : 'MISSING'}`);

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// STRICT INITIALIZATION
try {
  if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
  } else {
      app = getApp();
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e: any) {
  console.error("FIREBASE INIT FAILED:", e);
  // Re-throw to ensure we see the error
  throw new Error(`Firebase Initialization failed: ${e.message}. Check your API Keys.`);
}

// --- DATABASE SERVICE ---
const DOC_PATH = "system/global_data"; 

export const initializeDatabase = async () => {
  try {
    const docRef = doc(db, DOC_PATH);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.log("Database connected but empty. Waiting for admin to seed data...");
    } else {
      console.log("Database connected successfully.");
    }
  } catch (error: any) {
    console.error("CRITICAL DATABASE ERROR:", error);
    if (error.code === 'permission-denied') {
        console.error("Check Firestore Rules in Firebase Console.");
    } else if (error.code === 'unavailable') {
        console.error("Client is offline or project does not exist.");
    }
  }
};

export const subscribeToData = (callback: (data: GlobalData) => void) => {
  const unsubscribe = onSnapshot(doc(db, DOC_PATH), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as GlobalData);
    } else {
      console.log("Document does not exist yet.");
    }
  }, (err) => {
    console.error("Firebase Sync Error:", err);
  });

  return unsubscribe;
};

export const saveDatabase = async (partialData: Partial<GlobalData>) => {
  try {
    const docRef = doc(db, DOC_PATH);
    await setDoc(docRef, partialData, { merge: true });
  } catch (error: any) {
    console.error("Save failed:", error);
    alert(`Save Failed: ${error.message}`);
    throw error;
  }
};

// --- AUTH SERVICE ---

export const loginAdmin = async (email: string, pass: string) => {
  try {
      await signInWithEmailAndPassword(auth, email, pass);
  } catch (error: any) {
      console.error("Firebase Login Error:", error.code, error.message);
      throw error;
  }
};

export const logoutAdmin = async () => {
  await fbSignOut(auth);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};