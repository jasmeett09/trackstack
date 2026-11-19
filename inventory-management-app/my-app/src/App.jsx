import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Purchase from './pages/Purchase';
import Reporting from './pages/Reporting';
import ManageUsersPage from './pages/ManageUsersPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import SettingsPage from './pages/SettingsPage';
import useCursorInteractions from './hooks/useCursorInteractions';
import './App.css';
import './cursor-interactions.css';
import { api } from './lib/api';
import { disconnectOrganizationSocket } from './lib/socket';

function App() {
  useCursorInteractions();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedUser = localStorage.getItem('user');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }

      try {
        const data = await api.get('/api/session/profile');
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleUserUpdate = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    disconnectOrganizationSocket();
    try {
      await api.post('/api/auth/logout', {});
    } catch {
      // Ignore logout API failures and clear local state anyway.
    }

    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const canManageStock = user && ['admin', 'manager'].includes(user.role);
  const canViewReports = user && ['admin', 'manager'].includes(user.role);
  const canManageUsers = user && user.role === 'admin';

  return (
    <Routes>
      <Route path="/" element={<LandingPage isAuthenticated={isAuthenticated} />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage onLogin={handleLogin} />}
      />
      <Route
        path="/accept-invitation/:invitationId"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <AcceptInvitationPage onLogin={handleLogin} />}
      />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route
        path="/inventory"
        element={isAuthenticated ? <Inventory user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route
        path="/orders"
        element={
          isAuthenticated
            ? canManageStock
              ? <Orders user={user} onLogout={handleLogout} />
              : <Navigate to="/dashboard" />
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/purchase"
        element={
          isAuthenticated
            ? canManageStock
              ? <Purchase user={user} onLogout={handleLogout} />
              : <Navigate to="/dashboard" />
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/reporting"
        element={
          isAuthenticated
            ? canViewReports
              ? <Reporting user={user} onLogout={handleLogout} />
              : <Navigate to="/dashboard" />
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/manage-users"
        element={
          isAuthenticated
            ? canManageUsers
              ? <ManageUsersPage user={user} onLogout={handleLogout} />
              : <Navigate to="/dashboard" />
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/settings"
        element={
          isAuthenticated
            ? <SettingsPage user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
            : <Navigate to="/login" />
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
      />
    </Routes>
  );
}

export default App;
