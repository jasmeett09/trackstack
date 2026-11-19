import React, { useEffect, useMemo, useState } from 'react';
import CursorSurface from '../components/CursorSurface';
import Sidebar from '../components/Sidebar';
import { api } from '../lib/api';
import './Dashboard.css';
import './ManageUsersPage.css';

function ManageUsersPage({ user, onLogout }) {
  const [organization, setOrganization] = useState(null);
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [form, setForm] = useState({ email: '', role: 'staff' });
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [roleSavingId, setRoleSavingId] = useState('');
  const [memberActionId, setMemberActionId] = useState('');
  const [inviteActionId, setInviteActionId] = useState('');

  const pendingInvitations = useMemo(
    () => invitations.filter((invitation) => invitation.status === 'pending'),
    [invitations]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [organizationRes, usersRes, invitationsRes] = await Promise.all([
        api.get('/api/organization'),
        api.get('/api/organization/users'),
        api.get('/api/organization/invitations')
      ]);

      setOrganization(organizationRes.organization);
      setUsers(usersRes);
      setInvitations(invitationsRes);
      setInviteError('');
    } catch (err) {
      setInviteError(err.message || 'Failed to load organization data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInvite = async (event) => {
    event.preventDefault();
    setInviteMessage('');
    setInviteError('');
    setSubmitting(true);

    try {
      const response = await api.post('/api/organization/invitations', form);
      setInviteMessage(response.inviteLink || 'Invitation created successfully.');
      setForm({ email: '', role: 'staff' });
      await loadData();
    } catch (err) {
      setInviteError(err.message || 'Failed to create invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyInviteLink = async (inviteLink) => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteMessage(`Copied invite link: ${inviteLink}`);
      setInviteError('');
    } catch {
      setInviteError('Could not copy the invite link automatically.');
    }
  };

  const handleRoleChange = async (memberId, role) => {
    setInviteMessage('');
    setInviteError('');
    setRoleSavingId(memberId);

    try {
      const response = await api.put(`/api/organization/users/${memberId}/role`, { role });
      setUsers((prev) => prev.map((member) => (
        member.id === memberId ? response.user : member
      )));
      setInviteMessage(`Updated role to ${response.user.role} for ${response.user.email}.`);
    } catch (err) {
      setInviteError(err.message || 'Failed to update user role.');
    } finally {
      setRoleSavingId('');
    }
  };

  const handleRemoveUser = async (member) => {
    const confirmed = window.confirm(`Remove ${member.email} from ${organization?.organizationName || user.organizationName}?`);

    if (!confirmed) {
      return;
    }

    setInviteMessage('');
    setInviteError('');
    setMemberActionId(member.id);

    try {
      const response = await api.delete(`/api/organization/users/${member.id}`);
      setUsers((prev) => prev.filter((entry) => entry.id !== member.id));
      setInviteMessage(response.message || `Removed ${member.email}.`);
      setOrganization((prev) => (
        prev ? { ...prev, memberCount: Math.max((prev.memberCount || 1) - 1, 0) } : prev
      ));
    } catch (err) {
      setInviteError(err.message || 'Failed to remove user.');
    } finally {
      setMemberActionId('');
    }
  };

  const handleRevokeInvitation = async (invitation) => {
    const confirmed = window.confirm(`Revoke the invitation for ${invitation.email}?`);

    if (!confirmed) {
      return;
    }

    setInviteMessage('');
    setInviteError('');
    setInviteActionId(invitation.id);

    try {
      const response = await api.delete(`/api/organization/invitations/${invitation.id}`);
      setInvitations((prev) => prev.map((entry) => (
        entry.id === invitation.id ? response.invitation : entry
      )));
      setInviteMessage(response.message || `Revoked ${invitation.email}.`);
    } catch (err) {
      setInviteError(err.message || 'Failed to revoke invitation.');
    } finally {
      setInviteActionId('');
    }
  };

  return (
    <CursorSurface className="dashboard">
      <Sidebar user={user} onLogout={onLogout} currentPage="manage-users" />
      <main className="manage-users-content">
        <div className="manage-users-header">
          <div>
            <h1>Manage Users</h1>
            <p>Invite managers and staff into {organization?.organizationName || user.organizationName}.</p>
          </div>
          <div className="tenant-summary-card" data-cursor-card>
            <span className="tenant-summary-label">Organization</span>
            <strong>{organization?.organizationName || user.organizationName}</strong>
            <span>{organization?.memberCount ?? users.length} members</span>
          </div>
        </div>

        {loading ? (
          <div className="manage-users-panel" data-cursor-card>
            <p>Loading organization members...</p>
          </div>
        ) : (
          <>
            <div className="manage-users-grid">
              <section className="manage-users-panel" data-cursor-card>
                <h2>Invite User</h2>
                <p className="panel-subtitle">Only admins can invite team members into this organization.</p>
                <form className="invite-form" onSubmit={handleInvite}>
                  <label htmlFor="invite-email">Email</label>
                  <input
                    id="invite-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="new.member@company.com"
                    required
                  />

                  <label htmlFor="invite-role">Role</label>
                  <select id="invite-role" name="role" value={form.role} onChange={handleChange}>
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                  </select>

                  {inviteError ? <div className="manage-users-error">{inviteError}</div> : null}
                  {inviteMessage ? <div className="manage-users-success">{inviteMessage}</div> : null}

                  <button type="submit" className="primary-btn" data-cursor-button disabled={submitting}>
                    {submitting ? 'Creating Invite...' : 'Create Invitation'}
                  </button>
                </form>
              </section>

              <section className="manage-users-panel" data-cursor-card>
                <h2>Pending Invitations</h2>
                <p className="panel-subtitle">Share these links with invited team members to join your workspace.</p>
                <div className="invitation-list">
                  {pendingInvitations.length ? pendingInvitations.map((invitation) => {
                    const inviteLink = `${window.location.origin}/accept-invitation/${invitation.id}`;
                    return (
                      <div className="invitation-card" key={invitation.id}>
                        <div>
                          <p className="invitation-email">{invitation.email}</p>
                          <p className="invitation-meta">
                            {invitation.role} · created {new Date(invitation.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="invitation-actions">
                          <button type="button" className="secondary-btn" onClick={() => copyInviteLink(inviteLink)}>
                            Copy Link
                          </button>
                          <button
                            type="button"
                            className="danger-btn"
                            onClick={() => handleRevokeInvitation(invitation)}
                            disabled={inviteActionId === invitation.id}
                          >
                            {inviteActionId === invitation.id ? 'Revoking...' : 'Revoke'}
                          </button>
                        </div>
                      </div>
                    );
                  }) : <p className="empty-state">No pending invitations right now.</p>}
                </div>
              </section>
            </div>

            <section className="manage-users-panel" data-cursor-card>
              <h2>Organization Members</h2>
              <p className="panel-subtitle">Every user below is scoped to this organization only.</p>
              <div className="members-table-wrapper">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length ? users.map((member) => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>{member.email}</td>
                        <td>
                          {member.id === user.id ? (
                            <span className={`role-badge role-${member.role}`}>{member.role}</span>
                          ) : (
                            <select
                              className="role-select"
                              value={member.role}
                              onChange={(event) => handleRoleChange(member.id, event.target.value)}
                              disabled={roleSavingId === member.id}
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="staff">Staff</option>
                            </select>
                          )}
                        </td>
                        <td>{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'Active'}</td>
                        <td>
                          {member.id === user.id ? (
                            <span className="self-badge">You</span>
                          ) : (
                            <button
                              type="button"
                              className="danger-btn"
                              onClick={() => handleRemoveUser(member)}
                              disabled={memberActionId === member.id}
                            >
                              {memberActionId === member.id ? 'Removing...' : 'Remove'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="empty-state">No members found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </CursorSurface>
  );
}

export default ManageUsersPage;
