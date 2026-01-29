import React from 'react';
import { TrendingUp, Wallet, AlertOctagon } from 'lucide-react';

const KPICards = ({ totalExpenses, income, deficit, formatMoney, labels }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Total Expenses */}
            <div className="glass-card p-4 sm:p-6 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Wallet size={40} className="text-emerald-300 sm:w-12 sm:h-12" />
                </div>
                <div className="text-slate-400 text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    {labels?.expenses || "Total Expenses"}
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {formatMoney(totalExpenses)}
                </div>
            </div>

            {/* Income */}
            <div className="glass-card p-4 sm:p-6 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingUp size={40} className="text-emerald-400 sm:w-12 sm:h-12" />
                </div>
                <div className="text-slate-400 text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    {labels?.income || "Guaranteed Income"}
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
                    {formatMoney(income)}
                </div>
            </div>

            {/* Deficit */}
            <div className="glass-card p-4 sm:p-6 relative group overflow-hidden border-rose-500/20">
                <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <AlertOctagon size={40} className="text-rose-400 sm:w-12 sm:h-12" />
                </div>
                <div className="text-slate-400 text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                    {labels?.balance || "Budget Deficit"}
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight">
                    {formatMoney(deficit)}
                </div>
            </div>
        </div>
    );
};

export default KPICards;
