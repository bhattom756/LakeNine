export interface GeneratedApp {
  name: string;
  description: string;
  files: GeneratedFile[];
  dependencies: Record<string, string>;
}

export interface GeneratedFile {
  name: string;
  content: string;
  path: string;
}

export interface TestResult {
  passed: boolean;
  message: string;
  details?: string;
} 