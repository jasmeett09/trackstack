import React, { useState } from 'react';
import CursorSurface from '../components/CursorSurface';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { api } from '../lib/api';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      onLogin(response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CursorSurface className="login-container" variant="auth">
      <div className="login-shell">
        <div className="login-visual">
          <div className="auth-brand auth-brand--login">
            <div className="auth-brand__mark">⬢</div>
            <div>
              <strong>TrackStack</strong>
              <span>Inventory Management System</span>
            </div>
          </div>

          <div className="login-visual__content">
            <span className="auth-kicker">Welcome Back</span>
            <h2>Inventory access made simple.</h2>
            <p>
              Sign in to manage stock, review alerts, and keep your organization in control.
            </p>
            <div className="login-visual__stats">
              <div>
                <strong>1,240+</strong>
                <span>Products tracked</span>
              </div>
              <div>
                <strong>12</strong>
                <span>Low stock alerts</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-box" data-cursor-card>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn" data-cursor-button disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="signup-link">
            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </CursorSurface>
  );
}

export default LoginPage;
