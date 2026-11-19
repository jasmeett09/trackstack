import React, { useEffect, useState } from 'react';
import CursorSurface from '../components/CursorSurface';
import Sidebar from '../components/Sidebar';
import { api } from '../lib/api';
import './Dashboard.css';
import './SettingsPage.css';

function SettingsPage({ user, onLogout, onUserUpdate }) {
  const [profileName, setProfileName] = useState(user?.name || '');
  const [organizationName, setOrganizationName] = useState(user?.organizationName || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [organizationMessage, setOrganizationMessage] = useState('');
  const [organizationError, setOrganizationError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [organizationSaving, setOrganizationSaving] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    setProfileName(user?.name || '');
    setOrganizationName(user?.organizationName || '');
  }, [user?.name, user?.organizationName]);

  const refreshSessionUser = async () => {
    const response = await api.get('/api/session/profile');
    onUserUpdate(response.user);
    return response.user;
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileMessage('');

    try {
      await api.put('/api/session/profile', { name: profileName });
      const updatedUser = await refreshSessionUser();
      setProfileName(updatedUser.name);
      setProfileMessage('Profile updated successfully.');
    } catch (error) {
      setProfileError(error.message || 'Could not update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleOrganizationSubmit = async (event) => {
    event.preventDefault();
    setOrganizationSaving(true);
    setOrganizationError('');
    setOrganizationMessage('');

    try {
      await api.put('/api/organization', { organizationName });
      const updatedUser = await refreshSessionUser();
      setOrganizationName(updatedUser.organizationName);
      setOrganizationMessage('Organization updated successfully.');
    } catch (error) {
      setOrganizationError(error.message || 'Could not update organization.');
    } finally {
      setOrganizationSaving(false);
    }
  };

  return (
    <CursorSurface className="dashboard">
      <Sidebar user={user} onLogout={onLogout} currentPage="settings" />
      <main className="settings-content">
        <div className="settings-header">
          <div>
            <h1>Settings</h1>
            <p>Update your account details and keep your organization information current.</p>
          </div>
          <div className="settings-summary-card" data-cursor-card>
            <span className="settings-summary-label">Signed in as</span>
            <strong>{user?.role}</strong>
            <span>{user?.email}</span>
          </div>
        </div>

        <div className="settings-grid">
          <section className="settings-panel" data-cursor-card>
            <h2 data-scroll-slide="left">Profile</h2>
            <p className="panel-subtitle">Change the name that appears in the sidebar and dashboard.</p>
            <form className="settings-form" onSubmit={handleProfileSubmit}>
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="Enter your full name"
                required
              />

              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                value={user?.email || ''}
                disabled
              />

              {profileError ? <div className="settings-error">{profileError}</div> : null}
              {profileMessage ? <div className="settings-success">{profileMessage}</div> : null}

              <button type="submit" className="primary-btn" data-cursor-button disabled={profileSaving}>
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </section>

          <section className="settings-panel" data-cursor-card>
            <h2 data-scroll-slide="right">Organization</h2>
            <p className="panel-subtitle">
              {isAdmin
                ? 'Admins can rename the organization for the whole team.'
                : 'Only admins can rename the organization.'}
            </p>
            <form className="settings-form" onSubmit={handleOrganizationSubmit}>
              <label htmlFor="organization-name">Organization Name</label>
              <input
                id="organization-name"
                type="text"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                placeholder="Enter organization name"
                required
                disabled={!isAdmin}
              />

              <label htmlFor="organization-role">Your Role</label>
              <input
                id="organization-role"
                type="text"
                value={user?.role || ''}
                disabled
              />

              {organizationError ? <div className="settings-error">{organizationError}</div> : null}
              {organizationMessage ? <div className="settings-success">{organizationMessage}</div> : null}

              <button type="submit" className="primary-btn" data-cursor-button disabled={!isAdmin || organizationSaving}>
                {organizationSaving ? 'Saving...' : 'Save Organization'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </CursorSurface>
  );
}

export default SettingsPage;
