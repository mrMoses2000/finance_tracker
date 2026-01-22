import React from 'react';
import { TrendingUp, Wallet, AlertOctagon } from 'lucide-react';

const KPICards = ({ totalExpenses, income, deficit, formatMoney, t }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Expenses */}
            <div className="glass-card p-6 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Wallet size={48} className="text-indigo-400" />
                </div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    {t?.kpi?.expenses || "Total Expenses"}
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                    {formatMoney(totalExpenses)}
                </div>
            </div>

            {/* Income */}
            <div className="glass-card p-6 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingUp size={48} className="text-emerald-400" />
                </div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    {t?.kpi?.income || "Guaranteed Income"}
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                    {formatMoney(income)}
                </div>
            </div>

            {/* Deficit */}
            <div className="glass-card p-6 relative group overflow-hidden border-rose-500/20">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <AlertOctagon size={48} className="text-rose-400" />
                </div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                    {t?.kpi?.deficit || "Budget Deficit"}
                </div>
                <div className="text-3xl font-extrabold text-rose-400 tracking-tight">
                    {formatMoney(deficit)}
                </div>
            </div>
        </div>
    );
};

export default KPICards;
