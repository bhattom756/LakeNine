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

// Configure auth to use the correct auth domain
if (typeof window !== 'undefined') {
  // Always use the configured auth domain from Firebase
  auth.config.authDomain = firebaseConfig.authDomain;
  
  // Set proper persistence
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

// Sign in with Google
const signInWithGoogle = async () => {
  try {
    // Configure provider with standard parameters
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Use popup authentication which works consistently
    const result = await signInWithPopup(auth, googleProvider);
    
    // Store email for future hints if available
    if (result.user.email) {
      localStorage.setItem('lastEmail', result.user.email);
    }
    
    // Return result with isNewUser flag
    const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
    return { user: result.user, isNewUser };
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

// Handle redirect results - should be called on page load
const handleRedirectResult = async () => {
  if (typeof window === 'undefined') return null;
  
  try {
    console.log("Checking for Google redirect result...");
    console.log("Current URL:", window.location.href);
    console.log("Auth domain being used:", auth.config.authDomain);
    console.log("Provider ID:", googleProvider.providerId);
    
    // First check if we already have a user
    if (auth.currentUser) {
      console.log("User already signed in:", auth.currentUser.email);
      // Store email for future hints
      if (auth.currentUser.email) {
        localStorage.setItem('lastEmail', auth.currentUser.email);
      }
      const isNewUser = auth.currentUser.metadata.creationTime === auth.currentUser.metadata.lastSignInTime;
      return { user: auth.currentUser, isNewUser };
    }

    // Try to get redirect result
    console.log("No current user, checking redirect result...");
    
    try {
      const result = await getRedirectResult(auth);
      
      if (result && result.user) {
        console.log("Successfully got Google redirect result:", result.user.email);
        
        // Store email for future hints
        if (result.user.email) {
          localStorage.setItem('lastEmail', result.user.email);
        }
        
        // Determine if this was a sign-up or sign-in based on user metadata
        const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
        
        return { user: result.user, isNewUser };
      } else {
        console.log("No redirect result found");
      }
    } catch (redirectError: any) {
      console.error("Error processing redirect result:", redirectError);
      // Check if we have a pendingToken error, which can happen with third-party auth
      if (redirectError.code === 'auth/credential-already-in-use') {
        console.log("Credential already in use, attempting to recover...");
        try {
          // Try to recover by signing in with the existing credential
          if (redirectError.credential) {
            const recoveryResult = await signInWithCredential(auth, redirectError.credential);
            console.log("Recovery successful:", recoveryResult.user.email);
            return { user: recoveryResult.user, isNewUser: false };
          }
        } catch (recoveryError) {
          console.error("Recovery failed:", recoveryError);
        }
      }
      throw redirectError;
    }
    
    return null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};

// Sign up with Google - for signup page
const signUpWithGoogle = async () => {
  // Use the same logic as signInWithGoogle
  return signInWithGoogle();
};

// Send magic link to email (for email link auth)
const sendLoginLink = async (email: string) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Email link authentication requires browser environment');
    }
    
    console.log("Preparing to send email login link to:", email);
    
    // Store the email in localStorage for later use with signInWithEmailLink
    localStorage.setItem('emailForSignIn', email);
    
    // Create action code settings with the correct redirect URL
    const actionCodeSettings = {
      // URL needs to be absolute
      url: `${window.location.origin}/login`,
      handleCodeInApp: true,
    };
    
    console.log("Sending login link with settings:", actionCodeSettings);
    
    // Send the link
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    console.log("Email login link sent successfully");
    
    return true;
  } catch (error: any) {
    console.error("Error sending login link:", error);
    
    // Add detailed logging for debugging
    if (error.code) {
      console.error("Error code:", error.code);
    }
    
    throw error;
  }
};

// Check if current URL is sign-in with email link
const checkIfEmailLink = (url: string = '') => {
  if (typeof window === 'undefined') return false;
  
  const linkToCheck = url || window.location.href;
  console.log("Checking if URL is email sign-in link:", linkToCheck);
  
  const result = isSignInWithEmailLink(auth, linkToCheck);
  console.log("Is email sign-in link:", result);
  
  return result;
};

// Complete sign-in with email link
const loginWithEmailLink = async (email: string = '', link: string = '') => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Email link authentication requires browser environment');
    }

    // Get the email from storage if not provided
    const emailToUse = email || localStorage.getItem('emailForSignIn');
    if (!emailToUse) {
      throw new Error('No email found for sign-in. Please provide your email again.');
    }
    
    // Get the link from the current URL if not provided
    const linkToUse = link || window.location.href;
    
    console.log("Attempting to sign in with email link:", {
      email: emailToUse,
      linkProvided: !!link
    });
    
    // Sign in with the link
    const result = await signInWithEmailLink(auth, emailToUse, linkToUse);
    
    // Clear the stored email
    localStorage.removeItem('emailForSignIn');
    
    console.log("Email link sign-in successful:", result.user.email);
    
    return result;
  } catch (error: any) {
    console.error("Error signing in with email link:", error);
    throw error;
  }
};

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

// Verify Firebase authentication configuration
const verifyAuthConfig = async () => {
  if (typeof window === 'undefined') return;
  
  console.log("Verifying Firebase auth configuration...");
  console.log("Current origin:", window.location.origin);
  
  // Check if auth domain matches current origin
  const authDomainMatches = firebaseConfig.authDomain.includes(window.location.hostname);
  console.log(`Auth domain ${firebaseConfig.authDomain} matches current hostname: ${authDomainMatches}`);
  
  // Check if there are any pending redirects - with safe error handling
  try {
    // Use a standard Firebase call instead of accessing internals
    console.log("Checking for pending redirects...");
    await getRedirectResult(auth)
      .then(result => {
        console.log("Pending redirect check:", result ? "Yes" : "No");
      })
      .catch(e => {
        console.error("Error checking for pending redirects:", e);
      });
  } catch (e) {
    console.error("Error in redirect check:", e);
  }
  
  // Print public config info only
  console.log("Firebase Config:", {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId
  });
  
  // Print auth state safely
  console.log("Auth State:", {
    currentUser: auth.currentUser ? {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      emailVerified: auth.currentUser.emailVerified,
      isAnonymous: auth.currentUser.isAnonymous
    } : null
  });
};

// Sign in with Google using Popup (alternative to redirect for troubleshooting)
const signInWithGooglePopup = async () => {
  try {
    console.log("Starting Google sign-in with popup");
    
    // Configure provider
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      login_hint: localStorage.getItem('lastEmail') || '',
    });
    
    // Use popup method
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google popup sign-in successful:", result.user.email);
    
    // Store email for future hints
    if (result.user.email) {
      localStorage.setItem('lastEmail', result.user.email);
    }
    
    return result;
  } catch (error: any) {
    console.error("Google popup sign-in error:", error);
    throw error;
  }
};

// Export all functions and objects
export {
  auth,
  app,
  googleProvider,
  registerWithEmail,
  loginWithEmail,
  signInWithGoogle,
  signInWithGooglePopup,
  signUpWithGoogle,
  handleRedirectResult,
  sendLoginLink,
  checkIfEmailLink,
  loginWithEmailLink,
  onUserChange,
  logout,
  resetPassword,
  verifyAuthConfig,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
};

export type { User };

