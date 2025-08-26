import { useState, useEffect, useCallback } from 'react';
import { 
  auth, 
  signInWithGoogle, 
  signInWithGooglePopup, 
  sendLoginLink,
  loginWithEmailLink,
  loginWithEmail,
  signOut,
  handleRedirectResult
} from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [authInProgress, setAuthInProgress] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const checkRedirectResult = async () => {
      if (!loading && !user && !authInProgress) {
        try {
          console.log("[useAuth] Checking for redirect results");
          setAuthInProgress(true);
          
          try {
            const result = await handleRedirectResult();
            
            if (result?.user) {
              console.log("[useAuth] Successfully processed redirect result for:", result.user.email);
            } else {
              console.log("[useAuth] No redirect result found");
            }
          } finally {
            setAuthInProgress(false);
          }
        } catch (err: any) {
          console.error("[useAuth] Error handling redirect result:", err);
          setAuthMessage(err.message || "Authentication error");
          setAuthInProgress(false);
        }
      }
    };
    
    checkRedirectResult();
  }, [loading, user, authInProgress]);
  
  // Log auth state changes
  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log("[useAuth] Authenticated:", user.email);
        localStorage.setItem('lastAuthMethod', 'success');
      } else {
        console.log("[useAuth] Not authenticated");
      }
    }
  }, [user, loading]);
  
  // Login with email and password
  const login = useCallback(async (email: string, password: string) => {
    setAuthInProgress(true);
    setAuthMessage(null);
    
    try {
      await loginWithEmail(email, password);
      return true;
    } catch (err: any) {
      console.error("[useAuth] Email login error:", err);
      setAuthMessage(err.message || "Login failed");
      return false;
    } finally {
      setAuthInProgress(false);
    }
  }, []);
  
  // Login with Google (redirect)
  const loginWithGoogleRedirect = useCallback(async () => {
    setAuthInProgress(true);
    setAuthMessage(null);
    
    try {
      localStorage.setItem('lastAuthMethod', 'google-redirect');
      await signInWithGoogle();
      // Page will reload
      return true;
    } catch (err: any) {
      console.error("[useAuth] Google redirect error:", err);
      setAuthMessage(err.message || "Google login failed");
      setAuthInProgress(false);
      return false;
    }
  }, []);
  
  // Login with Google (popup)
  const loginWithGooglePopup = useCallback(async () => {
    setAuthInProgress(true);
    setAuthMessage(null);
    
    try {
      localStorage.setItem('lastAuthMethod', 'google-popup');
      const result = await signInWithGooglePopup();
      setAuthInProgress(false);
      return !!result;
    } catch (err: any) {
      console.error("[useAuth] Google popup error:", err);
      setAuthMessage(err.message || "Google popup login failed");
      setAuthInProgress(false);
      return false;
    }
  }, []);
  
  // Send email link for authentication
  const sendEmailLink = useCallback(async (email: string) => {
    setAuthInProgress(true);
    setAuthMessage(null);
    
    try {
      localStorage.setItem('lastAuthMethod', 'email-link');
      await sendLoginLink(email);
      setAuthInProgress(false);
      return true;
    } catch (err: any) {
      console.error("[useAuth] Email link sending error:", err);
      setAuthMessage(err.message || "Failed to send login email");
      setAuthInProgress(false);
      return false;
    }
  }, []);
  
  // Complete email link authentication
  const completeEmailLinkAuth = useCallback(async (email?: string) => {
    setAuthInProgress(true);
    setAuthMessage(null);
    
    try {
      const result = await loginWithEmailLink(email);
      setAuthInProgress(false);
      return !!result;
    } catch (err: any) {
      console.error("[useAuth] Email link sign-in error:", err);
      setAuthMessage(err.message || "Email link sign-in failed");
      setAuthInProgress(false);
      return false;
    }
  }, []);
  
  // Logout
  const logout = useCallback(async () => {
    setAuthInProgress(true);
    
    try {
      await signOut(auth);
      localStorage.removeItem('lastAuthMethod');
      return true;
    } catch (err: any) {
      console.error("[useAuth] Logout error:", err);
      setAuthMessage(err.message || "Logout failed");
      return false;
    } finally {
      setAuthInProgress(false);
    }
  }, []);
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading || authInProgress,
    error,
    authMessage,
    login,
    loginWithGoogleRedirect,
    loginWithGooglePopup,
    sendEmailLink,
    completeEmailLinkAuth,
    logout
  };
} 