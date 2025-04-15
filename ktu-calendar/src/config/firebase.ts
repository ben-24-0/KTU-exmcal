import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCz0IV-3C8ki4PgdDtU4u2bpVmvDpH5szU",
  authDomain: "ktu-exmcal.firebaseapp.com",
  projectId: "ktu-exmcal",
  storageBucket: "ktu-exmcal.firebasestorage.app",
  messagingSenderId: "494665240342",
  appId: "1:494665240342:web:ede94f5a2cf0b82b39ca37",
  measurementId: "G-YZDDGLSTX5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Enable local persistence for Firestore (offline support)
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firebase persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('Firebase persistence not supported in this browser');
    }
  }); 