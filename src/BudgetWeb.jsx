import React, { useState, useEffect } from 'react';
import Header from './components/Budget/Header';
import KPICards from './components/Budget/KPICards';
import ExpenseChart from './components/Budget/ExpenseChart';
import ExpenseCalendar from './components/Budget/ExpenseCalendar';
import CategoryList from './components/Budget/CategoryList';

import {
    RATES,
    SYMBOLS,
    CATEGORY_CONFIG,
    STANDARD_DATA,
    FEBRUARY_DATA,
    INCOME_USD
} from './data/budgetData';

const BudgetWeb = () => {
    // --- STATE WITH PERSISTENCE ---
    const [mode, setMode] = useState(() => localStorage.getItem('budget_mode') || 'standard');
    const [currency, setCurrency] = useState(() => localStorage.getItem('budget_currency') || 'USD');

    // Save to localStorage when changed
    useEffect(() => {
        localStorage.setItem('budget_mode', mode);
    }, [mode]);

    useEffect(() => {
        localStorage.setItem('budget_currency', currency);
    }, [currency]);

    // --- LOGIC ---
    const currentData = mode === 'standard' ? STANDARD_DATA : FEBRUARY_DATA;

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

    // Gradient Generation
    let currentAngle = 0;
    const gradientSegments = chartData.map(item => {
        const start = currentAngle;
        const end = currentAngle + item.percent;
        currentAngle = end;
        return `${item.color} ${start}% ${end}%`;
    }).join(', ');

    const calendarItems = currentData.filter(i => i.day).sort((a, b) => a.day - b.day);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900">

            <Header
                mode={mode}
                setMode={setMode}
                currency={currency}
                setCurrency={setCurrency}
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 space-y-8 relative z-20 pb-20">

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
                    gradientSegments={gradientSegments}
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

                {/* --- FOOTER --- */}
                <div className="text-center text-slate-400 text-sm py-4 print:hidden">
                    <p>Используй <span className="font-mono bg-slate-200 px-1 rounded text-slate-600">Cmd+P</span> (Печать), чтобы сохранить как PDF.</p>
                </div>

            </div>
        </div>
    );
};

export default BudgetWeb;
