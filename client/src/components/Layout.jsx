import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, CreditCard, LogOut, Landmark, CalendarClock, Moon, Sun, Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { clearSession } from '../lib/session';

const Layout = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeProgress, setSwipeProgress] = useState(0);
    const touchStartRef = useRef({ x: 0, y: 0 });
    const navItems = [
        { to: '/dashboard', icon: <LayoutDashboard size={22} />, shortIcon: LayoutDashboard, label: t?.nav?.dashboard || 'Dashboard' },
        { to: '/transactions', icon: <CreditCard size={22} />, shortIcon: CreditCard, label: t?.nav?.transactions || 'Transactions' },
        { to: '/budget', icon: <Wallet size={22} />, shortIcon: Wallet, label: t?.nav?.budget || 'Budget Plan' },
        { to: '/debts', icon: <Landmark size={22} />, shortIcon: Landmark, label: t?.nav?.debts || 'Debts & Loans' },
        { to: '/schedule', icon: <CalendarClock size={22} />, shortIcon: CalendarClock, label: t?.nav?.schedule || 'Schedule' },
    ];

    const toggleSidebar = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsMobileOpen((prev) => !prev);
        } else {
            setIsCollapsed((prev) => !prev);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.body.style.overflow = isMobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileOpen]);

    const handleTouchStart = (event) => {
        const touch = event.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (event) => {
        const isSmallScreen = window.innerWidth < 1024;
        if (!isSmallScreen) {
            return;
        }
        const touch = event.touches[0];
        const start = touchStartRef.current;
        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            return;
        }

        if (!isMobileOpen && start.x > 40) {
            return;
        }

        setIsSwiping(true);
        if (!isMobileOpen) {
            const progress = Math.min(1, Math.max(0, deltaX / 140));
            setSwipeProgress(progress);
        } else if (deltaX < 0) {
            const progress = Math.min(1, Math.max(0, Math.abs(deltaX) / 140));
            setSwipeProgress(progress);
        } else {
            setSwipeProgress(0);
        }
    };

    const handleTouchEnd = (event) => {
        const touch = event.changedTouches[0];
        const start = touchStartRef.current;
        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;
        setIsSwiping(false);
        setSwipeProgress(0);
        if (Math.abs(deltaY) > 60) {
            return;
        }
        const isSmallScreen = window.innerWidth < 1024;
        if (!isSmallScreen) {
            return;
        }
        if (!isMobileOpen && start.x < 40 && deltaX > 60) {
            setIsMobileOpen(true);
        }
        if (isMobileOpen && deltaX < -60) {
            setIsMobileOpen(false);
        }
    };

    const handleLogout = () => {
        clearSession();
        navigate('/login');
    };

    return (
        <div className="app-shell flex min-h-[100dvh] w-full overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[rgba(16,185,129,0.15)] blur-[140px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[rgba(245,158,11,0.12)] blur-[160px] rounded-full"></div>
            </div>

            <div
                className="pointer-events-none fixed top-0 left-0 h-full w-6 z-10 lg:hidden transition-opacity"
                style={{
                    opacity: isSwiping ? 0.2 + swipeProgress * 0.6 : 0,
                    background: 'linear-gradient(90deg, rgba(16,185,129,0.35), transparent)',
                }}
            />

            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/60 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* --- SIDEBAR --- */}
            <aside
                className={`fixed lg:relative z-30 h-[100dvh] flex-shrink-0 flex flex-col app-panel border-r border-white/5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isCollapsed ? 'lg:w-20' : 'lg:w-64'
                } w-64 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="h-20 flex items-center justify-between border-b border-white/5 px-4 lg:px-6">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className={`flex items-center transition-colors hover:bg-white/5 rounded-2xl p-2 -m-2 ${
                            isCollapsed ? 'lg:px-2' : ''
                        }`}
                        aria-label={t?.brand || 'Toggle sidebar'}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <span className="font-bold text-white text-xl">BF</span>
                        </div>
                        <span className={`hidden lg:block ml-3 font-bold text-lg tracking-tight text-white ${isCollapsed ? 'lg:hidden' : ''}`}>
                            Budget<span className="text-amber-300">Flow</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden w-10 h-10 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 flex items-center justify-center"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            collapsed={isCollapsed}
                            onNavigate={() => setIsMobileOpen(false)}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center w-full p-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-amber-300 group"
                    >
                        {theme === 'dark' ? <Sun size={20} className="group-hover:rotate-12 transition-transform" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform" />}
                        <span className={`hidden lg:block ml-3 font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>
                            {theme === 'dark' ? (t?.nav?.theme_light || 'Light Mode') : (t?.nav?.theme_dark || 'Dark Mode')}
                        </span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-rose-400 group"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className={`hidden lg:block ml-3 font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>{t?.nav?.logout || "Logout"}</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main
                className={`relative z-10 flex-1 overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isMobileOpen ? 'translate-x-64' : 'translate-x-0'
                } lg:translate-x-0`}
            >
                <div className="lg:hidden sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            className="w-10 h-10 rounded-xl border border-white/10 text-slate-100 hover:bg-white/5 flex items-center justify-center"
                            aria-label={t?.brand || 'Open menu'}
                        >
                            <Menu size={18} />
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <span className="font-bold text-white text-lg">BF</span>
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-white font-bold truncate">{t?.brand || 'BudgetFlow'}</div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-200/70 truncate">Mobile workspace</div>
                    </div>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-xl border border-white/10 text-slate-100 hover:bg-white/5 flex items-center justify-center"
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
                <div className="p-4 pb-28 sm:p-6 md:p-10 lg:pb-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-slate-950/90 backdrop-blur-2xl px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
                <div className="grid grid-cols-5 gap-1">
                    {navItems.map((item) => (
                        <BottomNavItem
                            key={item.to}
                            to={item.to}
                            icon={item.shortIcon}
                            label={item.label}
                        />
                    ))}
                </div>
            </nav>
        </div>
    );
};

const NavItem = ({ to, icon, label, collapsed, onNavigate }) => (
    <NavLink
        to={to}
        onClick={onNavigate}
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
                <span className={`hidden lg:block ml-3 font-medium ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
            </>
        )}
    </NavLink>
);

const BottomNavItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors ${isActive
                ? 'bg-emerald-500/12 text-emerald-300'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`
        }
    >
        <Icon size={18} />
        <span className="truncate max-w-full">{label}</span>
    </NavLink>
);

export default Layout;
