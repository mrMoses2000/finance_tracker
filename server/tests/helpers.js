import request from 'supertest';
import app from '../app.js';

export const registerUser = async ({ email, password, name }) => {
  return request(app).post('/auth/register').send({ email, password, name });
};

export const loginUser = async ({ email, password }) => {
  return request(app).post('/auth/login').send({ email, password });
};

export const createUserWithToken = async (overrides = {}) => {
  const email = overrides.email || `test_${Date.now()}@example.com`;
  const password = overrides.password || 'Password123!';
  const name = overrides.name || 'Test User';

  await registerUser({ email, password, name });
  const loginRes = await loginUser({ email, password });

  return { email, password, token: loginRes.body.token };
};

export default app;
