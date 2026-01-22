import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import BudgetWeb from './BudgetWeb'; // We will rename/refactor this later
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import BudgetPlan from './pages/BudgetPlan';
import { LanguageProvider } from './context/LanguageContext';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Landing />} />

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<BudgetWeb />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budget" element={<BudgetPlan />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
