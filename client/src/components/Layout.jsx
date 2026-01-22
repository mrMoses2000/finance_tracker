import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, CreditCard, LogOut, Settings } from 'lucide-react';

const Layout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-900 text-slate-100 font-sans selection:bg-teal-500/30">
            {/* Background Image Layer */}
            <div className="fixed inset-0 z-0">
                <img
                    src="/header-bg.png"
                    alt="background"
                    className="w-full h-full object-cover opacity-40 blur-sm scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950/95 mix-blend-multiply"></div>
            </div>

            {/* --- SIDEBAR --- */}
            <aside className="relative z-20 w-20 lg:w-64 flex-shrink-0 flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/20">
                        <span className="font-bold text-white text-xl">BF</span>
                    </div>
                    <span className="hidden lg:block ml-3 font-bold text-lg tracking-tight">Budget<span className="text-teal-400">Flow</span></span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2">
                    <NavItem to="/" icon={<LayoutDashboard size={22} />} label="Dashboard" />
                    <NavItem to="/transactions" icon={<CreditCard size={22} />} label="Transactions" />
                    <NavItem to="/budget" icon={<Wallet size={22} />} label="Budget Plan" />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-rose-400 group"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="hidden lg:block ml-3 font-medium">Logout</span>
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
            `flex items-center p-3 rounded-xl transition-all duration-300 ${isActive
                ? 'bg-gradient-to-r from-teal-500/20 to-teal-500/5 border border-teal-500/20 text-teal-300 shadow-lg shadow-teal-900/10'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`
        }
    >
        <div className="relative">
            {icon}
        </div>
        <span className="hidden lg:block ml-3 font-medium">{label}</span>
    </NavLink>
);

export default Layout;
