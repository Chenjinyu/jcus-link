export type Environment = 'local' | 'production'; //| 'development' | 'qa' |

export interface EnvironmentConfig {
  env: Environment;
  isDevelopment: boolean;
  isProduction: boolean;
  apiUrl: string;
  defaultModel: string;
  enableLocalOllama: boolean;
  debugMode: boolean;
}

/**
 * Get current environment
 */
function getCurrentEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 'local';

  if (!['local', 'production'].includes(env)) {
    console.warn(`Unknown environment: ${env}, defaulting to local`);
    return 'local';
  }
  return env as Environment;
}

/**
 * This is default configuration for the AI model to use. 
 * All avaiable models are defined in the ModelRegistry.ts file.
 */
const environmentConfigs: Record<Environment, EnvironmentConfig> = {
  local: {
    env: 'local',
    isDevelopment: true,
    isProduction: false,
    apiUrl: 'http://localhost:3000',
    defaultModel: 'ollama/llama3.1:8b', // Use local Ollama for local testing
    enableLocalOllama: true,
    debugMode: true,
  },
  production: {
    env: 'production',
    isDevelopment: false,
    isProduction: true,
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://jcus.link',
    defaultModel: 'google/gemini-2.0-flash',
    enableLocalOllama: false,
    debugMode: false,
  }
};

/**
 * Get environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const environment = getCurrentEnvironment();
  const config = environmentConfigs[environment];

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Environment] Current environment: ${environment}`);
    console.log(`[Environment] Config:`, {
      apiUrl: config.apiUrl,
      defaultModel: config.defaultModel,
      enableLocalOllama: config.enableLocalOllama,
    });
  }

  return config;
}

/**
 * Singleton instance
 */
export const envConfig = getEnvironmentConfig();