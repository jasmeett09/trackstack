import React, { useState } from 'react';
import CursorSurface from '../components/CursorSurface';
import { Link, useNavigate } from 'react-router-dom';
import './SignupPage.css';
import { api } from '../lib/api';

function SignupPage({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!formData.organizationName.trim()) {
      setError('Organization name is required');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/register', formData);
      onLogin(response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CursorSurface className="signup-container" variant="auth">
      <div className="signup-shell">
        <div className="signup-visual">
          <div className="auth-brand auth-brand--signup">
            <div className="auth-brand__mark">⬢</div>
            <div>
              <strong>TrackStack</strong>
              <span>Inventory Management System</span>
            </div>
          </div>

          <div className="signup-visual__content">
            <span className="auth-kicker">Get Started</span>
            <h2>Build your inventory workspace.</h2>
            <p>
              Create your organization, become the admin, and start managing products with a
              cleaner workflow.
            </p>
            <div className="signup-visual__panel">
              <div>
                <strong>Secure setup</strong>
                <span>Organization-based access</span>
              </div>
              <div>
                <strong>Real-time updates</strong>
                <span>Track stock changes instantly</span>
              </div>
            </div>
          </div>
        </div>

        <div className="signup-box" data-cursor-card>
          <h1>Create Organization</h1>
          <p>Start a new organization and become its admin</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="organizationName">Organization Name</label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Enter your company name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Admin Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="signup-btn" data-cursor-button disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="login-link">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </div>
      </div>
    </CursorSurface>
  );
}

export default SignupPage;
