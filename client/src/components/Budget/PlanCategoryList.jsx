import React from 'react';

const PlanCategoryList = ({ categories, budgetItems, plannedTotal, formatMoney, t }) => {
    const plannedMap = new Map();
    budgetItems.forEach((item) => {
        if (!item.categoryId) return;
        plannedMap.set(item.categoryId, item.plannedAmount || 0);
    });

    const expenseCategories = categories.filter((cat) => cat.type !== 'income');
    const plannedRows = expenseCategories
        .map((category) => {
            const planned = plannedMap.get(category.id) ?? category.limit ?? 0;
            const share = plannedTotal > 0 ? planned / plannedTotal : 0;
            return { category, planned, share };
        })
        .filter((row) => row.planned > 0);

    return (
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-slate-300">{t?.category?.planned_title || 'Planned Allocation'}</span>
            </h2>

            {plannedRows.length === 0 ? (
                <div className="flex items-center justify-center h-40 w-full text-slate-500 font-medium bg-white/5 border border-white/5 rounded-xl">
                    {t?.chart?.no_data || 'No data'}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
                    {plannedRows.map((row) => (
                        <div
                            key={row.category.id}
                            className="bg-white/5 rounded-xl border border-white/5 overflow-hidden hover:bg-white/10 transition-colors"
                            style={{ borderLeft: `4px solid ${row.category.color}` }}
                        >
                            <div className="px-4 py-3 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-slate-200">{row.category.label}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {t?.category?.planned || 'Planned'}: {formatMoney(row.planned)}
                                    </div>
                                </div>
                                <div className="text-slate-400 text-xs font-mono">
                                    {plannedTotal > 0 ? `${Math.round(row.share * 100)}%` : '—'}
                                </div>
                            </div>
                            <div className="px-4 pb-4">
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${row.share * 100}%`, background: row.category.color }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlanCategoryList;
