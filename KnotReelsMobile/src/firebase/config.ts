// src/firebase/config.ts
import { initializeApp } from 'firebase/app';

// ① Install this if you haven’t already:
//    npm install @react-native-async-storage/async-storage
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';
import { getStorage }   from 'firebase/storage';

import {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
} from '@env';

// 1) Just to verify your envs are loading at runtime:
console.log('🔥 Firebase Config:', {
  apiKey:            EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId:     EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
});

// 2) Assemble your config object
const firebaseConfig = {
  apiKey:            EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId:     EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 3) Initialize the Firebase app
const app = initializeApp(firebaseConfig);

// 4) Initialize Auth with React Native AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// 5) Export Firestore & Storage
export const db      = getFirestore(app);
export const storage = getStorage(app);
