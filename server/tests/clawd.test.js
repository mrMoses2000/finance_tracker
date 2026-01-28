import request from 'supertest';
import { resetDb, disconnectDb } from './setupDb.js';
import { createUserWithToken } from './helpers.js';
import app from '../app.js';

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await disconnectDb();
});

test('parses clawd expense with currency conversion', async () => {
  const { token } = await createUserWithToken();

  const res = await request(app)
    .post('/api/clawd/expense')
    .set('Authorization', `Bearer ${token}`)
    .send({ text: 'spent 5k taxi', currency: 'KZT' });

  expect(res.statusCode).toBe(200);
  expect(res.body.parsed.currency).toBe('KZT');
  expect(res.body.parsed.amountUSD).toBeGreaterThan(9);
  expect(res.body.parsed.amountUSD).toBeLessThan(11);

  const summary = await request(app)
    .get('/api/clawd/summary?currency=KZT')
    .set('Authorization', `Bearer ${token}`);
  expect(summary.statusCode).toBe(200);
  expect(summary.body.currency).toBe('KZT');
  expect(summary.body.expenses).toBeGreaterThan(0);
});
