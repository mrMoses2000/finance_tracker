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

const toMonthStart = (monthStr) => {
    const now = new Date();
    let year = now.getUTCFullYear();
    let month = now.getUTCMonth() + 1;

    if (monthStr) {
        const [y, m] = monthStr.split('-').map(Number);
        if (!Number.isNaN(y) && !Number.isNaN(m)) {
            year = y;
            month = m;
        }
    }

    return new Date(Date.UTC(year, month - 1, 1));
};

const getMonthRange = (monthStart) => {
    const start = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), 1));
    const end = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));
    return { start, end };
};

const toMonthKey = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

// --- DATA RESTORATION SNAPSHOT ---
const CATEGORY_CONFIG = {
    housing: { label: 'Жилье и Связь', color: '#0d9488', limit: 300, type: 'expense' },
    loans_kz: { label: 'Кредиты (KZ)', color: '#16a34a', limit: 200, type: 'expense' },
    loans_ru: { label: 'Кредиты (РФ)', color: '#e11d48', limit: 200, type: 'expense' },
    debt_private: { label: 'Долги Людям', color: '#f59e0b', limit: 100, type: 'expense' },
    admin: { label: 'Налоги и Сервисы', color: '#64748b', limit: 100, type: 'expense' },
    living: { label: 'Жизнь (Еда, Проезд)', color: '#ea580c', limit: 400, type: 'expense' },
    giving: { label: 'Благотворительность', color: '#7c3aed', limit: 150, type: 'expense' },
    lifestyle: { label: 'Досуг и Кофе', color: '#3b82f6', limit: 100, type: 'expense' },
    trip: { label: 'Поездка (Алматы)', color: '#db2777', limit: 200, type: 'expense' },
    salary: { label: 'Зарплата', color: '#10b981', limit: 0, type: 'income' },
    freelance: { label: 'Фриланс', color: '#22c55e', limit: 0, type: 'income' },
};

const BASE_TRANSACTIONS = [
    { name: 'Зарплата', day: 1, amountUSD: 1500, categoryKey: 'salary', type: 'income', recurring: true },
    { name: 'Фриланс', day: 15, amountUSD: 350, categoryKey: 'freelance', type: 'income', recurring: true },
    { name: 'Сервисы и подписки', day: 7, amountUSD: 12, categoryKey: 'admin', type: 'expense', recurring: true },
    { name: 'Kaspi Bank (Кредит KZ)', day: 9, amountUSD: 146, categoryKey: 'loans_kz', type: 'expense', recurring: true, debtKey: 'kaspi' },
    { name: 'Сбербанк (11к RUB)', day: 10, amountUSD: 113, categoryKey: 'loans_ru', type: 'expense', recurring: true },
    { name: 'Частный долг (1/4)', day: 10, amountUSD: 58, categoryKey: 'debt_private', type: 'expense', recurring: true, debtKey: 'private' },
    { name: 'Аренда квартиры', day: 15, amountUSD: 129, categoryKey: 'housing', type: 'expense', recurring: true },
    { name: 'Налоги (ИП/Соц)', day: 25, amountUSD: 64, categoryKey: 'admin', type: 'expense', recurring: true },
    { name: 'Solvo Bank', day: 28, amountUSD: 40, categoryKey: 'loans_kz', type: 'expense', recurring: true },
    { name: 'Интернет (Дом)', day: 29, amountUSD: 14, categoryKey: 'housing', type: 'expense', recurring: true },
    { name: 'Т-Банк (4к RUB)', day: 19, amountUSD: 41, categoryKey: 'loans_ru', type: 'expense', recurring: true },
    { name: 'Продукты + Быт', day: 1, amountUSD: 238, categoryKey: 'living', type: 'expense' },
    { name: 'Транспорт (город)', day: 1, amountUSD: 79, categoryKey: 'living', type: 'expense' },
    { name: 'Медицина', day: 5, amountUSD: 20, categoryKey: 'living', type: 'expense' },
    { name: 'Гигиена/Стрижка', day: 15, amountUSD: 30, categoryKey: 'living', type: 'expense' },
    { name: 'Десятина (Целевая)', day: 1, amountUSD: 120, categoryKey: 'giving', type: 'expense' },
    { name: 'Кафе / Кофе', day: 10, amountUSD: 59, categoryKey: 'lifestyle', type: 'expense' },
    { name: 'Помощь / Благо', day: 20, amountUSD: 50, categoryKey: 'giving', type: 'expense' },
];

const FEBRUARY_EXTRA = [
    { name: 'Дорога (Алматы)', day: 3, amountUSD: 95, categoryKey: 'trip', type: 'expense' },
    { name: 'Конференц-взнос', day: 6, amountUSD: 30, categoryKey: 'trip', type: 'expense' },
    { name: 'Продукты (Алматы)', day: 12, amountUSD: 300, categoryKey: 'living', type: 'expense' },
    { name: 'Транспорт (Алматы)', day: 12, amountUSD: 120, categoryKey: 'living', type: 'expense' },
    { name: 'Медицина/Гигиена', day: 18, amountUSD: 51, categoryKey: 'living', type: 'expense' },
    { name: 'Десятина (Пересчет)', day: 22, amountUSD: 145, categoryKey: 'giving', type: 'expense' },
    { name: 'Кафе / Помощь', day: 24, amountUSD: 109, categoryKey: 'lifestyle', type: 'expense' },
];

const FEBRUARY_PLAN = [...BASE_TRANSACTIONS, ...FEBRUARY_EXTRA];

const SEED_DEBTS = [
    {
        key: 'kaspi',
        name: 'Kaspi Bank Loan',
        type: 'debt',
        principal: 2000,
        balance: 1260,
        interestRate: 12,
        startDate: new Date(Date.UTC(2025, 8, 1)),
        termMonths: 18,
        nextPaymentDay: 9,
        monthlyPaymentUSD: 146,
        categoryKey: 'loans_kz'
    },
    {
        key: 'private',
        name: 'Частный долг',
        type: 'debt',
        principal: 500,
        balance: 350,
        interestRate: 0,
        startDate: new Date(Date.UTC(2025, 10, 1)),
        termMonths: 4,
        nextPaymentDay: 10,
        monthlyPaymentUSD: 58,
        categoryKey: 'debt_private'
    },
    {
        key: 'client',
        name: 'Выданный займ',
        type: 'loan',
        principal: 800,
        balance: 600,
        interestRate: 5,
        startDate: new Date(Date.UTC(2025, 11, 1)),
        termMonths: 8,
        nextPaymentDay: 20,
        monthlyPaymentUSD: 120,
        categoryKey: 'freelance'
    }
];

const buildCategoryMap = async (userId) => {
    const categoryMap = {};

    for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
        const existing = await prisma.category.findFirst({
            where: { userId, label: config.label }
        });

        if (existing) {
            categoryMap[key] = existing.id;
            continue;
        }

        const created = await prisma.category.create({
            data: {
                userId,
                label: config.label,
                color: config.color,
                limit: config.limit,
                type: config.type
            }
        });
        categoryMap[key] = created.id;
    }

    return categoryMap;
};

const sumByCategoryKey = (items) => {
    return items.reduce((acc, item) => {
        if (item.type !== 'expense') return acc;
        if (!acc[item.categoryKey]) acc[item.categoryKey] = 0;
        acc[item.categoryKey] += item.amountUSD;
        return acc;
    }, {});
};

const sumIncome = (items) => {
    return items.reduce((acc, item) => acc + (item.type === 'income' ? item.amountUSD : 0), 0);
};

const seedMonthlyTransactions = async (userId, categoryMap) => {
    const monthStart = toMonthStart();
    const { start, end } = getMonthRange(monthStart);
    const existingCount = await prisma.expense.count({
        where: { userId, date: { gte: start, lt: end } }
    });
    if (existingCount > 0) return;

    for (const item of BASE_TRANSACTIONS) {
        const expenseDate = new Date(Date.UTC(
            monthStart.getUTCFullYear(),
            monthStart.getUTCMonth(),
            item.day || 1
        ));

        await prisma.expense.create({
            data: {
                userId,
                amountUSD: item.amountUSD,
                description: item.name,
                date: expenseDate,
                categoryId: categoryMap[item.categoryKey],
                type: item.type
            }
        });
    }
};

const seedFebruaryBudget = async (userId, categoryMap) => {
    const febYear = new Date().getUTCFullYear();
    const febStart = new Date(Date.UTC(febYear, 1, 1));
    const existingBudget = await prisma.budgetMonth.findUnique({
        where: { userId_month: { userId, month: febStart } }
    });
    if (existingBudget) return;

    const totals = sumByCategoryKey(FEBRUARY_PLAN);
    const incomePlanned = sumIncome(FEBRUARY_PLAN);

    const budgetMonth = await prisma.budgetMonth.create({
        data: {
            userId,
            month: febStart,
            incomePlanned
        }
    });

    const items = [];
    for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
        if (config.type !== 'expense') continue;
        const categoryId = categoryMap[key];
        if (!categoryId) continue;
        const plannedAmount = totals[key] ?? config.limit ?? 0;
        items.push({
            budgetMonthId: budgetMonth.id,
            categoryId,
            plannedAmount
        });
    }

    if (items.length) {
        await prisma.budgetItem.createMany({ data: items });
    }
};

const seedDebts = async (userId) => {
    const debtMap = {};

    for (const debt of SEED_DEBTS) {
        const existing = await prisma.debt.findFirst({
            where: { userId, name: debt.name }
        });

        if (existing) {
            debtMap[debt.key] = existing.id;
            continue;
        }

        const monthStart = toMonthStart();
        const nextPaymentDate = debt.nextPaymentDay
            ? new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), debt.nextPaymentDay))
            : null;

        const created = await prisma.debt.create({
            data: {
                userId,
                name: debt.name,
                type: debt.type,
                principal: debt.principal,
                balance: debt.balance,
                interestRate: debt.interestRate,
                startDate: debt.startDate,
                termMonths: debt.termMonths,
                nextPaymentDate,
                status: 'active'
            }
        });
        debtMap[debt.key] = created.id;
    }

    return debtMap;
};

const seedScheduleItems = async (userId, categoryMap, debtMap) => {
    const existingCount = await prisma.scheduleItem.count({
        where: { userId }
    });
    if (existingCount > 0) return;

    const monthStart = toMonthStart();
    const monthYear = monthStart.getUTCFullYear();
    const monthIndex = monthStart.getUTCMonth();
    const scheduleItems = [];

    for (const item of BASE_TRANSACTIONS) {
        if (!item.recurring || !item.day) continue;
        const dueDate = new Date(Date.UTC(monthYear, monthIndex, item.day));
        scheduleItems.push({
            userId,
            title: item.name,
            amountUSD: item.amountUSD,
            type: item.type,
            dueDate,
            recurrence: 'monthly',
            status: 'pending',
            categoryId: categoryMap[item.categoryKey],
            debtId: item.debtKey ? debtMap[item.debtKey] : null
        });
    }

    const loanItem = SEED_DEBTS.find((item) => item.key === 'client');
    if (loanItem) {
        const dueDate = new Date(Date.UTC(monthYear, monthIndex, loanItem.nextPaymentDay));
        scheduleItems.push({
            userId,
            title: `${loanItem.name} платеж`,
            amountUSD: loanItem.monthlyPaymentUSD,
            type: loanItem.type === 'loan' ? 'income' : 'expense',
            dueDate,
            recurrence: 'monthly',
            status: 'pending',
            categoryId: categoryMap[loanItem.categoryKey] || null,
            debtId: debtMap[loanItem.key]
        });
    }

    if (scheduleItems.length) {
        await prisma.scheduleItem.createMany({
            data: scheduleItems
        });
    }
};

const seedAdminUser = async () => {
    try {
        const email = 'moisey.vasilenko.abi@gmail.com';
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log('Seeding admin user...');
            const passwordHash = await bcrypt.hash('Moses2000nsu!', 10);

            user = await prisma.user.create({
                data: {
                    email,
                    name: 'Moisey Vasilenko',
                    passwordHash
                }
            });
        }

        const categoryMap = await buildCategoryMap(user.id);
        await seedMonthlyTransactions(user.id, categoryMap);
        await seedFebruaryBudget(user.id, categoryMap);
        const debtMap = await seedDebts(user.id);
        await seedScheduleItems(user.id, categoryMap, debtMap);

        console.log('Admin user seed ensured.');
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

        // Seed default categories for new user (Base Set)
        for (const config of Object.values(CATEGORY_CONFIG)) {
            await prisma.category.create({
                data: {
                    userId: user.id,
                    label: config.label,
                    color: config.color,
                    limit: config.limit,
                    type: config.type
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

// Dashboard Overview (Monthly)
app.get('/api/overview', authenticateToken, async (req, res) => {
    try {
        const monthStart = toMonthStart(req.query.month);
        const { start, end } = getMonthRange(monthStart);

        const [transactions, categories, budgetMonth, scheduleItems] = await Promise.all([
            prisma.expense.findMany({
                where: { userId: req.user.id, date: { gte: start, lt: end } },
                include: { category: true }
            }),
            prisma.category.findMany({
                where: { userId: req.user.id }
            }),
            prisma.budgetMonth.findUnique({
                where: { userId_month: { userId: req.user.id, month: monthStart } },
                include: { items: { include: { category: true } } }
            }),
            prisma.scheduleItem.findMany({
                where: { userId: req.user.id, dueDate: { gte: start, lt: end } },
                include: { category: true, debt: true },
                orderBy: { dueDate: 'asc' }
            })
        ]);

        res.json({
            month: toMonthKey(monthStart),
            transactions,
            categories,
            budget: budgetMonth
                ? {
                    id: budgetMonth.id,
                    month: toMonthKey(monthStart),
                    incomePlanned: budgetMonth.incomePlanned,
                    items: budgetMonth.items
                }
                : {
                    id: null,
                    month: toMonthKey(monthStart),
                    incomePlanned: 0,
                    items: []
                },
            schedule: scheduleItems
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Add Expense (Protected)
app.post('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const { amountUSD, description, categoryId, date, type } = req.body;
        const expense = await prisma.expense.create({
            data: {
                userId: req.user.id,
                amountUSD: parseFloat(amountUSD),
                description,
                categoryId,
                date: new Date(date),
                type: type || 'expense'
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

// Get Monthly Budget
app.get('/api/budgets', authenticateToken, async (req, res) => {
    try {
        const monthStart = toMonthStart(req.query.month);
        const budgetMonth = await prisma.budgetMonth.findUnique({
            where: { userId_month: { userId: req.user.id, month: monthStart } },
            include: { items: { include: { category: true } } }
        });

        if (!budgetMonth) {
            return res.json({
                id: null,
                month: toMonthKey(monthStart),
                incomePlanned: 0,
                items: []
            });
        }

        res.json({
            id: budgetMonth.id,
            month: toMonthKey(monthStart),
            incomePlanned: budgetMonth.incomePlanned,
            items: budgetMonth.items
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Monthly Budget Income
app.put('/api/budgets/income', authenticateToken, async (req, res) => {
    try {
        const { month, incomePlanned } = req.body;
        const monthStart = toMonthStart(month);

        const budgetMonth = await prisma.budgetMonth.upsert({
            where: { userId_month: { userId: req.user.id, month: monthStart } },
            update: { incomePlanned: parseFloat(incomePlanned || 0) },
            create: {
                userId: req.user.id,
                month: monthStart,
                incomePlanned: parseFloat(incomePlanned || 0)
            }
        });

        res.json({
            id: budgetMonth.id,
            month: toMonthKey(monthStart),
            incomePlanned: budgetMonth.incomePlanned
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Monthly Budget Item
app.put('/api/budgets/item', authenticateToken, async (req, res) => {
    try {
        const { month, categoryId, plannedAmount } = req.body;
        const monthStart = toMonthStart(month);

        const budgetMonth = await prisma.budgetMonth.upsert({
            where: { userId_month: { userId: req.user.id, month: monthStart } },
            update: {},
            create: {
                userId: req.user.id,
                month: monthStart,
                incomePlanned: 0
            }
        });

        const updatedItem = await prisma.budgetItem.upsert({
            where: {
                budgetMonthId_categoryId: {
                    budgetMonthId: budgetMonth.id,
                    categoryId
                }
            },
            update: { plannedAmount: parseFloat(plannedAmount || 0) },
            create: {
                budgetMonthId: budgetMonth.id,
                categoryId,
                plannedAmount: parseFloat(plannedAmount || 0)
            },
            include: { category: true }
        });

        res.json(updatedItem);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Category Limit/Color
app.put('/api/categories/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { label, color, limit, type } = req.body;

        // Ensure user owns the category
        const category = await prisma.category.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!category) return res.sendStatus(404);

        const updated = await prisma.category.update({
            where: { id },
            data: { label, color, limit: parseFloat(limit || 0), type }
        });
        res.json(updated);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// --- SCHEDULE ---

// Get Schedule Items
app.get('/api/schedules', authenticateToken, async (req, res) => {
    try {
        const { month, status, from, to } = req.query;
        const where = { userId: req.user.id };

        if (status) where.status = status;

        if (month) {
            const monthStart = toMonthStart(month);
            const { start, end } = getMonthRange(monthStart);
            where.dueDate = { gte: start, lt: end };
        } else if (from || to) {
            where.dueDate = {};
            if (from) where.dueDate.gte = new Date(from);
            if (to) where.dueDate.lt = new Date(to);
        }

        const items = await prisma.scheduleItem.findMany({
            where,
            include: { category: true, debt: true },
            orderBy: { dueDate: 'asc' }
        });
        res.json(items);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create Schedule Item
app.post('/api/schedules', authenticateToken, async (req, res) => {
    try {
        const { title, amountUSD, type, dueDate, recurrence, categoryId, debtId, status } = req.body;
        const item = await prisma.scheduleItem.create({
            data: {
                userId: req.user.id,
                title,
                amountUSD: parseFloat(amountUSD),
                type: type || 'expense',
                dueDate: new Date(dueDate),
                recurrence: recurrence || 'once',
                status: status || 'pending',
                categoryId: categoryId || null,
                debtId: debtId || null
            }
        });
        res.json(item);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Schedule Item
app.put('/api/schedules/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amountUSD, type, dueDate, recurrence, categoryId, debtId, status } = req.body;

        const existing = await prisma.scheduleItem.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!existing) return res.sendStatus(404);

        const updated = await prisma.scheduleItem.update({
            where: { id },
            data: {
                title: title ?? existing.title,
                amountUSD: amountUSD !== undefined ? parseFloat(amountUSD) : existing.amountUSD,
                type: type || existing.type,
                dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
                recurrence: recurrence || existing.recurrence,
                status: status || existing.status,
                categoryId: categoryId === '' ? null : categoryId ?? existing.categoryId,
                debtId: debtId === '' ? null : debtId ?? existing.debtId
            }
        });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete Schedule Item
app.delete('/api/schedules/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.scheduleItem.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!existing) return res.sendStatus(404);

        await prisma.scheduleItem.delete({ where: { id } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- DEBTS ---

// Get Debts
app.get('/api/debts', authenticateToken, async (req, res) => {
    try {
        const debts = await prisma.debt.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(debts);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create Debt
app.post('/api/debts', authenticateToken, async (req, res) => {
    try {
        const {
            name,
            type,
            principal,
            balance,
            interestRate,
            startDate,
            termMonths,
            nextPaymentDate,
            monthlyPaymentUSD,
            categoryId
        } = req.body;

        const parsedPrincipal = parseFloat(principal || 0);
        const parsedBalance = balance !== undefined && balance !== '' ? parseFloat(balance) : parsedPrincipal;

        const debt = await prisma.debt.create({
            data: {
                userId: req.user.id,
                name,
                type: type || 'debt',
                principal: parsedPrincipal,
                balance: parsedBalance,
                interestRate: parseFloat(interestRate || 0),
                startDate: startDate ? new Date(startDate) : new Date(),
                termMonths: termMonths ? parseInt(termMonths, 10) : null,
                nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : null,
                status: 'active'
            }
        });

        if (monthlyPaymentUSD && nextPaymentDate) {
            await prisma.scheduleItem.create({
                data: {
                    userId: req.user.id,
                    title: `${name} платеж`,
                    amountUSD: parseFloat(monthlyPaymentUSD),
                    type: type === 'loan' ? 'income' : 'expense',
                    dueDate: new Date(nextPaymentDate),
                    recurrence: 'monthly',
                    status: 'pending',
                    categoryId: categoryId || null,
                    debtId: debt.id
                }
            });
        }

        res.json(debt);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Debt
app.put('/api/debts/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            type,
            principal,
            balance,
            interestRate,
            startDate,
            termMonths,
            nextPaymentDate,
            status
        } = req.body;

        const existing = await prisma.debt.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!existing) return res.sendStatus(404);

        const parsedPrincipal = principal !== undefined && principal !== '' ? parseFloat(principal) : existing.principal;
        const parsedBalance = balance !== undefined && balance !== '' ? parseFloat(balance) : existing.balance;
        const parsedRate = interestRate !== undefined && interestRate !== '' ? parseFloat(interestRate) : existing.interestRate;

        const updated = await prisma.debt.update({
            where: { id },
            data: {
                name: name ?? existing.name,
                type: type ?? existing.type,
                principal: parsedPrincipal,
                balance: parsedBalance,
                interestRate: parsedRate,
                startDate: startDate ? new Date(startDate) : existing.startDate,
                termMonths: termMonths ? parseInt(termMonths, 10) : existing.termMonths,
                nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : existing.nextPaymentDate,
                status: status ?? existing.status
            }
        });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete Debt
app.delete('/api/debts/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.debt.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!existing) return res.sendStatus(404);

        await prisma.debt.delete({ where: { id } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- NOTIFICATIONS ---

app.get('/api/notifications/upcoming', authenticateToken, async (req, res) => {
    try {
        const days = parseInt(req.query.days, 10) || 7;
        const now = new Date();
        const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const items = await prisma.scheduleItem.findMany({
            where: {
                userId: req.user.id,
                status: 'pending',
                dueDate: { gte: now, lte: end }
            },
            include: { category: true, debt: true },
            orderBy: { dueDate: 'asc' }
        });

        res.json({ days, items });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- EXPENSES ---

// Update Expense
app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { amountUSD, description, categoryId, date, type } = req.body;

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
                date: new Date(date),
                type: type || 'expense'
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
