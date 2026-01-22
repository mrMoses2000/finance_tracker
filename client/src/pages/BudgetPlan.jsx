import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, DollarSign, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useBudgetMonth } from '../hooks/useBudgetMonth';

const BudgetPlan = () => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const { t, lang } = useLanguage();
    const { month, setMonth } = useBudgetMonth();

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

    // Fetch Categories
    const { data: categories, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } });
            return await res.json();
        }
    });

    // Fetch Budget for Month
    const { data: budget, isLoading: isBudgetLoading } = useQuery({
        queryKey: ['budget', month],
        queryFn: async () => {
            const res = await fetch(`/api/budgets?month=${month}`, { headers: { Authorization: `Bearer ${token}` } });
            return await res.json();
        }
    });

    // Update Category Budget Item
    const itemMutation = useMutation({
        mutationFn: async ({ categoryId, plannedAmount }) => {
            const res = await fetch('/api/budgets/item', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ month, categoryId, plannedAmount })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['budget', month]);
        }
    });

    // Update Income Plan
    const incomeMutation = useMutation({
        mutationFn: async ({ incomePlanned }) => {
            const res = await fetch('/api/budgets/income', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ month, incomePlanned })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['budget', month]);
        }
    });

    const [incomeValue, setIncomeValue] = useState(0);
    const [incomeDirty, setIncomeDirty] = useState(false);

    useEffect(() => {
        if (budget?.incomePlanned !== undefined) {
            setIncomeValue(budget.incomePlanned);
            setIncomeDirty(false);
        }
    }, [budget?.incomePlanned]);

    const budgetItemsByCategory = new Map(
        (budget?.items || []).map((item) => [item.categoryId, item])
    );
    const expenseCategories = (categories || []).filter((cat) => cat.type !== 'income');

    const isLoading = isCategoriesLoading || isBudgetLoading;

    if (isLoading) return <Loader2 className="animate-spin text-indigo-500 m-8" />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t?.budget_plan?.title}</h1>
                    <p className="text-slate-400">{t?.budget_plan?.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
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
                        <div className="px-4 py-2 rounded-lg text-sm font-bold text-white min-w-[160px] text-center">
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

            <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white">{t?.budget_plan?.income_title || 'Planned Income'}</h3>
                    <p className="text-slate-400 text-sm">{t?.budget_plan?.income_subtitle || 'Set the monthly target for income.'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <DollarSign size={18} className="text-slate-500" />
                    <input
                        type="number"
                        value={incomeValue}
                        onChange={(e) => { setIncomeValue(e.target.value); setIncomeDirty(true); }}
                        className="bg-transparent text-xl font-mono font-bold text-white border-b border-white/10 focus:border-indigo-500 outline-none w-40 transition-colors pb-1 text-right"
                    />
                    {incomeDirty && (
                        <button
                            onClick={() => incomeMutation.mutate({ incomePlanned: incomeValue })}
                            className="flex items-center justify-center gap-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-indigo-500/20"
                        >
                            <Save size={16} />
                            {t?.budget_plan?.save_changes}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expenseCategories?.map(cat => (
                    <CategoryLimitCard
                        key={cat.id}
                        category={cat}
                        plannedAmount={budgetItemsByCategory.get(cat.id)?.plannedAmount ?? cat.limit ?? 0}
                        onSave={itemMutation.mutate}
                        t={t}
                    />
                ))}
            </div>
        </div>
    );
};

const CategoryLimitCard = ({ category, plannedAmount, onSave, t }) => {
    const [limit, setLimit] = useState(plannedAmount);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setLimit(plannedAmount);
        setIsDirty(false);
    }, [plannedAmount]);

    const handleSave = () => {
        onSave({ categoryId: category.id, plannedAmount: limit });
        setIsDirty(false);
    };

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm hover:bg-slate-900/80 transition-colors ring-1 ring-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full shadow-sm shadow-indigo-500/50" style={{ backgroundColor: category.color }}></div>
                <h3 className="font-bold text-lg text-slate-100">{category.label}</h3>
            </div>

            <div className="relative">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">{t?.budget_plan?.monthly_limit}</label>
                <div className="text-[11px] text-slate-500 mb-2">{t?.budget_plan?.default_limit || 'Default'}: {category.limit}</div>
                <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-slate-500" />
                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => { setLimit(e.target.value); setIsDirty(true); }}
                        className="bg-transparent text-xl font-mono font-bold text-white border-b border-white/10 focus:border-indigo-500 outline-none w-full transition-colors pb-1"
                    />
                </div>
            </div>

            {isDirty && (
                <button
                    onClick={handleSave}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 py-2 rounded-lg text-sm font-bold transition-all border border-indigo-500/20"
                >
                    <Save size={16} />
                    {t?.budget_plan?.save_changes}
                </button>
            )}
        </div>
    );
};

export default BudgetPlan;
