import React from 'react';
import { DonutChart, Legend } from "@tremor/react";
import { motion } from 'framer-motion';
import { PieChart as PieIcon } from 'lucide-react';

const customTooltip = (props) => {
    const { payload, active } = props;
    if (!active || !payload) return null;
    const categoryPayload = payload?.[0];
    if (!categoryPayload) return null;
    return (
        <div className="w-56 rounded-tremor-default text-tremor-default bg-tremor-background p-2 shadow-tremor-dropdown border border-tremor-border">
            <div className="flex flex-1 space-x-2.5">
                <div
                    className={`flex w-1.5 flex-col bg-${categoryPayload?.color}-500 rounded`}
                />
                <div className="w-full">
                    <div className="flex items-center justify-between space-x-8">
                        <p className="whitespace-nowrap text-right text-tremor-content text-slate-500">
                            {categoryPayload.name}
                        </p>
                        <p className="whitespace-nowrap text-right font-medium text-tremor-content-emphasis text-slate-800">
                            {categoryPayload.value}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExpenseChart = ({ totalExpenses, chartData, formatMoney }) => {
    // Tremor expects data in a specific format
    const formattedData = chartData.map(item => ({
        name: item.label,
        amount: item.value,
        color: item.color // Tremor uses predetermined color names, but we'll try to map custom hex if possible, otherwise we rely on Tremor's palette
    }));

    // We need to pass raw numbers to chart but display formatted money
    const valueFormatter = (number) => formatMoney(number);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 ring-1 ring-slate-900/5 print:break-inside-avoid relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <PieIcon size={120} className="text-slate-900" />
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <PieIcon size={22} />
                </div>
                Структура Расходов (Tremor)
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12 relative z-10">
                <DonutChart
                    data={formattedData}
                    category="amount"
                    index="name"
                    valueFormatter={valueFormatter}
                    colors={["slate", "violet", "indigo", "rose", "cyan", "amber", "emerald"]}
                    className="w-40 h-40"
                    showLabel={true}
                    customTooltip={customTooltip}
                />
                <Legend
                    categories={formattedData.map(item => item.name)}
                    colors={["slate", "violet", "indigo", "rose", "cyan", "amber", "emerald"]}
                    className="max-w-xs"
                />
            </div>
        </motion.div>
    );
};

export default ExpenseChart;
