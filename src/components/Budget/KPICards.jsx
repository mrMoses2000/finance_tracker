import React from 'react';
import { motion } from 'framer-motion';

const KPICards = ({ totalExpenses, income, deficit, formatMoney }) => {
    const cards = [
        {
            label: 'Всего Расходов',
            value: totalExpenses,
            colorClass: 'text-slate-900',
            bgClass: 'bg-white border-slate-100',
            labelColor: 'text-slate-500',
        },
        {
            label: 'Гарантированный Доход',
            value: income,
            colorClass: 'text-teal-700',
            bgClass: 'bg-white border-teal-50',
            labelColor: 'text-teal-600',
        },
        {
            label: 'Дефицит Бюджета',
            value: deficit,
            colorClass: 'text-rose-600',
            bgClass: 'bg-white border-rose-100 ring-2 ring-rose-50/50',
            labelColor: 'text-rose-600',
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                    className={`${card.bgClass} p-6 rounded-2xl shadow-sm border transition-shadow`}
                >
                    <div className={`${card.labelColor} text-xs font-bold uppercase tracking-wider mb-2 opacity-80`}>
                        {card.label}
                    </div>
                    <motion.div
                        key={card.value} // Animate number change
                        initial={{ scale: 0.95, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-3xl font-extrabold ${card.colorClass} tracking-tight`}
                    >
                        {formatMoney(card.value)}
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
};

export default KPICards;
