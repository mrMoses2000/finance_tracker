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

// --- DATA RESTORATION SNAPSHOT ---
const CATEGORY_CONFIG = {
    housing: { label: 'Жилье и Связь', color: '#0d9488', limit: 300 },
    loans_kz: { label: 'Кредиты (KZ)', color: '#16a34a', limit: 200 },
    loans_ru: { label: 'Кредиты (РФ)', color: '#e11d48', limit: 200 },
    debt_private: { label: 'Долги Людям', color: '#f59e0b', limit: 100 },
    admin: { label: 'Налоги и Сервисы', color: '#64748b', limit: 100 },
    living: { label: 'Жизнь (Еда, Проезд)', color: '#ea580c', limit: 400 },
    giving: { label: 'Благотворительность', color: '#7c3aed', limit: 150 },
    lifestyle: { label: 'Досуг и Кофе', color: '#3b82f6', limit: 100 },
    trip: { label: 'Поездка (Алматы)', color: '#db2777', limit: 200 },
};

const STANDARD_DATA = [
    { name: 'Сервисы и подписки', day: 7, amountUSD: 12, categoryKey: 'admin' },
    { name: 'Kaspi Bank (Кредит KZ)', day: 9, amountUSD: 146, categoryKey: 'loans_kz' },
    { name: 'Сбербанк (11к RUB)', day: 10, amountUSD: 113, categoryKey: 'loans_ru' },
    { name: 'Частный долг (1/4)', day: 10, amountUSD: 58, categoryKey: 'debt_private' },
    { name: 'Аренда квартиры', day: 15, amountUSD: 129, categoryKey: 'housing' },
    { name: 'Налоги (ИП/Соц)', day: 25, amountUSD: 64, categoryKey: 'admin' },
    { name: 'Solvo Bank', day: 28, amountUSD: 40, categoryKey: 'loans_kz' },
    { name: 'Интернет (Дом)', day: 29, amountUSD: 14, categoryKey: 'housing' },
    { name: 'Т-Банк (4к RUB)', day: 19, amountUSD: 41, categoryKey: 'loans_ru' },
    { name: 'Продукты + Быт', day: 1, amountUSD: 238, categoryKey: 'living' },
    { name: 'Транспорт (город)', day: 1, amountUSD: 79, categoryKey: 'living' },
    { name: 'Медицина', day: 5, amountUSD: 20, categoryKey: 'living' },
    { name: 'Гигиена/Стрижка', day: 15, amountUSD: 30, categoryKey: 'living' },
    { name: 'Десятина (Целевая)', day: 1, amountUSD: 120, categoryKey: 'giving' },
    { name: 'Кафе / Кофе', day: 10, amountUSD: 59, categoryKey: 'lifestyle' },
    { name: 'Помощь / Благо', day: 20, amountUSD: 50, categoryKey: 'giving' },
];

const seedAdminUser = async () => {
    try {
        const email = 'moisey.vasilenko.abi@gmail.com';
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log('Admin user already exists.');
            return;
        }

        console.log('Seeding admin user...');
        const passwordHash = await bcrypt.hash('Moses2000nsu!', 10);

        const user = await prisma.user.create({
            data: {
                email,
                name: 'Moisey Vasilenko',
                passwordHash
            }
        });

        // Seed Data
        const categoryMap = {};
        for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
            const cat = await prisma.category.create({
                data: {
                    userId: user.id,
                    label: config.label,
                    color: config.color,
                    limit: config.limit
                }
            });
            categoryMap[key] = cat.id;
        }

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        for (const item of STANDARD_DATA) {
            const expenseDate = new Date(currentYear, currentMonth, item.day || 1);
            await prisma.expense.create({
                data: {
                    userId: user.id,
                    amountUSD: item.amountUSD,
                    description: item.name,
                    date: expenseDate,
                    categoryId: categoryMap[item.categoryKey]
                }
            });
        }
        console.log('Admin user seeded successfully.');
    } catch (e) {
        console.error('Seeding failed:', e);
    }
};

seedAdminUser();

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

        // Seed default categories for new user (Generic Set)
        const defaultCategories = [
            { label: 'General', color: '#64748b', limit: 1000 }
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

// Update Expense
app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { amountUSD, description, categoryId, date } = req.body;

        // Verify ownership
        const expense = await prisma.expense.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!expense) return res.sendStatus(404);

        const updated = await prisma.expense.update({
            where: { id },
            data: {
                amountUSD: parseFloat(amountUSD),
                description,
                categoryId,
                date: new Date(date)
            }
        });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

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
