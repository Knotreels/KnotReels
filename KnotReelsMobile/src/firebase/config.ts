// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth }        from 'firebase/auth';
import { getFirestore }   from 'firebase/firestore';
import { getStorage }     from 'firebase/storage';

import {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
} from '@env';

// 1) Log the raw values to verify they loaded
console.log('🔥 Firebase Config:', {
  apiKey:           EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:       EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:        EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:            EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId:    EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
});

// 2) Now assemble them
const firebaseConfig = {
  apiKey:            EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId:     EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 3) Initialize the app
const app = initializeApp(firebaseConfig);

// 4) Export the services
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
