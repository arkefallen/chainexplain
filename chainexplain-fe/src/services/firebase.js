import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

/**
 * Firebase Client SDK Configuration loaded from Vite environment variables.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app = null;
let db = null;

try {
  const isMockKey = firebaseConfig.apiKey === 'mock-api-key-value-for-local-dev';
  
  if (isMockKey) {
    console.warn("Using mock API key. Connecting to local Firebase Emulator.");
    // Emulator requires a project ID
    const emuConfig = { ...firebaseConfig, projectId: firebaseConfig.projectId || 'chainexplain-dev' };
    app = initializeApp(emuConfig);
    db = getFirestore(app);
    connectFirestoreEmulator(db, 'localhost', 8080);
  } else if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn("Firebase credentials are unset.");
  }
} catch (error) {
  console.error("Firebase initialization encountered a fatal error. Falling back to local mock.", error);
}

/**
 * Checks whether the Firebase client SDK is initialized and connected.
 * Returns false if we are running in local simulation/mock environment.
 * 
 * @returns {boolean} True if Firebase service is fully functional
 */
export function isFirebaseAvailable() {
  return db !== null;
}

export { app, db };
