// src/config/firebaseConfig.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Default Firebase config (placeholders, should be overridden by __firebase_config if available)
const defaultFirebaseConfig = {
  apiKey: "YOUR_API_KEY_FALLBACK",
  authDomain: "YOUR_AUTH_DOMAIN_FALLBACK",
  projectId: "YOUR_PROJECT_ID_FALLBACK",
  storageBucket: "YOUR_STORAGE_BUCKET_FALLBACK",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_FALLBACK",
  appId: "YOUR_APP_ID_FALLBACK"
};

// --- Global Variables provided by Canvas (DO NOT MODIFY THESE LINES in terms of access) ---
// These are expected to be in the global scope when run in the Canvas environment.
// The `declare global` in types/index.ts informs TypeScript about them.

export const appId: string = typeof __app_id !== 'undefined' ? __app_id : 'dnd-adventure-store-dev-ts-local';
const firebaseConfigStr: string = typeof __firebase_config !== 'undefined' ? __firebase_config : JSON.stringify(defaultFirebaseConfig);

let parsedFirebaseConfig;
try {
    parsedFirebaseConfig = JSON.parse(firebaseConfigStr);
} catch (e) {
    console.error("Failed to parse __firebase_config. Using default.", e);
    parsedFirebaseConfig = defaultFirebaseConfig;
}

// Initialize Firebase
const app: FirebaseApp = initializeApp(parsedFirebaseConfig);
const authInstance: Auth = getAuth(app);
const dbInstance: Firestore = getFirestore(app);

export { app, authInstance, dbInstance };
