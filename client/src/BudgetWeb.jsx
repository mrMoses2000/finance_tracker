import React, { useState, useEffect } from 'react';
import Header from './components/Budget/Header';
import KPICards from './components/Budget/KPICards';
import ExpenseChart from './components/Budget/ExpenseChart';
import ExpenseCalendar from './components/Budget/ExpenseCalendar';
import CategoryList from './components/Budget/CategoryList';
import { useBudget } from './hooks/useBudget';

import {
    RATES,
    SYMBOLS,
    CATEGORY_CONFIG,
    INCOME_USD
} from './data/budgetData';

const BudgetWeb = () => {
    // --- STATE WITH PERSISTENCE ---
    const [mode, setMode] = useState(() => localStorage.getItem('budget_mode') || 'standard');
    const [currency, setCurrency] = useState(() => localStorage.getItem('budget_currency') || 'USD');

    // --- DATA FETCHING ---
    const { data, isLoading, isError } = useBudget();

    // Save to localStorage when changed
    useEffect(() => {
        localStorage.setItem('budget_mode', mode);
    }, [mode]);

    useEffect(() => {
        localStorage.setItem('budget_currency', currency);
    }, [currency]);

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
            </div>
        );
    }

    if (isError) {
        return <div className="p-8 text-center text-rose-600">Failed to load budget data.</div>;
    }

    // --- LOGIC ---
    // Now using data from the hook
    const currentData = mode === 'standard' ? data.standard : data.february;

    const convert = (valUSD) => Math.round(valUSD * RATES[currency]);

    const formatMoney = (valUSD) => {
        return new Intl.NumberFormat('ru-RU').format(convert(valUSD)) + ' ' + SYMBOLS[currency];
    };

    const getTotal = (cat) => currentData.filter(i => cat ? i.category === cat : true).reduce((acc, i) => acc + i.amountUSD, 0);

    const totalExpenses = getTotal();
    const deficit = INCOME_USD - totalExpenses;

    // Pie Chart Data
    const chartData = Object.keys(CATEGORY_CONFIG).map(key => {
        const value = getTotal(key);
        return {
            key,
            label: CATEGORY_CONFIG[key].label,
            value,
            color: CATEGORY_CONFIG[key].color,
            percent: (value / totalExpenses) * 100
        };
    }).filter(item => item.value > 0);

    // Gradient Segments (kept for backward compatibility if needed, but Chart uses Tremor now)
    let currentAngle = 0;
    const gradientSegments = chartData.map(item => {
        const start = currentAngle;
        const end = currentAngle + item.percent;
        currentAngle = end;
        return `${item.color} ${start}% ${end}%`;
    }).join(', ');

    const calendarItems = currentData.filter(i => i.day).sort((a, b) => a.day - b.day);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900 pb-20">

            <Header
                mode={mode}
                setMode={setMode}
                currency={currency}
                setCurrency={setCurrency}
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 space-y-8 relative z-20">

                <KPICards
                    totalExpenses={totalExpenses}
                    income={INCOME_USD}
                    deficit={deficit}
                    formatMoney={formatMoney}
                />

                <ExpenseChart
                    totalExpenses={totalExpenses}
                    chartData={chartData}
                    formatMoney={formatMoney}
                />

                <ExpenseCalendar
                    calendarItems={calendarItems}
                    categoryConfig={CATEGORY_CONFIG}
                    formatMoney={formatMoney}
                />

                <CategoryList
                    categoryConfig={CATEGORY_CONFIG}
                    currentData={currentData}
                    formatMoney={formatMoney}
                />

            </div>
        </div>
    );
};

export default BudgetWeb;
