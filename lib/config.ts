// Configuration for Bolt.ai clone
export interface BoltConfig {
  useBoltPrompt: boolean;
  defaultModel: string;
  maxTokens: number;
  temperature: number;
}

// Default configuration
export const DEFAULT_CONFIG: BoltConfig = {
  useBoltPrompt: true, // Default to using Bolt prompt
  defaultModel: 'gpt-4o',
  maxTokens: 8000,
  temperature: 0.7,
};

// Get configuration from localStorage or use defaults
export function getBoltConfig(): BoltConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG;
  }

  try {
    const saved = localStorage.getItem('bolt-config');
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Error loading bolt config:', error);
  }

  return DEFAULT_CONFIG;
}

// Save configuration to localStorage
export function saveBoltConfig(config: Partial<BoltConfig>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const currentConfig = getBoltConfig();
    const newConfig = { ...currentConfig, ...config };
    localStorage.setItem('bolt-config', JSON.stringify(newConfig));
  } catch (error) {
    console.error('Error saving bolt config:', error);
  }
}

// Toggle Bolt prompt usage
export function toggleBoltPrompt(): boolean {
  const config = getBoltConfig();
  const newValue = !config.useBoltPrompt;
  saveBoltConfig({ useBoltPrompt: newValue });
  return newValue;
} 