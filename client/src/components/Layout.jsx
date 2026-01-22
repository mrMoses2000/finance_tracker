import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, CreditCard, LogOut, Landmark, CalendarClock, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="app-shell flex h-screen w-full overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[rgba(16,185,129,0.15)] blur-[140px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[rgba(245,158,11,0.12)] blur-[160px] rounded-full"></div>
            </div>

            {/* --- SIDEBAR --- */}
            <aside className="relative z-20 w-20 lg:w-64 flex-shrink-0 flex flex-col app-panel border-r border-white/5">
                <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="font-bold text-white text-xl">BF</span>
                    </div>
                    <span className="hidden lg:block ml-3 font-bold text-lg tracking-tight text-white">Budget<span className="text-amber-300">Flow</span></span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2">
                    <NavItem to="/dashboard" icon={<LayoutDashboard size={22} />} label={t?.nav?.dashboard || "Dashboard"} />
                    <NavItem to="/transactions" icon={<CreditCard size={22} />} label={t?.nav?.transactions || "Transactions"} />
                    <NavItem to="/budget" icon={<Wallet size={22} />} label={t?.nav?.budget || "Budget Plan"} />
                    <NavItem to="/debts" icon={<Landmark size={22} />} label={t?.nav?.debts || "Debts & Loans"} />
                    <NavItem to="/schedule" icon={<CalendarClock size={22} />} label={t?.nav?.schedule || "Schedule"} />
                </nav>

                <div className="p-4 border-t border-white/5 space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center w-full p-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-amber-300 group"
                    >
                        {theme === 'dark' ? <Sun size={20} className="group-hover:rotate-12 transition-transform" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform" />}
                        <span className="hidden lg:block ml-3 font-medium">
                            {theme === 'dark' ? (t?.nav?.theme_light || 'Light Mode') : (t?.nav?.theme_dark || 'Dark Mode')}
                        </span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-rose-400 group"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="hidden lg:block ml-3 font-medium">{t?.nav?.logout || "Logout"}</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="relative z-10 flex-1 overflow-y-auto">
                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center p-3 rounded-xl transition-all duration-300 border border-transparent ${isActive
                ? 'bg-white/5 text-emerald-300 border-white/10 shadow-lg shadow-black/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`
        }
    >
        {({ isActive }) => (
            <>
                <div className="relative">
                    {icon}
                    {isActive && <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-l-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />}
                </div>
                <span className="hidden lg:block ml-3 font-medium">{label}</span>
            </>
        )}
    </NavLink>
);

export default Layout;
