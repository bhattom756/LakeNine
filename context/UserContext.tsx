"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

const UserContext = createContext<Session | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();

  return (
    <UserContext.Provider value={session}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
