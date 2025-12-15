import { Country, Aircraft, StatDefinition } from "../types";
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

// Safe Environment Access
// We access import.meta.env directly to ensure Vite replaces it correctly during build.
// We also fallback to process.env if available (Node/Polyfilled)
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
console.log(`[Firebase Config] API Key Status: ${apiKey ? 'Present (' + apiKey.substring(0, 4) + '...)' : 'MISSING'}`);

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

if (!app) {
    console.error("Firebase App initialization failed. Attempting forced init.");
    app = initializeApp(firebaseConfig); 
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
    // Don't alert immediately on load, just log
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