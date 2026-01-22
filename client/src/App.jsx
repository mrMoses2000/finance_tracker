import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import BudgetWeb from './BudgetWeb'; // We will rename/refactor this later
import Login from './pages/Login';   // Placeholder
import Register from './pages/Register'; // Placeholder

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
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<BudgetWeb />} />
          <Route path="/transactions" element={<div className="text-white">Transactions Page Coming Soon</div>} />
          <Route path="/budget" element={<div className="text-white">Budget Settings Page Coming Soon</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
