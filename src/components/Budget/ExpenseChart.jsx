import React from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const ExpenseChart = ({ totalExpenses, chartData, formatMoney, gradientSegments }) => {
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

            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <PieIcon size={22} />
                </div>
                Структура Расходов
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                {/* The Pie Chart */}
                <div className="relative w-56 h-56 flex-shrink-0 group">
                    <motion.div
                        className="w-full h-full rounded-full transition-transform duration-500 ease-out group-hover:scale-105"
                        style={{ background: `conic-gradient(${gradientSegments})` }}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    ></motion.div>
                    <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <div className="text-center">
                            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-widest mb-1">Итого</div>
                            <div className="text-lg font-bold text-slate-800">{formatMoney(totalExpenses)}</div>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-3">
                    {chartData.map((item, idx) => (
                        <motion.div
                            key={item.key}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (idx * 0.05) }}
                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group cursor-default"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm ring-2 ring-white" style={{ backgroundColor: item.color }}></div>
                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{item.label}</span>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                                <span className="text-sm font-bold text-slate-900 mr-2 opacity-80">{Math.round(item.percent)}%</span>
                                <span className="text-xs text-slate-500 font-mono font-medium">{formatMoney(item.value)}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ExpenseChart;
