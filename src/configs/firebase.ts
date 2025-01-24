// Import the functions you need from the SDKs you need
import type { User } from 'firebase/auth';

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  connectAuthEmulator,
  confirmPasswordReset,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import type { ApiRoute } from '../constants/fxns';

const USE_EMULATORS = false;

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

console.log(firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const appAuth = getAuth();

const auth = {
  createUser(email: string, password: string) {
    return createUserWithEmailAndPassword(appAuth, email, password);
  },
  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(appAuth, email, password);
  },
  resetPassword(email: string) {
    return sendPasswordResetEmail(appAuth, email);
  },
  confirmPassReset(code: string, newPass: string) {
    return confirmPasswordReset(appAuth, code, newPass);
  },
  logout() {
    return signOut(appAuth);
  },
  listen(cb: (val: User | null) => void) {
    onAuthStateChanged(appAuth, cb);
  },
};

const db = getFirestore(app);
const fxns = getFunctions(app);

const fx = {
  async call<T, B = any>(path: ApiRoute, data?: T) {
    const callable = httpsCallable<T, B>(fxns, path);
    const result = await callable(data ?? null);
    return result.data;
  },
};

const runEmulators = (val: boolean = USE_EMULATORS) => {
  const local = '127.0.0.1';
  if (val) {
    connectFirestoreEmulator(db, local, 8080);
    connectAuthEmulator(appAuth, `http://${local}:9099`);
    connectFunctionsEmulator(fxns, local, 5001);
  }
};

runEmulators();

export { db, fx, app, auth };
