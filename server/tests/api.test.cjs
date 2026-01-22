const request = require('supertest');
const baseUrl = 'http://127.0.0.1:4000';

describe('Auth Endpoints', () => {
    let token;
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';

    test('should register a new user', async () => {
        const res = await request(baseUrl)
            .post('/auth/register')
            .send({
                name: 'Test User',
                email,
                password
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'User created');
    });

    test('should login the user', async () => {
        const res = await request(baseUrl)
            .post('/auth/login')
            .send({
                email,
                password
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    test('should fail with wrong password', async () => {
        const res = await request(baseUrl)
            .post('/auth/login')
            .send({
                email,
                password: 'wrong'
            });
        expect(res.statusCode).toEqual(400);
    });

    test('should access protected data with token', async () => {
        const res = await request(baseUrl)
            .get('/api/me')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('email', email);
    });
});
