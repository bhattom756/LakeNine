export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  isCollapsed?: boolean;
}

export interface ChatResponse {
  plan: string;
  files: Record<string, string>;
} 