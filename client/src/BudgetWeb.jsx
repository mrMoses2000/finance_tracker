import React, { useState, useEffect } from 'react';
import Header from './components/Budget/Header';
import KPICards from './components/Budget/KPICards';
import ExpenseChart from './components/Budget/ExpenseChart';
import ExpenseCalendar from './components/Budget/ExpenseCalendar';
import CategoryList from './components/Budget/CategoryList';
import { useBudget } from './hooks/useBudget';
import { useLanguage } from './context/LanguageContext';

import {
    RATES,
    SYMBOLS,
    CATEGORY_CONFIG,
    INCOME_USD
} from './data/budgetData';

const BudgetWeb = () => {
    const { t, lang } = useLanguage();
    // --- STATE ---
    const [mode, setMode] = useState(() => localStorage.getItem('budget_mode') || 'standard');
    const [currency, setCurrency] = useState(() => localStorage.getItem('budget_currency') || 'RUB');

    // --- DATA ---
    const { data, isLoading, isError } = useBudget();

    useEffect(() => { localStorage.setItem('budget_mode', mode); }, [mode]);
    useEffect(() => { localStorage.setItem('budget_currency', currency); }, [currency]);

    if (isLoading) return <div className="flex h-screen items-center justify-center text-indigo-400"><div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full" /></div>;
    if (isError) return <div className="p-10 text-center text-rose-400">Error loading data.</div>;

    // --- LOGIC ---
    const allExpenses = data?.standard || [];

    let currentData = allExpenses;
    if (mode === 'february') {
        currentData = allExpenses.filter(i =>
            i.description.includes('Алматы') ||
            i.description.includes('Февраль') ||
            (i.date && new Date(i.date).getDate() <= 28)
        );
        if (currentData.length === 0) currentData = allExpenses;
    } else {
        currentData = allExpenses.filter(i => !i.description.includes('Алматы'));
    }

    const convert = (valUSD) => Math.round(valUSD * RATES[currency]);

    const formatMoney = (valUSD) => {
        return new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US').format(convert(valUSD)) + ' ' + SYMBOLS[currency];
    };

    const totalExpenses = currentData.reduce((acc, i) => acc + i.amountUSD, 0);
    const deficit = INCOME_USD - totalExpenses;

    const expensesByCategory = {};
    currentData.forEach(item => {
        const catLabel = item.category?.label || 'Other';
        if (!expensesByCategory[catLabel]) expensesByCategory[catLabel] = 0;
        expensesByCategory[catLabel] += item.amountUSD;
    });

    const chartData = Object.entries(expensesByCategory).map(([label, value]) => {
        const configEntry = Object.values(CATEGORY_CONFIG).find(c => c.label === label);
        return {
            label: label,
            value: value,
            color: configEntry?.color || '#cbd5e1',
            percent: (value / totalExpenses) * 100
        };
    }).filter(i => i.value > 0);

    const calendarItems = [...currentData].sort((a, b) => new Date(a.date).getDate() - new Date(b.date).getDate());

    return (
        <div className="min-h-screen pb-20">
            <Header
                mode={mode}
                setMode={setMode}
                currency={currency}
                setCurrency={setCurrency}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 space-y-8 relative z-10">
                <KPICards
                    totalExpenses={totalExpenses}
                    income={INCOME_USD}
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
                        categoryConfig={CATEGORY_CONFIG}
                        currentData={currentData}
                        formatMoney={formatMoney}
                        t={t}
                    />
                </div>

                <ExpenseCalendar
                    calendarItems={calendarItems}
                    categoryConfig={CATEGORY_CONFIG}
                    formatMoney={formatMoney}
                    t={t}
                />
            </div>
        </div>
    );
};

export default BudgetWeb;
