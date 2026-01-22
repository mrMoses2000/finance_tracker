import React, { useState, useEffect } from 'react';
import Header from './components/Budget/Header';
import KPICards from './components/Budget/KPICards';
import ExpenseChart from './components/Budget/ExpenseChart';
import ExpenseCalendar from './components/Budget/ExpenseCalendar';
import CategoryList from './components/Budget/CategoryList';
import { useBudget } from './hooks/useBudget';
import { useBudgetMonth } from './hooks/useBudgetMonth';
import { useLanguage } from './context/LanguageContext';

import {
    RATES,
    SYMBOLS
} from './data/budgetData';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("BudgetWeb Error:", error, errorInfo);
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
    // --- STATE ---
    const { month, setMonth } = useBudgetMonth();
    const [currency, setCurrency] = useState(() => localStorage.getItem('budget_currency') || 'RUB');

    // --- DATA ---
    const { data, isLoading, isError } = useBudget(month);
    useEffect(() => { localStorage.setItem('budget_currency', currency); }, [currency]);

    if (isLoading) return <div className="flex h-screen items-center justify-center text-indigo-400"><div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full" /></div>;
    if (isError) return <div className="p-10 text-center text-rose-400">Error loading data.</div>;

    // --- LOGIC ---
    const transactions = data?.transactions || [];
    const scheduleItems = data?.schedule || [];
    const categories = data?.categories || [];
    const budget = data?.budget || { incomePlanned: 0, items: [] };

    const expenses = transactions.filter((item) => item.type !== 'income');
    const incomes = transactions.filter((item) => item.type === 'income');

    const convert = (valUSD) => Math.round(valUSD * RATES[currency]);

    const formatMoney = (valUSD) => {
        return new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US').format(convert(valUSD)) + ' ' + SYMBOLS[currency];
    };

    const totalExpenses = expenses.reduce((acc, i) => acc + i.amountUSD, 0);
    const totalIncome = incomes.reduce((acc, i) => acc + i.amountUSD, 0);
    const plannedIncome = budget?.incomePlanned ?? totalIncome;
    const deficit = plannedIncome - totalExpenses;

    const expensesByCategory = {};
    expenses.forEach(item => {
        const catLabel = item.category?.label || 'Other';
        if (!expensesByCategory[catLabel]) expensesByCategory[catLabel] = 0;
        expensesByCategory[catLabel] += item.amountUSD;
    });

    const chartData = Object.entries(expensesByCategory).map(([label, value]) => {
        const configEntry = categories.find((c) => c.label === label);
        return {
            label: label,
            value: value,
            color: configEntry?.color || '#cbd5e1',
            percent: (value / totalExpenses) * 100
        };
    }).filter(i => i.value > 0);

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

    const calendarItems = [...normalizedTransactions, ...normalizedSchedule]
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="min-h-screen pb-20">
            <Header
                month={month}
                setMonth={setMonth}
                currency={currency}
                setCurrency={setCurrency}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 space-y-8 relative z-10">
                <KPICards
                    totalExpenses={totalExpenses}
                    income={plannedIncome}
                    deficit={deficit}
                    formatMoney={formatMoney}
                    t={t}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ExpenseChart
                        totalExpenses={totalExpenses}
                        chartData={chartData}
                        formatMoney={formatMoney}
                        t={t}
                    />
                    <CategoryList
                        categories={categories}
                        budgetItems={budget?.items || []}
                        transactions={expenses}
                        formatMoney={formatMoney}
                        t={t}
                    />
                </div>

                <ExpenseCalendar
                    calendarItems={calendarItems}
                    categories={categories}
                    formatMoney={formatMoney}
                    t={t}
                />
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
