import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBn1THnJyYCYXcw8BHJVDrv4KzMm0eWL0o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dakabot-ac019.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dakabot-ac019",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dakabot-ac019.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "976934778636",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:976934778636:web:4ab63079a32fbee2d27b29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;