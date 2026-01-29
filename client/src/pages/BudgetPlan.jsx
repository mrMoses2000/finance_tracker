import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, ChevronLeft, ChevronRight, AlertTriangle, Trash2 } from 'lucide-react';
import { useLanguage, getCategoryLabel } from '../context/LanguageContext';
import { useBudgetMonth } from '../hooks/useBudgetMonth';
import { useCurrency } from '../context/CurrencyContext';
import ExpenseChart from '../components/Budget/ExpenseChart';
import CategoryManager from '../components/Categories/CategoryManager';

const BudgetPlan = () => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const { t, lang } = useLanguage();
    const { month, setMonth } = useBudgetMonth();
    const { currency, convert, formatMoney } = useCurrency();

    const toMonthLabel = (value) => {
        if (!value) return '';
        const date = new Date(`${value}-01T00:00:00Z`);
        return date.toLocaleDateString(
            lang === 'ru' ? 'ru-RU' : lang === 'de' ? 'de-DE' : 'en-US',
            { month: 'long', year: 'numeric' }
        );
    };

    const shiftMonth = (delta) => {
        if (!month) return;
        const [yearStr, monthStr] = month.split('-');
        const year = parseInt(yearStr, 10);
        const monthIndex = parseInt(monthStr, 10) - 1;
        const next = new Date(Date.UTC(year, monthIndex + delta, 1));
        const nextYear = next.getUTCFullYear();
        const nextMonth = String(next.getUTCMonth() + 1).padStart(2, '0');
        setMonth(`${nextYear}-${nextMonth}`);
    };

    const format = (value) => formatMoney(value, lang);

    const { data: categories, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } });
            return await res.json();
        }
    });

    const { data: budget, isLoading: isBudgetLoading } = useQuery({
        queryKey: ['budget', month],
        queryFn: async () => {
            const res = await fetch(`/api/budgets?month=${month}`, { headers: { Authorization: `Bearer ${token}` } });
            return await res.json();
        }
    });

    const itemMutation = useMutation({
        mutationFn: async ({ categoryId, plannedAmount, currency: payloadCurrency }) => {
            const res = await fetch('/api/budgets/item', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ month, categoryId, plannedAmount, currency: payloadCurrency })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['budget', month]);
            queryClient.invalidateQueries({ queryKey: ['budgetData', month] });
        }
    });

    const deleteItemMutation = useMutation({
        mutationFn: async ({ categoryId }) => {
            await fetch('/api/budgets/item', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ month, categoryId })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['budget', month]);
            queryClient.invalidateQueries({ queryKey: ['budgetData', month] });
        }
    });

    const incomeMutation = useMutation({
        mutationFn: async ({ incomePlanned, currency: payloadCurrency }) => {
            const res = await fetch('/api/budgets/income', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ month, incomePlanned, currency: payloadCurrency })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['budget', month]);
            queryClient.invalidateQueries({ queryKey: ['budgetData', month] });
        }
    });

    const [incomeValue, setIncomeValue] = useState(0);
    const [incomeDirty, setIncomeDirty] = useState(false);

    useEffect(() => {
        if (budget?.incomePlanned !== undefined) {
            setIncomeValue(convert(budget.incomePlanned));
            setIncomeDirty(false);
        }
    }, [budget?.incomePlanned, convert]);

    const budgetItemsByCategory = useMemo(() => new Map(
        (budget?.items || []).map((item) => [item.categoryId, item])
    ), [budget?.items]);

    const expenseCategories = (categories || []).filter((cat) => cat.type !== 'income');

    const plannedExpensesTotal = (budget?.items || []).reduce((acc, item) => acc + (item.plannedAmount || 0), 0);
    const plannedBalance = (budget?.incomePlanned || 0) - plannedExpensesTotal;

    const chartDataPlanned = useMemo(() => {
        const byCategory = {};
        (budget?.items || []).forEach((item) => {
            const category = categories?.find((cat) => cat.id === item.categoryId);
            if (!category) return;
            const label = getCategoryLabel(category, t);
            byCategory[label] = (byCategory[label] || 0) + (item.plannedAmount || 0);
        });
        return Object.entries(byCategory).map(([label, value]) => {
            const category = categories?.find((cat) => getCategoryLabel(cat, t) === label);
            return {
                label,
                value,
                color: category?.color || '#cbd5e1',
                percent: plannedExpensesTotal > 0 ? (value / plannedExpensesTotal) * 100 : 0
            };
        });
    }, [budget?.items, categories, plannedExpensesTotal, t]);

    const isLoading = isCategoriesLoading || isBudgetLoading;

    if (isLoading) return <Loader2 className="animate-spin text-emerald-500 m-8" />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{t?.budget_plan?.title}</h1>
                    <p className="text-slate-400 text-sm sm:text-base">{t?.budget_plan?.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 w-full lg:w-auto justify-between">
                    <button
                        onClick={() => shiftMonth(-1)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        aria-label={t?.month?.prev || 'Previous month'}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div className="relative">
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            aria-label={t?.month?.picker || 'Pick month'}
                        />
                        <div className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-white min-w-[120px] sm:min-w-[160px] text-center">
                            {toMonthLabel(month)}
                        </div>
                    </div>
                    <button
                        onClick={() => shiftMonth(1)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        aria-label={t?.month?.next || 'Next month'}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-white">{t?.budget_plan?.income_title || 'Planned Income'}</h3>
                        <p className="text-slate-400 text-sm">{t?.budget_plan?.income_subtitle || 'Set the monthly target for income.'}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <input
                            type="number"
                            value={incomeValue}
                            onChange={(e) => { setIncomeValue(e.target.value); setIncomeDirty(true); }}
                            className="bg-transparent text-2xl sm:text-3xl font-mono font-bold text-white border-b border-white/10 focus:border-emerald-500 outline-none w-full transition-colors pb-1 text-right"
                        />
                        <span className="text-slate-400 text-sm">{currency}</span>
                        {incomeDirty && (
                            <button
                                onClick={() => incomeMutation.mutate({ incomePlanned: incomeValue, currency })}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600/20 text-emerald-200 hover:bg-emerald-600/30 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-emerald-500/20"
                            >
                                <Save size={16} />
                                {t?.budget_plan?.save_changes}
                            </button>
                        )}
                    </div>
                </div>

                <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">{t?.budget_plan?.summary_title || 'Plan Summary'}</div>
                        <div className="text-xl sm:text-2xl font-bold text-white">{format(plannedExpensesTotal)}</div>
                        <div className="text-sm text-slate-400">{t?.budget_plan?.summary_subtitle || 'Total planned expenses'}</div>
                    </div>
                    <div className={`mt-4 p-3 rounded-xl border ${plannedBalance < 0 ? 'border-rose-500/40 bg-rose-500/10' : 'border-emerald-500/40 bg-emerald-500/10'}`}>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">{t?.budget_plan?.balance || 'Balance'}</div>
                        <div className={`text-lg sm:text-xl font-bold ${plannedBalance < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                            {format(plannedBalance)}
                        </div>
                        {plannedBalance < 0 && (
                            <div className="mt-2 text-xs text-rose-200 flex items-center gap-2">
                                <AlertTriangle size={14} />
                                {t?.budget_plan?.balance_warning || 'Planned expenses exceed income.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpenseChart
                    totalExpenses={plannedExpensesTotal}
                    chartData={chartDataPlanned}
                    formatMoney={format}
                    t={t}
                    title={t?.chart?.title_plan || t?.chart?.title}
                />
                <div className="glass-panel rounded-2xl p-6">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-4">{t?.budget_plan?.limits_title || 'Monthly Limits'}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {expenseCategories?.map(cat => (
                            <CategoryLimitCard
                                key={cat.id}
                                category={cat}
                                plannedAmount={budgetItemsByCategory.get(cat.id)?.plannedAmount ?? cat.limit ?? 0}
                                hasItem={budgetItemsByCategory.has(cat.id)}
                                onSave={itemMutation.mutate}
                                onDelete={deleteItemMutation.mutate}
                                t={t}
                                convert={convert}
                                currency={currency}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <CategoryManager
                categories={categories || []}
                title={t?.category_manager?.title || 'Manage Categories'}
                subtitle={t?.category_manager?.subtitle || 'Add, edit, or remove categories for planning and operations.'}
            />
        </div>
    );
};

const CategoryLimitCard = ({ category, plannedAmount, hasItem, onSave, onDelete, t, convert, currency }) => {
    const [limit, setLimit] = useState(convert(plannedAmount));
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setLimit(convert(plannedAmount));
        setIsDirty(false);
    }, [plannedAmount, convert]);

    const handleSave = () => {
        onSave({ categoryId: category.id, plannedAmount: limit, currency });
        setIsDirty(false);
    };

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 sm:p-6 backdrop-blur-sm hover:bg-slate-900/80 transition-colors ring-1 ring-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full shadow-sm shadow-emerald-500/50" style={{ backgroundColor: category.color }}></div>
                <h3 className="font-bold text-base sm:text-lg text-slate-100">{getCategoryLabel(category, t)}</h3>
            </div>

            <div className="relative">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">{t?.budget_plan?.monthly_limit}</label>
                <div className="text-[11px] text-slate-500 mb-2">{t?.budget_plan?.default_limit || 'Default'}: {convert(category.limit)} {currency}</div>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => { setLimit(e.target.value); setIsDirty(true); }}
                        className="bg-transparent text-xl font-mono font-bold text-white border-b border-white/10 focus:border-emerald-500 outline-none w-full transition-colors pb-1"
                    />
                    <span className="text-slate-400 text-xs">{currency}</span>
                </div>
            </div>

            {isDirty && (
                <div className="mt-4 flex flex-col gap-2">
                    <button
                        onClick={handleSave}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600/20 text-emerald-200 hover:bg-emerald-600/30 py-2 rounded-lg text-sm font-bold transition-all border border-emerald-500/20"
                    >
                        <Save size={16} />
                        {t?.budget_plan?.save_changes}
                    </button>
                    {hasItem && (
                        <button
                            onClick={() => onDelete({ categoryId: category.id })}
                            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 py-2 rounded-lg text-sm font-bold transition-all border border-rose-500/30"
                        >
                            <Trash2 size={16} />
                            {t?.budget_plan?.remove || 'Remove'}
                        </button>
                    )}
                </div>
            )}
            {!isDirty && hasItem && (
                <button
                    onClick={() => onDelete({ categoryId: category.id })}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 py-2 rounded-lg text-sm font-bold transition-all border border-rose-500/30"
                >
                    <Trash2 size={16} />
                    {t?.budget_plan?.remove || 'Remove'}
                </button>
            )}
        </div>
    );
};

export default BudgetPlan;
