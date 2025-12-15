import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { Country, Aircraft, StatDefinition } from "../types";
import { MOCK_COUNTRIES, INITIAL_STAT_DEFINITIONS, INITIAL_CATEGORIES, MOCK_AIRCRAFT, INITIAL_AIRCRAFT_STAT_DEFINITIONS, INITIAL_AIRCRAFT_CATEGORIES } from "../constants";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCuQRbwaNTvG34UCZDececaiIWIUkMi_F8",
  authDomain: "globaldefenseindex-6f6d3.firebaseapp.com",
  projectId: "globaldefenseindex-6f6d3",
  storageBucket: "globaldefenseindex-6f6d3.firebasestorage.app",
  messagingSenderId: "183902171840",
  appId: "1:183902171840:web:fcc4a2a3faf4a497eeb325"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);

// --- DATABASE SERVICE ---

// We store everything in a single collection "gdi_data" with specific documents for structure.
// Document 'global': { countries: [], aircrafts: [], ... }
// This is simple for a small app. For a huge app, we'd use subcollections.

export interface GlobalData {
  countries: Country[];
  statDefinitions: StatDefinition[];
  categories: string[];
  aircrafts: Aircraft[];
  aircraftStats: StatDefinition[];
  aircraftCats: string[];
}

const DATA_DOC_ID = "main_database";

// Initialize DB if empty
export const initializeDatabase = async () => {
  try {
    const docRef = doc(db, "gdi_data", DATA_DOC_ID);
    const snap = await getDoc(docRef);
    
    if (!snap.exists()) {
      console.log("Initializing Database with default data...");
      await setDoc(docRef, {
        countries: MOCK_COUNTRIES,
        statDefinitions: INITIAL_STAT_DEFINITIONS,
        categories: INITIAL_CATEGORIES,
        aircrafts: MOCK_AIRCRAFT,
        aircraftStats: INITIAL_AIRCRAFT_STAT_DEFINITIONS,
        aircraftCats: INITIAL_AIRCRAFT_CATEGORIES
      });
    }
  } catch (e) {
    console.error("Error initializing database:", e);
  }
};

// Subscribe to real-time updates
export const subscribeToData = (callback: (data: GlobalData) => void) => {
  return onSnapshot(doc(db, "gdi_data", DATA_DOC_ID), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as GlobalData);
    }
  });
};

// Save function for Admin
export const saveDatabase = async (data: Partial<GlobalData>) => {
  // We merge the new data with existing data
  await setDoc(doc(db, "gdi_data", DATA_DOC_ID), data, { merge: true });
};

// --- AUTH SERVICE ---

export const loginAdmin = async (email: string, pass: string) => {
  await signInWithEmailAndPassword(auth, email, pass);
};

export const registerAdmin = async (email: string, pass: string) => {
  await createUserWithEmailAndPassword(auth, email, pass);
};

export const logoutAdmin = async () => {
  await signOut(auth);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};