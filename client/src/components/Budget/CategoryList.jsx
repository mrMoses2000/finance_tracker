import React from 'react';
import { getCategoryLabel } from '../../context/LanguageContext';

const CategoryList = ({ categories, budgetItems, transactions, formatMoney, t }) => {
    const plannedMap = new Map();
    const actualMap = new Map();

    budgetItems.forEach((item) => {
        if (!item.categoryId) return;
        plannedMap.set(item.categoryId, item.plannedAmount || 0);
    });

    transactions.forEach((item) => {
        const categoryId = item.categoryId || item.category?.id;
        if (!categoryId) return;
        actualMap.set(categoryId, (actualMap.get(categoryId) || 0) + item.amountUSD);
    });

    const expenseCategories = categories.filter((cat) => cat.type !== 'income');

    const grouped = expenseCategories.map((category) => {
        const planned = plannedMap.get(category.id) ?? category.limit ?? 0;
        const actual = actualMap.get(category.id) ?? 0;
        const progress = planned > 0 ? Math.min(actual / planned, 1) : actual > 0 ? 1 : 0;
        const items = transactions.filter((item) => (item.categoryId || item.category?.id) === category.id);
        return { category, planned, actual, progress, items };
    });

    return (
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-slate-400">{t?.category?.title || 'Analysis by Category'}</span>
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
                {grouped.map((group) => {
                    if (group.items.length === 0 && group.planned === 0) return null;
                    const total = group.actual;

                    return (
                        <div
                            key={group.category.id}
                            className="bg-white/5 rounded-xl border border-white/5 overflow-hidden hover:bg-white/10 transition-colors"
                            style={{ borderLeft: `4px solid ${group.category.color}` }}
                        >
                            {/* Header */}
                            <div className="px-4 py-3 flex justify-between items-center bg-black/20">
                                <div>
                                    <span className="font-bold text-slate-200">{getCategoryLabel(group.category, t)}</span>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {t?.category?.planned || 'Planned'}: {formatMoney(group.planned)} · {t?.category?.actual || 'Actual'}: {formatMoney(total)}
                                    </div>
                                </div>
                                <span className="text-slate-400 text-xs font-mono">{formatMoney(total)}</span>
                            </div>

                            {/* Progress */}
                            <div className="px-4 pt-3">
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${group.progress * 100}%`,
                                            background: group.actual > group.planned ? '#f43f5e' : group.category.color
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="px-4 py-2 space-y-1">
                                {group.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-xs text-slate-400 hover:text-slate-200">
                                        <span>{item.description}</span>
                                        <span>{formatMoney(item.amountUSD)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryList;
