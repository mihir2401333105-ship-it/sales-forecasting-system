import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ForecastingHub from './pages/ForecastingHub';
import DataIngestion from './pages/DataIngestion';
import Reports from './pages/Reports';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('session_token');
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public High-Impact Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Dedicated Auth Interface (Split Screen) */}
        <Route path="/auth" element={<Auth />} />

        {/* Dashboard Main Routes (Protected) */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forecasts" element={<ForecastingHub />} />
          <Route path="/data" element={<DataIngestion />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={
             <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 font-bold text-4xl">⚙️</div>
                <h2 className="text-2xl font-bold mb-2 font-display">User Settings</h2>
                <p className="text-slate-500 font-medium">Manage your profile, model preferences and notifications.</p>
             </div>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
