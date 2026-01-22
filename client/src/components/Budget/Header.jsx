import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Header = ({ mode, setMode, currency, setCurrency }) => {
    const { t } = useLanguage();

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 pt-8 pb-20 px-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                {/* Title Section */}
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight text-white drop-shadow-md">
                        {t?.brand || "Finance Budget"}
                    </h1>
                    <p className="opacity-70 text-indigo-200 text-sm md:text-base font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {t?.hero_desc || "Financial Compass & Planning"}
                    </p>
                </div>

                {/* Controls Section */}
                <div className="flex gap-4 items-center bg-black/40 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                    {/* Mode Toggle */}
                    <div className="flex bg-white/5 rounded-xl p-1">
                        <button
                            onClick={() => setMode('standard')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${mode === 'standard'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {t?.modes?.standard || "Standard"}
                        </button>
                        <button
                            onClick={() => setMode('february')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${mode === 'february'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {t?.modes?.february || "February"}
                        </button>
                    </div>

                    {/* Currency Selector */}
                    <div className="relative">
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="bg-transparent text-white text-sm font-bold pl-3 pr-8 py-2.5 rounded-xl border border-transparent hover:bg-white/5 focus:ring-0 cursor-pointer appearance-none transition-colors"
                        >
                            <option value="USD" className="bg-slate-900 text-white">USD $</option>
                            <option value="KZT" className="bg-slate-900 text-white">KZT ₸</option>
                            <option value="RUB" className="bg-slate-900 text-white">RUB ₽</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
