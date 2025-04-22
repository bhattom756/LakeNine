import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  User
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase config from your dashboard
const firebaseConfig = {
  apiKey: "AIzaSyCwVJoP6EDM3QvEpcHwcxVaPWV9Mki3ppQ",
  authDomain: "lakenine-57b55.firebaseapp.com",
  projectId: "lakenine-57b55",
  storageBucket: "lakenine-57b55.firebasestorage.app",
  messagingSenderId: "472067900901",
  appId: "1:472067900901:web:cdc0e243eedd3d0125db0c",
  measurementId: "G-54T0SRC7J0",
};

// Initialize Firebase only once (for hot reload/dev)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize analytics (only in browser)
isSupported().then((yes) => {
  if (yes && typeof window !== "undefined") {
    getAnalytics(app);
  }
});

// Auth Providers
const googleProvider = new GoogleAuthProvider();

// --- Helper Functions ---

// Sign up with email and password
const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

// Log in with email and password
const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// Sign in with Google popup
const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// Send magic link to email (for email link auth)
const sendLoginLink = (email: string) =>
  sendSignInLinkToEmail(auth, email, {
    url: window.location.origin + "/login",
    handleCodeInApp: true,
  });

// Check if current URL is sign-in with email link
const checkIfEmailLink = (url: string) => isSignInWithEmailLink(auth, url);

// Complete sign-in with email link
const loginWithEmailLink = (email: string, link: string) =>
  signInWithEmailLink(auth, email, link);

// Get auth state
const onUserChange = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);

// Sign out
const logout = () => signOut(auth);

export {
    auth,
    googleProvider,
    signInWithGoogle,
    registerWithEmail,
    loginWithEmail,
    sendLoginLink,
    loginWithEmailLink,
    checkIfEmailLink,
    onUserChange,
    logout, onAuthStateChanged, signOut, signInWithEmailAndPassword
};    export type { User };

