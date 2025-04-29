import { GeneratedApp, TestResult } from "@/types";

export const generateCodeAI = async (prompt: string): Promise<{
  app: GeneratedApp;
  testResults: TestResult[];
}> => {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate code");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating code:", error);
    throw error;
  }
};
  