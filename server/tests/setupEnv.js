if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_secret';
}

if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = '7d';
}

if (!process.env.CORS_ALLOW_ALL) {
  process.env.CORS_ALLOW_ALL = 'true';
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/budget_app_test?schema=public';
}
