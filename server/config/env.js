export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = Number.parseInt(process.env.PORT || '4000', 10);

export const JWT_SECRET = process.env.JWT_SECRET || '';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
export const CORS_ALLOW_ALL = process.env.CORS_ALLOW_ALL === 'true';

export const SEED_ADMIN = process.env.SEED_ADMIN === 'true';
export const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || '';
export const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || '';
export const SEED_ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Admin User';

export const TRUST_PROXY = process.env.TRUST_PROXY === 'true';

export const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED !== 'false';
export const RATE_LIMIT_WINDOW_MS = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
export const RATE_LIMIT_MAX = Number.parseInt(process.env.RATE_LIMIT_MAX || '300', 10);
export const RATE_LIMIT_AUTH_WINDOW_MS = Number.parseInt(
  process.env.RATE_LIMIT_AUTH_WINDOW_MS || String(RATE_LIMIT_WINDOW_MS),
  10,
);
export const RATE_LIMIT_AUTH_MAX = Number.parseInt(process.env.RATE_LIMIT_AUTH_MAX || '20', 10);

export const AUDIT_LOG_ENABLED = process.env.AUDIT_LOG_ENABLED !== 'false';

export const RATES_ENABLED = process.env.RATES_ENABLED !== 'false';
export const RATES_CRON = process.env.RATES_CRON || '0 6,18 * * *';
export const RATES_TIMEZONE = process.env.RATES_TIMEZONE || 'UTC';
export const RATES_SOURCE = process.env.RATES_SOURCE || 'cbr';
export const RATES_BASE = process.env.RATES_BASE || (RATES_SOURCE === 'ecb' ? 'EUR' : 'RUB');
export const RATES_FALLBACK = process.env.RATES_FALLBACK
  ? JSON.parse(process.env.RATES_FALLBACK)
  : null;

export const validateEnv = () => {
  if (NODE_ENV === 'production') {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is required in production.');
    }
    if (!CORS_ALLOW_ALL && CORS_ORIGINS.length === 0) {
      throw new Error('CORS_ORIGINS must be set in production (or set CORS_ALLOW_ALL=true).');
    }
  }
};
