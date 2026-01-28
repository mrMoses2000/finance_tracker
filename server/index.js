import 'dotenv/config';
import app from './app.js';
import { PORT, SEED_ADMIN, validateEnv } from './config/env.js';
import { seedAdminUser } from './services/seed.js';

try {
  validateEnv();
} catch (err) {
  console.error('[Startup] Environment validation failed:', err.message);
  process.exit(1);
}

if (SEED_ADMIN) {
  seedAdminUser()
    .then(() => console.log('[Seed] Admin seed complete.'))
    .catch((err) => console.error('[Seed] Admin seed failed:', err));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
