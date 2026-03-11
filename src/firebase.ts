import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDqZmwd4kevY9adJgoFxdjz3wuPZvivLM4",
  authDomain: "namma-kolar-mangoes.firebaseapp.com",
  projectId: "namma-kolar-mangoes",
  storageBucket: "namma-kolar-mangoes.firebasestorage.app",
  messagingSenderId: "502912484733",
  appId: "1:502912484733:web:4f8902048a0ae187faf814",
  measurementId: "G-V8NTMEBNTX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
