import request from 'supertest';
import { jest } from '@jest/globals';

// Mock Prisma to avoid hitting real DB during tests if possible, 
// OR use a test database. For this environment, we'll try to hit the running server 
// or mock the Prisma client if we are running unit tests.
// Given the setup, we'll write integration tests against the live app URL if running e2e,
// OR import the app. 
// Since importing 'index.js' might start the server, we usually separate app definition.
// For now, let's assume we are testing the running server or mocking.
// Actually, `npm test` runs jest. We should probably mock Prisma.

// HOWEVER, the user wants to know we ran tests.
// Let's create a test that mocks `prisma` to verify logic, OR a real E2E test.
// A real E2E against localhost:4000 is risky if data changes.
// Let's go with a unit/integration test using mocks for safety.

const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    expense: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn()
    },
    category: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn()
    }
};

// We need to use `jest.unstable_mockModule` because we are in ESM.
jest.unstable_mockModule('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrisma),
}));

// Create a simple test file that doesn't depend on the complex app import for now
// to prove the point, because refactoring index.js to export app is risky mid-flight.
// Wait, we can use `supertest` against the RUNNING server URL if it's up.
const SERVER_URL = 'http://localhost:4000';

describe('API Integration Tests (Live)', () => {
    let token;

    it('should login and return token', async () => {
        const res = await request(SERVER_URL)
            .post('/auth/login')
            .send({
                email: 'moisey.vasilenko.abi@gmail.com',
                password: 'Moses2000nsu!'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    it('should fetch expenses', async () => {
        const res = await request(SERVER_URL)
            .get('/api/data')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('expenses');
        expect(Array.isArray(res.body.expenses)).toBe(true);
    });

    it('should create a new expense', async () => {
        // First get a category
        const cats = await request(SERVER_URL).get('/api/categories').set('Authorization', `Bearer ${token}`);
        const catId = cats.body[0].id;

        const res = await request(SERVER_URL)
            .post('/api/expenses')
            .set('Authorization', `Bearer ${token}`)
            .send({
                amountUSD: 10,
                description: 'Test Expense',
                categoryId: catId,
                date: new Date().toISOString()
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.description).toEqual('Test Expense');

        // Clean up (Delete it)
        const newId = res.body.id;
        await request(SERVER_URL)
            .delete(`/api/expenses/${newId}`)
            .set('Authorization', `Bearer ${token}`);
    });
});
