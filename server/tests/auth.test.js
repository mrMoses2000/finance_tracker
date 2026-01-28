import { resetDb, disconnectDb } from './setupDb.js';
import { registerUser, loginUser } from './helpers.js';

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await disconnectDb();
});

test('registers and logs in a user', async () => {
  const email = 'user@example.com';
  const password = 'Password123!';

  const registerRes = await registerUser({ email, password, name: 'User' });
  expect(registerRes.statusCode).toBe(200);
  expect(registerRes.body).toHaveProperty('message', 'User created');

  const loginRes = await loginUser({ email, password });
  expect(loginRes.statusCode).toBe(200);
  expect(loginRes.body).toHaveProperty('token');
});

test('rejects duplicate registration', async () => {
  const email = 'dup@example.com';
  const password = 'Password123!';

  await registerUser({ email, password, name: 'User' });
  const res = await registerUser({ email, password, name: 'User' });
  expect(res.statusCode).toBe(400);
});
