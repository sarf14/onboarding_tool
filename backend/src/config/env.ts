import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
};

// Validate required environment variables
if (!config.supabase.url) {
  throw new Error('SUPABASE_URL is required');
}

if (!config.supabase.serviceRoleKey && !config.supabase.anonKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required');
}

if (config.nodeEnv === 'production' && config.jwt.secret === 'fallback-secret-change-in-production') {
  throw new Error('JWT_SECRET must be set in production');
}
