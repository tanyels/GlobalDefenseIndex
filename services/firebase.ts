import { Country, Aircraft, StatDefinition } from "../types";
import * as firebaseApp from "firebase/app";
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
const env = (import.meta as any).env || {};

// PRIORITIZE VITE_ VARIABLES
const apiKey = env.VITE_FIREBASE_API_KEY || env.VITE_API_KEY || process.env.API_KEY;
const projectId = env.VITE_FIREBASE_PROJECT_ID || "global-defense-index";

// Log configuration status (without leaking the full key)
console.log(`[Firebase Config] Project: ${projectId}`);
console.log(`[Firebase Config] API Key Status: ${apiKey ? 'Present (' + apiKey.substring(0, 4) + '...)' : 'MISSING'}`);

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

let app: firebaseApp.FirebaseApp;
let auth: Auth;
let db: Firestore;

// STRICT INITIALIZATION
// We do NOT wrap this in try/catch because we want it to fail hard if credentials are bad
// so you can see the error immediately.
if (firebaseApp.getApps && !firebaseApp.getApps().length) {
    app = firebaseApp.initializeApp(firebaseConfig);
} else {
    // Accessing getApp safely or falling back to first app if getApps returned something
    app = firebaseApp.getApp ? firebaseApp.getApp() : (firebaseApp.getApps ? firebaseApp.getApps()[0] : undefined as any);
}

if (!app) {
    // Fallback if something is extremely weird with the environment
    console.error("Firebase App initialization failed. Check your firebase package version.");
    // Try to force init if possible, or app will crash on next lines
    app = firebaseApp.initializeApp(firebaseConfig); 
}

auth = getAuth(app);
db = getFirestore(app);

// --- DATABASE SERVICE ---
const DOC_PATH = "system/global_data"; 

export const initializeDatabase = async () => {
  // Check if we can read the DB. This serves as a connection test.
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
        console.error("Check Firestore Rules in Firebase Console. (Set to Test Mode for development)");
    } else if (error.code === 'unavailable') {
        console.error("Client is offline or project does not exist.");
    }
  }
};

export const subscribeToData = (callback: (data: GlobalData) => void) => {
  // STRICT MODE: No mock data fallback.
  // If the DB connection fails, the app will simply show no data, forcing you to fix the key.
  
  const unsubscribe = onSnapshot(doc(db, DOC_PATH), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as GlobalData);
    } else {
      console.log("Document does not exist yet.");
    }
  }, (err) => {
    console.error("Firebase Sync Error:", err);
    alert(`Database Connection Failed: ${err.message}. Check console for details.`);
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
      // Pass the raw error up so the UI can display it
      throw error;
  }
};

export const logoutAdmin = async () => {
  await fbSignOut(auth);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};