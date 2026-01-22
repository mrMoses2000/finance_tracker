import React from 'react';
import { motion } from 'framer-motion';

const Header = ({ mode, setMode, currency, setCurrency }) => {
    return (
        <div className="relative pt-12 pb-24 px-4 shadow-xl overflow-hidden bg-slate-900 border-b border-white/5">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/header-bg.png"
                    alt="Background"
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-slate-900/40 to-slate-900/90 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50/10 to-transparent"></div>
            </div>

            <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center md:text-left"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight text-white drop-shadow-sm">
                        Личный Бюджет
                    </h1>
                    <p className="text-teal-50/80 text-lg font-light tracking-wide">
                        Финансовый компас и планирование
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row gap-4 bg-white/5 p-2 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-white/5"
                >
                    <div className="flex bg-black/40 rounded-xl p-1.5 backdrop-blur-sm">
                        <button
                            onClick={() => setMode('standard')}
                            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${mode === 'standard' ? 'bg-white text-teal-950 shadow-lg transform scale-[1.02]' : 'text-teal-100/70 hover:text-white hover:bg-white/5'}`}
                        >
                            Стандарт
                        </button>
                        <button
                            onClick={() => setMode('february')}
                            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${mode === 'february' ? 'bg-white text-teal-950 shadow-lg transform scale-[1.02]' : 'text-teal-100/70 hover:text-white hover:bg-white/5'}`}
                        >
                            Февраль
                        </button>
                    </div>

                    <div className="relative min-w-[140px]">
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="appearance-none bg-black/40 text-white text-sm font-bold pl-5 pr-12 py-3 rounded-xl border border-transparent focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20 cursor-pointer outline-none transition-all hover:bg-black/50 w-full h-full backdrop-blur-sm"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="KZT">KZT (₸)</option>
                            <option value="RUB">RUB (₽)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-teal-200/80">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Decorative bottom fade */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent opacity-10"></div>
        </div>
    );
};

export default Header;
