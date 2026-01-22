import React from 'react';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const ExpenseCalendar = ({ calendarItems, categoryConfig, formatMoney }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 ring-1 ring-slate-900/5 print:break-inside-avoid"
        >
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <Calendar size={22} />
                </div>
                Календарь Платежей
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {calendarItems.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -5, borderColor: '#14b8a6' }}
                        className="relative group bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg"
                    >
                        <div className="absolute top-3 right-3 text-xs font-bold text-slate-300 group-hover:text-teal-600 transition-colors bg-white px-1.5 py-0.5 rounded shadow-sm">
                            {item.day}-е
                        </div>
                        <div style={{ color: categoryConfig[item.category]?.color || '#94a3b8' }} className="mb-3 transition-transform group-hover:scale-110 origin-left">
                            {item.icon}
                        </div>
                        <div className="font-bold text-slate-800 text-sm leading-tight mb-1.5 pr-6">{item.name}</div>
                        <div className="text-xs font-mono font-semibold text-slate-600 bg-white inline-block px-1.5 py-0.5 rounded border border-slate-100">{formatMoney(item.amountUSD)}</div>
                        {item.note && <div className="text-[10px] text-rose-500 mt-2 font-medium bg-rose-50 px-2 py-1 rounded inline-block">{item.note}</div>}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default ExpenseCalendar;
