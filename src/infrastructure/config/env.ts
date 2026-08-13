import "dotenv/config";
/**
 * Centralized environment configuration and validation.
 * Ensures the application fails fast if required secrets are missing in production.
 */

import { z } from 'zod';

/**
 * Enterprise Environment Configuration Schema.
 * Validates all required variables on startup and enforces security best practices.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.preprocess((v) => 3000, z.number().default(3000)),
  
  // Application URLs
  APP_URL: z.string().url().optional().default('http://localhost:3000'),
  API_URL: z.string().url().optional(),
  CORS_ORIGIN: z.string().optional().default('*'),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // AI Providers
  GEMINI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  OPENROUTER_DEFAULT_MODEL: z.string().default('meta-llama/llama-3-8b-instruct'),

  // Identity & Auth
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters in production"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters in production"),
  AUTH_MODE: z.string().optional().default('production'),

  // Supabase Configuration
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Observability
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
}).refine((data) => {
  if (data.NODE_ENV === 'production') {
    const devFallbacks = [
      'aiarina_access_secret_2026_dev_fallback',
      'aiarina_refresh_secret_2026_dev_fallback',
      'MY_GEMINI_API_KEY',
      'MY_OPENROUTER_API_KEY'
    ];
    
    if (devFallbacks.includes(data.JWT_ACCESS_SECRET) || devFallbacks.includes(data.JWT_REFRESH_SECRET)) {
      return false;
    }
  }
  return true;
}, {
  message: "Production secrets must not use development fallbacks",
  path: ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"]
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns the configuration object.
 * Fails fast with a detailed error message if validation fails.
 */
function validateConfig(): EnvConfig {
  const env = { ...process.env };
  
  // Normalize LOG_LEVEL if it exists
  if (env.LOG_LEVEL) {
    const validLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
    const normalized = env.LOG_LEVEL.toLowerCase();
    env.LOG_LEVEL = validLevels.includes(normalized) ? normalized : 'info';
  }

  // Provide fallbacks for dev if missing
  if (process.env.NODE_ENV !== 'production') {
    env.JWT_ACCESS_SECRET = env.JWT_ACCESS_SECRET || 'aiarina_access_secret_2026_dev_fallback_long_enough';
    env.JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET || 'aiarina_refresh_secret_2026_dev_fallback_long_enough';
    env.DATABASE_URL = env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/aiarena';
    env.OPENROUTER_API_KEY = env.OPENROUTER_API_KEY || 'dev_key';
    env.SUPABASE_URL = env.SUPABASE_URL || 'http://localhost:54321';
    env.SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || 'dev_key';
  }

  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, messages]) => `${key}: ${messages?.join(', ')}`)
      .join('\n');
    
    console.error('❌ Invalid environment configuration:\n', errorMessages);
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    
    // In development, we MUST return a valid object that satisfies the EnvConfig type
    // We use the defaults from the schema and merge with whatever we managed to parse
    return {
      ...envSchema.parse({
        DATABASE_URL: env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/aiarena',
        OPENROUTER_API_KEY: env.OPENROUTER_API_KEY || 'dev_key',
        JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET || 'aiarina_access_secret_2026_dev_fallback_long_enough',
        JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET || 'aiarina_refresh_secret_2026_dev_fallback_long_enough',
        PORT: 3000,
      }),
      ...result.data,
      PORT: 3000, // Absolutely force 3000
    } as EnvConfig;
  }

  return {
    ...result.data,
    PORT: 3000, // Absolutely force 3000
  };
}

let cachedConfig: EnvConfig | null = null;
export const getConfig = () => {
  if (typeof window === 'undefined') {
    if (!cachedConfig) {
      cachedConfig = validateConfig();
    }
    return cachedConfig;
  }
  return {} as EnvConfig;
};

// This is still exported to maintain compatibility, but should be used with caution in the browser.
// If imported in the browser, it will only be safe if it doesn't immediately call validateConfig.
// Actually, with the change above, `config` in browser will just be an empty object,
// and `validateConfig()` will NOT be called in the browser.
export const config = (typeof window === 'undefined') ? validateConfig() : ({} as EnvConfig);

/**
 * Returns true if the current environment is set to development or auth bypass is active.
 */
export const isDevAuth = (): boolean => {
  return config.NODE_ENV === 'development' || config.AUTH_MODE === 'development';
};

/**
 * Returns configuration safe for logging (redacts secrets).
 */
export const getSafeConfig = () => {
  return {
    ...config,
    DATABASE_URL: config.DATABASE_URL ? '[REDACTED]' : undefined,
    GEMINI_API_KEY: config.GEMINI_API_KEY ? '[REDACTED]' : undefined,
    OPENROUTER_API_KEY: config.OPENROUTER_API_KEY ? '[REDACTED]' : undefined,
    JWT_ACCESS_SECRET: '[REDACTED]',
    JWT_REFRESH_SECRET: '[REDACTED]',
    SUPABASE_SERVICE_ROLE_KEY: config.SUPABASE_SERVICE_ROLE_KEY ? '[REDACTED]' : undefined,
    SUPABASE_ANON_KEY: config.SUPABASE_ANON_KEY ? '[REDACTED]' : undefined,
  };
};
