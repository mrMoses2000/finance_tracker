import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import overviewRouter from './overview.js';
import expensesRouter from './expenses.js';
import categoriesRouter from './categories.js';
import budgetsRouter from './budgets.js';
import schedulesRouter from './schedules.js';
import debtsRouter from './debts.js';
import notificationsRouter from './notifications.js';
import profileRouter from './profile.js';

const router = Router();

router.use(requireAuth);

router.use(overviewRouter);
router.use(expensesRouter);
router.use(categoriesRouter);
router.use(budgetsRouter);
router.use(schedulesRouter);
router.use(debtsRouter);
router.use(notificationsRouter);
router.use(profileRouter);

export default router;
