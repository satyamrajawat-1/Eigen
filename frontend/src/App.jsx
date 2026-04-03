import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Landing from './pages/Landing';
import AuthPage from './pages/Register';
import Dashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'COORDINATOR']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Legacy /admin route redirects to /dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'COORDINATOR']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;