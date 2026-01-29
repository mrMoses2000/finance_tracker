import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Header = ({ month, setMonth, currency, setCurrency, baseCurrency, onBaseCurrencyChange }) => {
    const { t, lang } = useLanguage();

    const toMonthLabel = (value) => {
        if (!value) return '';
        const date = new Date(`${value}-01T00:00:00Z`);
        return date.toLocaleDateString(
            lang === 'ru' ? 'ru-RU' : lang === 'de' ? 'de-DE' : 'en-US',
            { month: 'long', year: 'numeric' }
        );
    };

    const shiftMonth = (delta) => {
        if (!month) return;
        const [yearStr, monthStr] = month.split('-');
        const year = parseInt(yearStr, 10);
        const monthIndex = parseInt(monthStr, 10) - 1;
        const next = new Date(Date.UTC(year, monthIndex + delta, 1));
        const nextYear = next.getUTCFullYear();
        const nextMonth = String(next.getUTCMonth() + 1).padStart(2, '0');
        setMonth(`${nextYear}-${nextMonth}`);
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 pt-6 pb-14 sm:pt-8 sm:pb-20 px-3 sm:px-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                {/* Title Section */}
                <div className="w-full md:w-auto">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 tracking-tight text-white drop-shadow-md">
                        {t?.brand || "Finance Budget"}
                    </h1>
                    <p className="opacity-70 text-emerald-200 text-xs sm:text-sm md:text-base font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {t?.hero_desc || "Financial Compass & Planning"}
                    </p>
                </div>

                {/* Controls Section */}
                <div className="w-full md:w-auto flex flex-col lg:flex-row gap-3 items-stretch bg-black/40 p-2 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                    {/* Month Selector */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 w-full lg:w-auto justify-between">
                        <button
                            onClick={() => shiftMonth(-1)}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            aria-label={t?.month?.prev || "Previous month"}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="relative px-2">
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                aria-label={t?.month?.picker || "Pick month"}
                            />
                            <div className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-white min-w-[120px] sm:min-w-[160px] text-center">
                                {toMonthLabel(month)}
                            </div>
                        </div>
                        <button
                            onClick={() => shiftMonth(1)}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            aria-label={t?.month?.next || "Next month"}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full lg:w-auto">
                        {/* Base Currency Selector */}
                        <div className="flex flex-col items-start gap-1 px-2">
                            <span className="text-[11px] uppercase tracking-wide text-emerald-200/80">
                                {t?.base_currency?.label || 'Base currency'}
                            </span>
                            <select
                                value={baseCurrency}
                                onChange={(e) => onBaseCurrencyChange(e.target.value)}
                                className="w-full bg-transparent text-white text-sm font-bold pl-2 pr-8 py-2 rounded-xl border border-transparent hover:bg-white/5 focus:ring-0 cursor-pointer appearance-none transition-colors"
                            >
                                <option value="USD" className="bg-slate-900 text-white">USD $</option>
                                <option value="EUR" className="bg-slate-900 text-white">EUR €</option>
                                <option value="KZT" className="bg-slate-900 text-white">KZT ₸</option>
                                <option value="RUB" className="bg-slate-900 text-white">RUB ₽</option>
                            </select>
                        </div>

                        {/* Display Currency Selector */}
                        <div className="flex flex-col items-start gap-1 px-2">
                            <span className="text-[11px] uppercase tracking-wide text-slate-300/80">
                                {t?.display_currency?.label || 'Display'}
                            </span>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full bg-transparent text-white text-sm font-bold pl-2 pr-8 py-2 rounded-xl border border-transparent hover:bg-white/5 focus:ring-0 cursor-pointer appearance-none transition-colors"
                            >
                                <option value="USD" className="bg-slate-900 text-white">USD $</option>
                                <option value="EUR" className="bg-slate-900 text-white">EUR €</option>
                                <option value="KZT" className="bg-slate-900 text-white">KZT ₸</option>
                                <option value="RUB" className="bg-slate-900 text-white">RUB ₽</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
