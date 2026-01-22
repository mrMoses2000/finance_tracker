import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Smartphone, ArrowRight, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { t, lang, switchLang } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-900/20 blur-[120px] rounded-full"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-20 flex justify-between items-center px-6 py-6 md:px-12 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="font-bold text-white text-sm">BF</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight">Budget<span className="text-indigo-400">Flow</span></span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Switcher */}
                    <div className="flex items-center bg-white/5 rounded-full px-2 py-1 border border-white/5 mx-2">
                        <Globe size={14} className="text-slate-400 ml-1 mr-2" />
                        {['en', 'ru', 'de'].map(l => (
                            <button
                                key={l}
                                onClick={() => switchLang(l)}
                                className={`px-2 py-1 text-xs font-bold uppercase rounded-full transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <button onClick={() => navigate('/login')} className="text-slate-300 hover:text-white font-medium transition-colors hidden sm:block">{t?.login || 'Login'}</button>
                    <button onClick={() => navigate('/register')} className="bg-white text-indigo-950 hover:bg-slate-200 px-5 py-2 rounded-full font-bold transition-all shadow-lg shadow-white/10 text-sm sm:text-base">{t?.get_started || 'Get Started'}</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-slate-400 drop-shadow-lg">
                        {t?.hero_title} <br />
                        <span className="text-indigo-400">{t?.hero_subtitle}</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t?.hero_desc}
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/register')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold px-8 py-4 rounded-full shadow-2xl shadow-indigo-600/30 flex items-center gap-3 mx-auto border-t border-white/20"
                    >
                        {t?.cta} <ArrowRight size={20} />
                    </motion.button>
                </motion.div>

                {/* Hero Image Mockup Area */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="mt-20 relative mx-auto max-w-5xl"
                >
                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl -z-10 rounded-full"></div>
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden ring-1 ring-white/10">
                        <img 
                            src="/dashboard-preview.png" 
                            alt="Dashboard Preview" 
                            className="w-full h-auto rounded-xl shadow-2xl border border-white/5"
                        />
                        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                            <span className="bg-black/60 backdrop-blur-md text-white/80 text-xs px-3 py-1 rounded-full border border-white/10">
                                {t?.preview_label}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features */}
            <section className="relative z-10 py-24 bg-slate-900/50 backdrop-blur-md border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <FeatureCard
                        icon={<TrendingUp className="text-emerald-400" size={32} />}
                        title={t?.features?.analytics}
                        desc={t?.features?.analytics_desc}
                    />
                    <FeatureCard
                        icon={<Shield className="text-indigo-400" size={32} />}
                        title={t?.features?.security}
                        desc={t?.features?.security_desc}
                    />
                    <FeatureCard
                        icon={<Smartphone className="text-violet-400" size={32} />}
                        title={t?.features?.multi_device}
                        desc={t?.features?.multi_device_desc}
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center text-slate-600 text-sm">
                <p>{t?.footer}</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all hover:scale-105 duration-300">
        <div className="mb-4 bg-slate-950/50 w-14 h-14 rounded-xl flex items-center justify-center border border-white/5">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;
