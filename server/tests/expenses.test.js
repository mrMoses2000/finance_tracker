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

test('creates, updates, and deletes an expense', async () => {
  const { token } = await createUserWithToken();

  const categoriesRes = await request(app)
    .get('/api/categories')
    .set('Authorization', `Bearer ${token}`);
  const categoryId = categoriesRes.body[0].id;

  const createRes = await request(app)
    .post('/api/expenses')
    .set('Authorization', `Bearer ${token}`)
    .send({
      amountUSD: 10,
      description: 'Test Expense',
      categoryId,
      date: new Date().toISOString(),
      type: 'expense',
    });
  expect(createRes.statusCode).toBe(200);
  expect(createRes.body.description).toBe('Test Expense');

  const updateRes = await request(app)
    .put(`/api/expenses/${createRes.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      amountUSD: 12,
      description: 'Updated Expense',
      categoryId,
    });
  expect(updateRes.statusCode).toBe(200);
  expect(updateRes.body.description).toBe('Updated Expense');

  const deleteRes = await request(app)
    .delete(`/api/expenses/${createRes.body.id}`)
    .set('Authorization', `Bearer ${token}`);
  expect(deleteRes.statusCode).toBe(200);
  expect(deleteRes.body).toHaveProperty('success', true);
});
