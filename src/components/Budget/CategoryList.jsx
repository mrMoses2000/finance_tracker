import React from 'react';
import { motion } from 'framer-motion';

const CategoryCard = ({ title, items, formatMoney, color, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:break-inside-avoid hover:shadow-md transition-shadow duration-300"
        style={{ borderLeft: `5px solid ${color}` }}
    >
        <div className="px-5 py-4 bg-slate-50/80 backdrop-blur-sm font-bold text-slate-700 flex justify-between items-center border-b border-slate-100">
            <span className="text-base">{title}</span>
            <span className="text-slate-400 text-xs font-semibold bg-white px-2 py-1 rounded-full border border-slate-200">{items.length} поз.</span>
        </div>
        <div className="divide-y divide-slate-100">
            {items.map(item => (
                <div key={item.id} className="px-5 py-3.5 flex justify-between items-center text-sm group hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="text-slate-400 group-hover:text-slate-600 transition-colors">{item.icon}</div>
                        <div>
                            <div className="text-slate-800 font-medium group-hover:text-teal-900 transition-colors">{item.name}</div>
                            {item.day && <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                Срок: {item.day}-е число
                            </div>}
                        </div>
                    </div>
                    <div className="font-mono font-bold text-slate-700 bg-slate-100/50 px-2 py-1 rounded">
                        {formatMoney(item.amountUSD)}
                    </div>
                </div>
            ))}
            <div className="px-5 py-4 bg-slate-50/30 flex justify-between items-center font-bold text-slate-800 border-t border-slate-100">
                <span className="text-sm uppercase tracking-wider text-slate-500">Итого</span>
                <span className="text-lg text-teal-700">{formatMoney(items.reduce((acc, i) => acc + i.amountUSD, 0))}</span>
            </div>
        </div>
    </motion.div>
);

const CategoryList = ({ categoryConfig, currentData, formatMoney }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 pb-12">
            {Object.keys(categoryConfig).map((key, index) => {
                const items = currentData.filter(i => i.category === key);
                if (items.length === 0) return null;

                return (
                    <CategoryCard
                        key={key}
                        index={index}
                        title={categoryConfig[key].label}
                        items={items}
                        formatMoney={formatMoney}
                        color={categoryConfig[key].color}
                    />
                );
            })}
        </div>
    );
};

export default CategoryList;
