import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const apiKey = String(import.meta.env.VITE_FIREBASE_API_KEY || "").trim();
const authDomain = String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "").trim();
const projectId = String(import.meta.env.VITE_FIREBASE_PROJECT_ID || "").trim();
const storageBucket = String(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "").trim();
const messagingSenderId = String(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "").trim();
const appId = String(import.meta.env.VITE_FIREBASE_APP_ID || "").trim();

if (!apiKey) {
  console.error(
    "VITE_FIREBASE_API_KEY is missing. .env.local may not be loaded by Vite. import.meta.env:",
    import.meta.env
  );
} else if (apiKey.length < 20) {
  console.warn("VITE_FIREBASE_API_KEY looks unusually short; verify it in Firebase console.");
}

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;