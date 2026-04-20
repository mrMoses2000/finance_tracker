import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ThemeProvider } from './context/ThemeContext';
import { isAuthenticated } from './lib/session';

const Layout = lazy(() => import('./components/Layout'));
const BudgetWeb = lazy(() => import('./BudgetWeb'));
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Transactions = lazy(() => import('./pages/Transactions'));
const BudgetPlan = lazy(() => import('./pages/BudgetPlan'));
const Debts = lazy(() => import('./pages/Debts'));
const Schedule = lazy(() => import('./pages/Schedule'));

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RouteLoader = () => (
  <div className="flex min-h-[100dvh] items-center justify-center app-shell px-4">
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-200 backdrop-blur-xl">
      <Loader2 className="animate-spin text-emerald-400" size={18} />
      <span className="text-sm font-medium">Loading workspace...</span>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Landing />} />

                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<BudgetWeb />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/budget" element={<BudgetPlan />} />
                  <Route path="/debts" element={<Debts />} />
                  <Route path="/schedule" element={<Schedule />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
