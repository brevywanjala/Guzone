import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Validate that required config is present
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

// Debug logging (always show in development)
console.log("🔥 [Firebase Config] Initializing Firebase...");
console.log("🔥 [Firebase Config] Environment check:", {
  apiKey: firebaseConfig.apiKey ? `✅ ${firebaseConfig.apiKey.substring(0, 15)}...` : "❌ MISSING",
  authDomain: firebaseConfig.authDomain ? `✅ ${firebaseConfig.authDomain}` : "❌ MISSING",
  projectId: firebaseConfig.projectId ? `✅ ${firebaseConfig.projectId}` : "❌ MISSING",
  storageBucket: firebaseConfig.storageBucket ? "✅ Present" : "❌ MISSING",
  messagingSenderId: firebaseConfig.messagingSenderId ? "✅ Present" : "❌ MISSING",
  appId: firebaseConfig.appId ? "✅ Present" : "❌ MISSING",
});
console.log("🔥 [Firebase Config] Raw env vars:", {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? "Set" : "NOT SET",
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "Set" : "NOT SET",
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "Set" : "NOT SET",
});

if (missingFields.length > 0) {
  console.error(
    "Firebase configuration is missing the following required fields:",
    missingFields.join(", ")
  );
  console.error(
    "Please set the following environment variables:",
    requiredFields.map(f => `VITE_FIREBASE_${f.toUpperCase().replace(/([A-Z])/g, '_$1')}`).join(", ")
  );
  throw new Error(
    `Firebase configuration is incomplete. Missing: ${missingFields.join(", ")}. ` +
    "Please set VITE_FIREBASE_* environment variables."
  );
}

// Initialize Firebase only if not already initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

