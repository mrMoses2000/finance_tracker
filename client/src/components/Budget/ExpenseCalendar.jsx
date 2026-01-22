import React from 'react';
import { Calendar } from 'lucide-react';

const ExpenseCalendar = ({ calendarItems, categoryConfig, formatMoney, t }) => {
    return (
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                    <Calendar size={22} />
                </div>
                {t?.calendar?.title || "Payment Calendar"}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {calendarItems.map((item) => (
                    <div
                        key={item.id || Math.random()}
                        className="relative group bg-slate-800/40 border border-white/5 rounded-xl p-4 hover:border-indigo-500/50 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-default"
                    >
                        {/* Date Badge */}
                        <div className="absolute top-3 right-3 text-xs font-bold text-slate-400 group-hover:text-white bg-slate-900/50 px-2 py-1 rounded-md border border-white/5">
                            {new Date(item.date).getDate()}
                        </div>

                        {/* Icon */}
                        <div style={{ color: categoryConfig[Object.keys(categoryConfig).find(k => categoryConfig[k].label === item.category?.label)]?.color || '#94a3b8' }} className="mb-3">
                            <div className="w-8 h-8 bg-current opacity-20 rounded-lg flex items-center justify-center">
                                <div className="opacity-100 w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]"></div>
                            </div>
                        </div>

                        <div className="font-bold text-slate-200 text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5em]">
                            {item.description}
                        </div>

                        <div className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 inline-block px-2 py-1 rounded border border-indigo-500/20">
                            {formatMoney(item.amountUSD)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpenseCalendar;
