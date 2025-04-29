"use client";

import React, { createContext, useContext, useState } from "react";
import { GeneratedApp, TestResult } from "@/types";

interface AppContextType {
  generatedApp: GeneratedApp | null;
  setGeneratedApp: (app: GeneratedApp | null) => void;
  testResults: TestResult[];
  setTestResults: (results: TestResult[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AppContext.Provider
      value={{
        generatedApp,
        setGeneratedApp,
        testResults,
        setTestResults,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
} 