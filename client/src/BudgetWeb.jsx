import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Budget/Header';
import KPICards from './components/Budget/KPICards';
import ExpenseChart from './components/Budget/ExpenseChart';
import ExpenseCalendar from './components/Budget/ExpenseCalendar';
import CategoryList from './components/Budget/CategoryList';
import PlanCategoryList from './components/Budget/PlanCategoryList';
import { useBudget } from './hooks/useBudget';
import { useBudgetMonth } from './hooks/useBudgetMonth';
import { useLanguage, getCategoryLabel } from './context/LanguageContext';
import { useCurrency } from './context/CurrencyContext';
import { AlertTriangle, Sparkles } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('BudgetWeb Error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-10">
                    <div className="bg-rose-500/10 border border-rose-500 p-6 rounded-xl max-w-2xl w-full text-white">
                        <h2 className="text-2xl font-bold mb-4 text-rose-400">Something went wrong in the Dashboard</h2>
                        <div className="bg-black/50 p-4 rounded-lg font-mono text-xs overflow-auto mb-4 border border-white/5">
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </div>
                        <p className="text-slate-400">Please provide this error to the developer.</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const DashboardContent = () => {
    const { t, lang } = useLanguage();
    const { month, setMonth } = useBudgetMonth();
    const { currency, setCurrency, formatMoney } = useCurrency();
    const [view, setView] = useState(() => localStorage.getItem('dashboard_view') || 'actual');

    const { data, isLoading, isError } = useBudget(month);

    useEffect(() => {
        localStorage.setItem('dashboard_view', view);
    }, [view]);

    if (isLoading) return <div className="flex h-screen items-center justify-center text-emerald-400"><div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full" /></div>;
    if (isError) return <div className="p-10 text-center text-rose-400">Error loading data.</div>;

    const transactions = data?.transactions || [];
    const scheduleItems = data?.schedule || [];
    const categories = data?.categories || [];
    const budget = data?.budget || { incomePlanned: 0, items: [] };

    const expenses = transactions.filter((item) => item.type !== 'income');
    const incomes = transactions.filter((item) => item.type === 'income');

    const totalExpenses = expenses.reduce((acc, i) => acc + i.amountUSD, 0);
    const totalIncome = incomes.reduce((acc, i) => acc + i.amountUSD, 0);

    const plannedIncomeValue = budget?.incomePlanned !== null && budget?.incomePlanned !== undefined
        ? budget.incomePlanned
        : totalIncome;
    const plannedExpensesTotal = (budget?.items || []).reduce((acc, item) => acc + (item.plannedAmount || 0), 0);

    const actualBalance = totalIncome - totalExpenses;
    const plannedBalance = plannedIncomeValue - plannedExpensesTotal;

    const format = (value) => formatMoney(value, lang);

    const categoryMaps = useMemo(() => {
        const plannedMap = new Map();
        const actualMap = new Map();
        const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

        (budget?.items || []).forEach((item) => {
            if (!item.categoryId) return;
            plannedMap.set(item.categoryId, item.plannedAmount || 0);
        });

        expenses.forEach((item) => {
            const categoryId = item.categoryId || item.category?.id;
            if (!categoryId) return;
            actualMap.set(categoryId, (actualMap.get(categoryId) || 0) + item.amountUSD);
        });

        return { plannedMap, actualMap, categoryMap };
    }, [budget?.items, categories, expenses]);

    const chartDataActual = useMemo(() => {
        const byCategory = {};
        expenses.forEach((item) => {
            const label = getCategoryLabel(item.category, t) || 'Other';
            if (!byCategory[label]) byCategory[label] = 0;
            byCategory[label] += item.amountUSD;
        });

        return Object.entries(byCategory)
            .map(([label, value]) => {
                const configEntry = categories.find((c) => getCategoryLabel(c, t) === label);
                return {
                    label,
                    value,
                    color: configEntry?.color || '#cbd5e1',
                    percent: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0
                };
            })
            .filter((item) => item.value > 0);
    }, [expenses, categories, totalExpenses, t]);

    const chartDataPlanned = useMemo(() => {
        const byCategory = {};
        (budget?.items || []).forEach((item) => {
            const category = categories.find((cat) => cat.id === item.categoryId);
            if (!category) return;
            const label = getCategoryLabel(category, t);
            byCategory[label] = (byCategory[label] || 0) + (item.plannedAmount || 0);
        });

        return Object.entries(byCategory)
            .map(([label, value]) => {
                const configEntry = categories.find((c) => getCategoryLabel(c, t) === label);
                return {
                    label,
                    value,
                    color: configEntry?.color || '#cbd5e1',
                    percent: plannedExpensesTotal > 0 ? (value / plannedExpensesTotal) * 100 : 0
                };
            })
            .filter((item) => item.value > 0);
    }, [budget?.items, categories, plannedExpensesTotal, t]);

    const warningCategories = useMemo(() => {
        const warnings = [];
        categories.forEach((cat) => {
            if (cat.type === 'income') return;
            const planned = categoryMaps.plannedMap.get(cat.id) ?? cat.limit ?? 0;
            const actual = categoryMaps.actualMap.get(cat.id) ?? 0;
            if (planned > 0 && actual / planned >= 0.9) {
                warnings.push({ label: cat.label, planned, actual, color: cat.color });
            }
        });
        return warnings;
    }, [categories, categoryMaps]);

    const budgetUsage = plannedExpensesTotal > 0 ? totalExpenses / plannedExpensesTotal : null;
    const variance = plannedExpensesTotal > 0 ? totalExpenses - plannedExpensesTotal : null;

    const normalizedSchedule = scheduleItems.map((item) => ({
        id: `schedule-${item.id}`,
        date: item.dueDate,
        description: item.title,
        amountUSD: item.amountUSD,
        category: item.category,
        categoryId: item.categoryId,
        type: item.type,
        status: item.status,
        isPlanned: true
    }));

    const normalizedTransactions = transactions.map((item) => ({
        ...item,
        isPlanned: false
    }));

    // Combine transactions and schedule, then deduplicate
    // Prefer actual transactions (isPlanned: false) over planned ones
    const combinedItems = [...normalizedTransactions, ...normalizedSchedule]
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Deduplicate by content (description + date + amount)
    const seenContent = new Set();
    const calendarItemsActual = combinedItems.filter((item) => {
        const dateStr = new Date(item.date).toISOString().split('T')[0];
        const amountRounded = Math.round((item.amountUSD || 0) * 100);
        const contentKey = `${item.description}-${dateStr}-${amountRounded}`;

        if (seenContent.has(contentKey)) return false;
        seenContent.add(contentKey);
        return true;
    });

    const calendarItemsPlan = [...normalizedSchedule]
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const kpiLabelsActual = {
        expenses: t?.kpi?.actual_expenses || 'Actual Expenses',
        income: t?.kpi?.actual_income || 'Actual Income',
        balance: t?.kpi?.balance || 'Balance'
    };

    const kpiLabelsPlanned = {
        expenses: t?.kpi?.planned_expenses || 'Planned Expenses',
        income: t?.kpi?.planned_income || 'Planned Income',
        balance: t?.kpi?.planned_balance || 'Planned Balance'
    };

    return (
        <div className="min-h-screen pb-20">
            <Header
                month={month}
                setMonth={setMonth}
                currency={currency}
                setCurrency={setCurrency}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 space-y-8 relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                        <button
                            onClick={() => setView('actual')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${view === 'actual'
                                ? 'bg-white/10 text-white'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {t?.dashboard?.tabs?.actual || 'Actual'}
                        </button>
                        <button
                            onClick={() => setView('plan')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${view === 'plan'
                                ? 'bg-white/10 text-white'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {t?.dashboard?.tabs?.plan || 'Plan'}
                        </button>
                    </div>

                    {view === 'plan' && (
                        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                            <Sparkles size={14} />
                            <span>{t?.dashboard?.plan_hint || 'Edit limits in the Budget tab to shape this view.'}</span>
                        </div>
                    )}
                </div>

                {view === 'actual' ? (
                    <>
                        <KPICards
                            totalExpenses={totalExpenses}
                            income={totalIncome}
                            deficit={actualBalance}
                            formatMoney={format}
                            labels={kpiLabelsActual}
                        />

                        {plannedExpensesTotal > 0 && (
                            <div className="glass-panel p-6 rounded-2xl border border-white/10">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">
                                            {t?.dashboard?.budget_usage || 'Budget Usage'}
                                        </div>
                                        <div className="text-lg font-bold text-white">
                                            {t?.dashboard?.budget_usage_detail
                                                ? t.dashboard.budget_usage_detail.replace('{percent}', Math.round((budgetUsage || 0) * 100))
                                                : `Used ${Math.round((budgetUsage || 0) * 100)}% of plan`}
                                        </div>
                                        {warningCategories.length > 0 && (
                                            <div className="mt-3 text-sm text-amber-200 flex items-center gap-2">
                                                <AlertTriangle size={16} />
                                                {t?.dashboard?.budget_warning || 'You are close to exceeding the limit in:'}
                                                <span className="font-semibold">
                                                    {warningCategories.map((item) => item.label).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {variance !== null && (
                                        <div className="text-right">
                                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">
                                                {t?.dashboard?.variance || 'Variance'}
                                            </div>
                                            <div className={`text-2xl font-bold ${variance > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                                                {variance > 0 ? '+' : ''}{format(variance)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${budgetUsage && budgetUsage >= 1 ? 'bg-rose-400' : 'bg-emerald-400'}`}
                                        style={{ width: `${Math.min((budgetUsage || 0) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ExpenseChart
                                totalExpenses={totalExpenses}
                                chartData={chartDataActual}
                                formatMoney={format}
                                t={t}
                                title={t?.chart?.title_actual || t?.chart?.title}
                            />
                            <CategoryList
                                categories={categories}
                                budgetItems={budget?.items || []}
                                transactions={expenses}
                                formatMoney={format}
                                t={t}
                            />
                        </div>

                        <ExpenseCalendar
                            calendarItems={calendarItemsActual}
                            categories={categories}
                            formatMoney={format}
                            t={t}
                            lang={lang}
                            variant="actual"
                        />
                    </>
                ) : (
                    <>
                        <KPICards
                            totalExpenses={plannedExpensesTotal}
                            income={plannedIncomeValue}
                            deficit={plannedBalance}
                            formatMoney={format}
                            labels={kpiLabelsPlanned}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ExpenseChart
                                totalExpenses={plannedExpensesTotal}
                                chartData={chartDataPlanned}
                                formatMoney={format}
                                t={t}
                                title={t?.chart?.title_plan || t?.chart?.title}
                            />
                            <PlanCategoryList
                                categories={categories}
                                budgetItems={budget?.items || []}
                                formatMoney={format}
                                t={t}
                                plannedTotal={plannedExpensesTotal}
                            />
                        </div>

                        <ExpenseCalendar
                            calendarItems={calendarItemsPlan}
                            categories={categories}
                            formatMoney={format}
                            t={t}
                            lang={lang}
                            variant="plan"
                        />
                    </>
                )}
            </div>
        </div>
    );
};

const BudgetWeb = () => (
    <ErrorBoundary>
        <DashboardContent />
    </ErrorBoundary>
);

export default BudgetWeb;
