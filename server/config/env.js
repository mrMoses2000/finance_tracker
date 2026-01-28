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
