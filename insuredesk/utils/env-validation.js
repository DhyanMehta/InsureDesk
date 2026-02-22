/**
 * Environment Variable Validation
 * Validates required environment variables are present before app starts
 */

const requiredEnvVars = {
  // Supabase - Critical for app functionality
  NEXT_PUBLIC_SUPABASE_URL: {
    description: 'Supabase project URL',
    example: 'https://xxxxxxxxxxxxx.supabase.co',
    required: true
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous public key',
    example: 'eyJhbGc...',
    required: true
  },
  
  // Redis Cache - Optional but recommended
  UPSTASH_REDIS_REST_URL: {
    description: 'Upstash Redis REST URL',
    example: 'https://xxxxx.upstash.io',
    required: false
  },
  UPSTASH_REDIS_REST_TOKEN: {
    description: 'Upstash Redis REST token',
    example: 'AXxxxx...',
    required: false
  }
};

/**
 * Validate environment variables
 * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateEnv() {
  const errors = [];
  const warnings = [];
  
  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, config]) => {
    const value = process.env[key];
    
    if (!value) {
      if (config.required) {
        errors.push(
          `❌ Missing required environment variable: ${key}\n` +
          `   Description: ${config.description}\n` +
          `   Example: ${config.example}`
        );
      } else {
        warnings.push(
          `⚠️  Optional environment variable not set: ${key}\n` +
          `   Description: ${config.description}\n` +
          `   Impact: ${getImpactMessage(key)}`
        );
      }
    }
  });
  
  // Validate URL formats
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && 
      !isValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    errors.push('❌ NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
  }
  
  if (process.env.UPSTASH_REDIS_REST_URL && 
      !isValidUrl(process.env.UPSTASH_REDIS_REST_URL)) {
    warnings.push('⚠️  UPSTASH_REDIS_REST_URL is not a valid URL - Redis cache disabled');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if a string is a valid URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get impact message for missing optional variables
 */
function getImpactMessage(key) {
  const impacts = {
    UPSTASH_REDIS_REST_URL: 'App will use memory cache instead (slower performance)',
    UPSTASH_REDIS_REST_TOKEN: 'Redis caching will be disabled'
  };
  
  return impacts[key] || 'Feature will be disabled';
}

/**
 * Validate environment and throw if critical issues found
 * Use this in production builds
 */
export function validateEnvOrThrow() {
  const { valid, errors, warnings } = validateEnv();
  
  // Always show warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:\n');
    warnings.forEach(warning => console.warn(warning));
    console.warn('\n');
  }
  
  // Throw on errors
  if (!valid) {
    console.error('\n❌ Environment Validation Failed:\n');
    errors.forEach(error => console.error(error));
    console.error('\nPlease check your .env.local file and ensure all required variables are set.\n');
    
    // In production, stop the build/startup
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables');
    }
  }
  
  return valid;
}

/**
 * Get sanitized environment info for debugging (without sensitive values)
 */
export function getEnvInfo() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    redisEnabled: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  };
}
