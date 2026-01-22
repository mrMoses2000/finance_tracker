import React from 'react';

const CategoryList = ({ categoryConfig, currentData, formatMoney, t }) => {
    const grouped = {};
    Object.keys(categoryConfig).forEach(key => {
        const label = categoryConfig[key].label;
        grouped[label] = {
            key,
            config: categoryConfig[key],
            items: currentData.filter(i => i.category?.label === label)
        };
    });

    return (
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-slate-400">Analysis by Category</span>
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
                {Object.entries(grouped).map(([label, group]) => {
                    if (group.items.length === 0) return null;
                    const total = group.items.reduce((acc, i) => acc + i.amountUSD, 0);

                    return (
                        <div
                            key={label}
                            className="bg-white/5 rounded-xl border border-white/5 overflow-hidden hover:bg-white/10 transition-colors"
                            style={{ borderLeft: `4px solid ${group.config.color}` }}
                        >
                            {/* Header */}
                            <div className="px-4 py-3 flex justify-between items-center bg-black/20">
                                <span className="font-bold text-slate-200">{label}</span>
                                <span className="text-slate-400 text-xs font-mono">
                                    {formatMoney(total)}
                                </span>
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
