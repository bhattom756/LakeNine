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
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  User,
  setPersistence,
  browserSessionPersistence,
  signInWithCredential
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase config from your dashboard
const firebaseConfig = {
  apiKey: "AIzaSyCwVJoP6EDM3QvEpcHwcxVaPWV9Mki3ppQ",
  authDomain: "lakenine-57b55.firebaseapp.com",
  projectId: "lakenine-57b55",
  storageBucket: "lakenine-57b55.appspot.com",
  messagingSenderId: "472067900901",
  appId: "1:472067900901:web:cdc0e243eedd3d0125db0c",
  measurementId: "G-54T0SRC7J0",
};

// Initialize Firebase only once (for hot reload/dev)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Set session persistence (user will be logged out when browser/tab is closed)
if (typeof window !== "undefined") {
  setPersistence(auth, browserSessionPersistence)
    .catch((error) => {
      console.error("Error setting auth persistence:", error);
    });
}

// Initialize analytics (only in browser)
isSupported().then((yes) => {
  if (yes && typeof window !== "undefined") {
    getAnalytics(app);
  }
});

// Auth Providers
const googleProvider = new GoogleAuthProvider();
// Add scopes for better user data access
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
// Set custom parameters for redirect-based auth
googleProvider.setCustomParameters({
  prompt: 'select_account',
  ux_mode: 'redirect'  // Always use redirect
});

// --- Helper Functions ---

// Sign up with email and password
const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

// Log in with email and password
const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// Sign in with Google - for login page (redirect only)
const signInWithGoogle = async () => {
  try {
    console.log("Starting Google sign-in process (redirect)");
    // Always use redirect method
    await signInWithRedirect(auth, googleProvider);
    return null; // Page will reload
  } catch (error: any) {
    console.error("Google sign-in redirect error:", error);
    throw error;
  }
};

// Handle redirect results - should be called on page load
const handleRedirectResult = async () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("Got Google redirect result:", result);
      // Determine if this was a sign-up or sign-in based on user metadata
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      return { user: result.user, isNewUser };
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};

// Sign up with Google - for signup page (redirect only)
const signUpWithGoogle = async () => {
  // Use the same redirect method for both login and signup
  // The difference will be detected in handleRedirectResult
  return signInWithGoogle();
};

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

// Send password reset email
const resetPassword = async (email: string) => {
  // Ensure Firebase is properly initialized
  if (!auth) {
    console.error("Firebase auth is not initialized");
    throw new Error("Authentication service is not available");
  }

  try {
    // Configure the action URL for password reset
    const actionCodeSettings = {
      // Redirect to login page after password reset
      url: typeof window !== 'undefined' ? 
        `${window.location.protocol}//${window.location.host}/login` : 
        'https://lakenine.vercel.app/login', // Fallback URL
      handleCodeInApp: false
    };
    
    console.log("Sending password reset to:", email);
    console.log("With redirect URL:", actionCodeSettings.url);
    
    // Make the auth call with proper settings
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    console.log("Password reset email sent successfully");
    return true;
  } catch (error: any) {
    console.error("Firebase password reset error:", error);
    
    // Enhance error details for better debugging
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    
    // Rethrow for the UI to handle
    throw error;
  }
};

export {
    auth,
    googleProvider,
    signInWithGoogle,
    signUpWithGoogle,
    handleRedirectResult,
    registerWithEmail,
    loginWithEmail,
    sendLoginLink,
    loginWithEmailLink,
    checkIfEmailLink,
    onUserChange,
    resetPassword,
    logout, onAuthStateChanged, signOut, signInWithEmailAndPassword
};    export type { User };

