import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ForecastingHub from './pages/ForecastingHub';
import DataIngestion from './pages/DataIngestion';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
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
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
