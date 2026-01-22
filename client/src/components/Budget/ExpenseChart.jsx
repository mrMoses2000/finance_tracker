import React from 'react';
import { DonutChart, Legend } from "@tremor/react";
import { PieChart as PieIcon } from 'lucide-react';

const CustomTooltip = ({ payload, active, formatMoney }) => {
    if (!active || !payload || payload.length === 0) return null;
    const category = payload[0];
    return (
        <div className="bg-slate-900 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: category.payload.color }}></div>
                <span className="font-bold text-slate-200">{category.payload.name}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-400">Amount:</span>
                <span className="font-mono text-white font-bold">{formatMoney(category.value)}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-400">Share:</span>
                <span className="font-mono text-white font-bold">{category.payload.percent.toFixed(1)}%</span>
            </div>
        </div>
    );
};

const ExpenseChart = ({ totalExpenses, chartData, formatMoney, t }) => {
    const formattedData = chartData.map(item => ({
        name: item.label,
        amount: item.value,
        color: item.color,
        percent: item.percent
    }));

    const valueFormatter = (number) => formatMoney(number);

    return (
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <PieIcon size={120} className="text-white" />
            </div>

            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                    <PieIcon size={22} />
                </div>
                {t?.chart?.title || "Expense Structure"}
            </h2>

            <div className="flex flex-col items-center justify-center gap-8 relative z-10">
                {formattedData.length > 0 ? (
                    <>
                        <DonutChart
                            data={formattedData}
                            category="amount"
                            index="name"
                            valueFormatter={valueFormatter}
                            colors={["slate", "violet", "indigo", "rose", "cyan", "amber", "emerald"]}
                            className="w-48 h-48"
                            showLabel={true}
                            customTooltip={(props) => <CustomTooltip {...props} formatMoney={formatMoney} />}
                        />
                        <Legend
                            categories={formattedData.map(item => item.name)}
                            colors={["slate", "violet", "indigo", "rose", "cyan", "amber", "emerald"]}
                            className="max-w-full"
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-40 w-full text-slate-500 font-medium bg-white/5 border border-white/5 rounded-xl">
                        {t?.chart?.no_data || "No data"}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseChart;
