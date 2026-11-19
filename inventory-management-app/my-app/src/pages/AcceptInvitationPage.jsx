import React, { useEffect, useState } from 'react';
import CursorSurface from '../components/CursorSurface';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import './AcceptInvitationPage.css';

function AcceptInvitationPage({ onLogin }) {
  const navigate = useNavigate();
  const { invitationId } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInvitation = async () => {
      setLoadingInvitation(true);
      setError('');
      try {
        const response = await api.get(`/api/auth/invitations/${invitationId}`);
        setInvitation(response.invitation);
        setForm((prev) => ({
          ...prev,
          email: response.invitation.email
        }));
      } catch (err) {
        setError(err.message || 'Could not load invitation.');
      } finally {
        setLoadingInvitation(false);
      }
    };

    loadInvitation();
  }, [invitationId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/api/auth/accept-invitation', {
        invitationId,
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      onLogin(response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not accept invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CursorSurface className="accept-invitation-shell" variant="auth">
      <div className="accept-invitation-card" data-cursor-card>
        <div className="accept-invitation-head">
          <span className="accept-badge">Join Organization</span>
          <h1>Accept Team Invitation</h1>
          <p>
            {invitation
              ? `You were invited to join ${invitation.organizationName} as ${invitation.role}.`
              : 'We are validating your invitation now.'}
          </p>
        </div>

        {loadingInvitation ? (
          <div className="accept-loading">Loading invitation details...</div>
        ) : invitation ? (
          <form className="accept-form" onSubmit={handleSubmit}>
            <div className="accept-summary">
              <div>
                <span>Organization</span>
                <strong>{invitation.organizationName}</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>{invitation.role}</strong>
              </div>
            </div>

            <label htmlFor="accept-name">Full Name</label>
            <input
              id="accept-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            <label htmlFor="accept-email">Email</label>
            <input
              id="accept-email"
              name="email"
              type="email"
              value={form.email}
              readOnly
            />

            <label htmlFor="accept-password">Password</label>
            <input
              id="accept-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />

            <label htmlFor="accept-confirm-password">Confirm Password</label>
            <input
              id="accept-confirm-password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />

            {error ? <div className="accept-error">{error}</div> : null}

            <button type="submit" className="accept-btn" data-cursor-button disabled={submitting}>
              {submitting ? 'Joining Organization...' : 'Join Organization'}
            </button>
          </form>
        ) : (
          <div className="accept-empty-state">
            <p>{error || 'Invitation not found.'}</p>
          </div>
        )}

        <div className="accept-footer">
          <p>Already have access? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </CursorSurface>
  );
}

export default AcceptInvitationPage;
