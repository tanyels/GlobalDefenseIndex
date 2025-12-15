import { Country, Aircraft, StatDefinition } from "../types";
import { initializeApp, getApps, getApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged, type User as FirebaseUser, type Auth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, type Firestore } from "firebase/firestore";

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
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        // @ts-ignore
        return import.meta.env[key];
    }
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    return "";
};

const apiKey = getEnv("VITE_FIREBASE_API_KEY") || getEnv("VITE_API_KEY") || ((typeof process !== 'undefined' && process.env) ? process.env.API_KEY : "");
const projectId = getEnv("VITE_FIREBASE_PROJECT_ID") || "global-defense-index";

// Log configuration status (without leaking the full key)
console.log(`[Firebase Config] Project: ${projectId}`);
console.log(`[Firebase Config] API Key Status: ${apiKey ? 'Present' : 'MISSING'}`);

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN") || `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID")
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// STRICT INITIALIZATION
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

// --- DATABASE SERVICE ---
const DOC_PATH = "system/global_data"; 

export const initializeDatabase = async () => {
  try {
    const docRef = doc(db, DOC_PATH);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.log("Database connected but empty.");
    } else {
      console.log("Database connected successfully.");
    }
  } catch (error: any) {
    console.error("CRITICAL DATABASE ERROR:", error);
  }
};

export const subscribeToData = (callback: (data: GlobalData | null) => void) => {
  const unsubscribe = onSnapshot(doc(db, DOC_PATH), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as GlobalData);
    } else {
      console.log("Document does not exist yet. Returning null to app.");
      callback(null); // CRITICAL: Resolve loading state even if empty
    }
  }, (err) => {
    console.error("Firebase Sync Error:", err);
    callback(null); // CRITICAL: Resolve loading state on error
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