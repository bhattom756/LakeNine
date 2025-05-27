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
  const [user, loading, error] = useAuthState(auth);

  // For debugging
  useEffect(() => {
    if (user) {
      console.log("UserContext: Auth state changed - user signed in:", user.email);
    } else if (!loading) {
      console.log("UserContext: Auth state changed - user signed out");
    }
  }, [user, loading]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error in UserContext:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
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
