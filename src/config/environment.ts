// Environment Configuration
export type Environment = 'localhost' | 'development' | 'production';

export interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: Environment;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  serverPort: number;
}

// Get current environment
export const getCurrentEnvironment = (): Environment => {
  return (import.meta.env.VITE_ENVIRONMENT as Environment) || 'localhost';
};

// Environment configurations
export const ENVIRONMENT_CONFIGS: Record<Environment, EnvironmentConfig> = {
  localhost: {
    apiBaseUrl: 'http://localhost:3001/hostel/api/v1',
    environment: 'localhost',
    debugMode: true,
    logLevel: 'debug',
    serverPort: 3001,
  },
  development: {
    apiBaseUrl: 'https://dev.kaha.com.np/hostel/api/v1',
    environment: 'development',
    debugMode: true,
    logLevel: 'info',
    serverPort: 3001,
  },
  production: {
    apiBaseUrl: 'https://api.kaha.com.np/hostel/api/v1',
    environment: 'production',
    debugMode: false,
    logLevel: 'error',
    serverPort: 3001,
  },
};

// Get current environment configuration
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const currentEnv = getCurrentEnvironment();
  const envConfig = ENVIRONMENT_CONFIGS[currentEnv];
  
  // Override with environment variables if available
  return {
    ...envConfig,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || envConfig.apiBaseUrl,
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || envConfig.debugMode,
    logLevel: (import.meta.env.VITE_LOG_LEVEL as any) || envConfig.logLevel,
    serverPort: parseInt(import.meta.env.VITE_SERVER_PORT) || envConfig.serverPort,
  };
};

// Environment utilities
export const isLocalhost = () => getCurrentEnvironment() === 'localhost';
export const isDevelopment = () => getCurrentEnvironment() === 'development';
export const isProduction = () => getCurrentEnvironment() === 'production';

// Debug logging utility
export const debugLog = (message: string, data?: any) => {
  const config = getEnvironmentConfig();
  if (config.debugMode) {
    console.log(`[${config.environment.toUpperCase()}] ${message}`, data || '');
  }
};

// Environment info for debugging
export const getEnvironmentInfo = () => {
  const config = getEnvironmentConfig();
  return {
    environment: config.environment,
    apiBaseUrl: config.apiBaseUrl,
    debugMode: config.debugMode,
    logLevel: config.logLevel,
    timestamp: new Date().toISOString(),
  };
};

export default getEnvironmentConfig;