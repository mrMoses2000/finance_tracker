import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET || 'dev_secret';

app.use(cors());
app.use(express.json());

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- ROUTES ---

// Register
app.post('/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, passwordHash: hashedPassword, name }
        });

        // Seed default categories for new user
        // ... logic to seed default categories ...

        res.json({ message: 'User created' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET);
        res.json({ token, user: { name: user.name, email: user.email, currency: user.currency } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Data (Protected)
app.get('/api/data', authenticateToken, async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            where: { userId: req.user.id },
            include: { category: true }
        });
        // Transform to frontend format if needed
        res.json({ expenses });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Add Expense (Protected)
app.post('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const { amountUSD, description, categoryId, date } = req.body;
        const expense = await prisma.expense.create({
            data: {
                userId: req.user.id,
                amountUSD: parseFloat(amountUSD),
                description,
                categoryId,
                date: new Date(date)
            }
        });
        res.json(expense);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
