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

test('prevents using another user category', async () => {
  const userA = await createUserWithToken();
  const userB = await createUserWithToken();

  const categoriesRes = await request(app)
    .get('/api/categories')
    .set('Authorization', `Bearer ${userA.token}`);
  const otherCategoryId = categoriesRes.body[0].id;

  const res = await request(app)
    .post('/api/expenses')
    .set('Authorization', `Bearer ${userB.token}`)
    .send({
      amountUSD: 10,
      description: 'Should Fail',
      categoryId: otherCategoryId,
      date: new Date().toISOString(),
      type: 'expense',
    });

  expect(res.statusCode).toBe(404);
});
