"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  auth,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "@/lib/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

interface UserContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: Error | undefined;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: undefined,
  login: async () => {},
  logout: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  // Use react-firebase-hooks for auth state
  const [authUser, loading, error] = useAuthState(auth);
  
  // Convert undefined to null to match our interface
  const user = authUser ?? null;

  // Set persistence to local storage (persists until browser closes or explicit logout)
  useEffect(() => {
    const setAuthPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log("UserContext: Auth persistence set to local storage");
      } catch (error) {
        console.error("UserContext: Error setting auth persistence:", error);
      }
    };

    setAuthPersistence();
  }, []);

  // For debugging and session management
  useEffect(() => {
    if (user) {
      console.log("UserContext: Auth state changed - user signed in:", user.email);
      // Store user info for debugging
      localStorage.setItem('userEmail', user.email || '');
      localStorage.setItem('userId', user.uid);
    } else if (!loading) {
      console.log("UserContext: Auth state changed - user signed out");
      // Clear stored user info
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userToken');
      sessionStorage.clear();
    }
  }, [user, loading]);

  const login = async (email: string, password: string) => {
    try {
      console.log("UserContext: Attempting login for:", email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("UserContext: Login successful");
    } catch (error) {
      console.error("Login error in UserContext:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("UserContext: Attempting logout");
      
      // Clear all session data first
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userToken');
      sessionStorage.clear();
      
      // Sign out from Firebase
      await signOut(auth);
      console.log("UserContext: Logout successful");
    } catch (error) {
      console.error("Logout error in UserContext:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
