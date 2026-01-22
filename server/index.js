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
        const defaultCategories = [
            { label: 'Жилье и Связь', color: '#0d9488', limit: 1000 },
            { label: 'Кредиты', color: '#e11d48', limit: 500 },
            { label: 'Жизнь (Еда)', color: '#ea580c', limit: 600 },
            { label: 'Досуг', color: '#3b82f6', limit: 300 },
            { label: 'Транспорт', color: '#64748b', limit: 150 },
        ];

        for (const cat of defaultCategories) {
            await prisma.category.create({
                data: {
                    userId: user.id,
                    label: cat.label,
                    color: cat.color,
                    limit: cat.limit
                }
            });
        }

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

// --- CATEGORIES / BUDGET ---

// Get Categories (with limits)
app.get('/api/categories', authenticateToken, async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { userId: req.user.id }
        });
        res.json(categories);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Category Limit/Color
app.put('/api/categories/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { label, color, limit } = req.body;

        // Ensure user owns the category
        const category = await prisma.category.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!category) return res.sendStatus(404);

        const updated = await prisma.category.update({
            where: { id },
            data: { label, color, limit: parseFloat(limit || 0) }
        });
        res.json(updated);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// --- EXPENSES ---

// Delete Expense
app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Verify ownership
        const expense = await prisma.expense.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!expense) return res.sendStatus(404);

        await prisma.expense.delete({ where: { id } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get User Profile (Currency etc)
app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        res.json({ name: user.name, email: user.email, currency: user.currency });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
