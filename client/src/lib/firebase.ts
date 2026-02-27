import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const cleanEnv = (value: unknown) => {
  const normalized = String(value ?? "")
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .trim();
  if (!normalized || normalized.toLowerCase() === "undefined" || normalized.toLowerCase() === "null") {
    return "";
  }
  return normalized;
};

const apiKey = cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY);
const authDomain = cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
const projectId = cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID);
const storageBucket = cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
const messagingSenderId = cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
const appId = cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID);

const isApiKeyFormatValid = /^AIza[0-9A-Za-z_-]{35}$/.test(apiKey);

const firebaseConfig = isApiKeyFormatValid
  ? {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    }
  : {
      apiKey: "AIzaSyA123456789012345678901234567890123",
      authDomain: "demo-project.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:1234567890abcdef123456",
    };

if (!isApiKeyFormatValid) {
  console.error(
    "Firebase is misconfigured: VITE_FIREBASE_API_KEY is missing/invalid. Add valid VITE_FIREBASE_* values in your .env.local and restart Vite."
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;