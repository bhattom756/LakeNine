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
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "@/lib/firebase";

interface UserContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
