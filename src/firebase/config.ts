import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDm2bzhaFDYzL9p8dVaRtaYOBz-PWHzmsw",
  authDomain: "knotreels-7e724.firebaseapp.com",
  projectId: "knotreels-7e724",
  storageBucket: "knotreels-7e724.firebasestorage.app", // ✅ FIXED
  messagingSenderId: "256684418810",
  appId: "1:256684418810:web:6f205c92148349caea4b43",
  measurementId: "G-F8GM0KB6KM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);