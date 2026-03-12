import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDqZmwd4kevY9adJgoFxdjz3wuPZvivLM4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "namma-kolar-mangoes.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "namma-kolar-mangoes",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "namma-kolar-mangoes.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "502912484733",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:502912484733:web:4f8902048a0ae187faf814",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V8NTMEBNTX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
