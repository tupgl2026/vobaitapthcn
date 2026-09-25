import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSy...", // Placeholder, will be replaced by user's config or env
  authDomain: "gen-lang-client-0867894042.firebaseapp.com",
  projectId: "gen-lang-client-0867894042",
  storageBucket: "gen-lang-client-0867894042.firebasestorage.app",
  messagingSenderId: "5959586605460",
  appId: "1:5959586605460:web:..."
};

// In AI Studio, the firebase-applet-config.json is the source of truth if available.
// For simplicity, we'll assume the environment provides the necessary config.
// The setup_firebase tool handles the provisioning.

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
