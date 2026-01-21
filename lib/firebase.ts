import { initializeApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Connect to Emulator in development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Client-side emulator connection
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  console.log("Connected to Firestore Emulator");
} else if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
   // Server-side (optional, depending on where this is called)
   connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

export { db };
