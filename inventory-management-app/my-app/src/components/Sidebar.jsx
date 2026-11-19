import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { subscribeToOrganizationSocket } from '../lib/socket';
import './Sidebar.css';

const formatNotificationTime = (value) => {
  if (!value) {
    return 'Just now';
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString();
};

const mergeNotification = (notifications, incoming) => {
  const filtered = notifications.filter((notification) => notification.id !== incoming.id);
  return [incoming, ...filtered].slice(0, 10);
};

const Icon = ({ type }) => {
  const icons = {
    dashboard: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 13.2C3 11.73 3 10.995 3.268 10.345C3.536 9.694 4.044 9.25 5.06 8.364L8.06 5.747C9.626 4.381 10.409 3.698 11.333 3.438C11.777 3.313 12.223 3.313 12.667 3.438C13.591 3.698 14.374 4.381 15.94 5.747L18.94 8.364C19.956 9.25 20.464 9.694 20.732 10.345C21 10.995 21 11.73 21 13.2V14.67C21 17.895 21 19.507 20.025 20.51C19.049 21.512 17.479 21.512 14.338 21.512H9.662C6.521 21.512 4.951 21.512 3.975 20.51C3 19.507 3 17.895 3 14.67V13.2Z" />
      </svg>
    ),
    inventory: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7.5C4 6.119 5.119 5 6.5 5H17.5C18.881 5 20 6.119 20 7.5V16.5C20 17.881 18.881 19 17.5 19H6.5C5.119 19 4 17.881 4 16.5V7.5Z" />
        <path d="M8 9H16" />
        <path d="M8 12H16" />
        <path d="M8 15H13" />
      </svg>
    ),
    orders: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4.75H17C18.795 4.75 19.692 4.75 20.249 5.307C20.806 5.864 20.806 6.761 20.806 8.556V15.444C20.806 17.239 20.806 18.136 20.249 18.693C19.692 19.25 18.795 19.25 17 19.25H7C5.205 19.25 4.308 19.25 3.751 18.693C3.194 18.136 3.194 17.239 3.194 15.444V8.556C3.194 6.761 3.194 5.864 3.751 5.307C4.308 4.75 5.205 4.75 7 4.75Z" />
        <path d="M7.5 9.25H16.5" />
        <path d="M7.5 12.25H13.5" />
        <path d="M7.5 15.25H11.5" />
      </svg>
    ),
    purchase: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 6.25H19L17.7 14.05C17.514 15.169 17.421 15.729 17.055 16.064C16.689 16.4 16.12 16.4 14.982 16.4H9.018C7.88 16.4 7.311 16.4 6.945 16.064C6.579 15.729 6.486 15.169 6.3 14.05L5 6.25Z" />
        <path d="M8 19.25C8.69 19.25 9.25 18.69 9.25 18C9.25 17.31 8.69 16.75 8 16.75C7.31 16.75 6.75 17.31 6.75 18C6.75 18.69 7.31 19.25 8 19.25Z" />
        <path d="M16 19.25C16.69 19.25 17.25 18.69 17.25 18C17.25 17.31 16.69 16.75 16 16.75C15.31 16.75 14.75 17.31 14.75 18C14.75 18.69 15.31 19.25 16 19.25Z" />
        <path d="M4.25 4.75H6L6.6 7.25" />
      </svg>
    ),
    reporting: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5.5 18.75V10.5" />
        <path d="M12 18.75V5.25" />
        <path d="M18.5 18.75V13.5" />
        <path d="M4 18.75H20" />
      </svg>
    ),
    team: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16.5 9.25C16.5 11.183 14.933 12.75 13 12.75C11.067 12.75 9.5 11.183 9.5 9.25C9.5 7.317 11.067 5.75 13 5.75C14.933 5.75 16.5 7.317 16.5 9.25Z" />
        <path d="M6.5 10.5C7.881 10.5 9 9.381 9 8C9 6.619 7.881 5.5 6.5 5.5C5.119 5.5 4 6.619 4 8C4 9.381 5.119 10.5 6.5 10.5Z" />
        <path d="M3.75 17.5C3.75 15.705 5.205 14.25 7 14.25H7.35C8.573 14.25 9.672 14.858 10.337 15.812" />
        <path d="M8.75 18C8.75 15.929 10.429 14.25 12.5 14.25H13.5C15.571 14.25 17.25 15.929 17.25 18V18.25H8.75V18Z" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8.75A3.25 3.25 0 1 0 12 15.25A3.25 3.25 0 1 0 12 8.75Z" />
        <path d="M19.25 13.12V10.88L17.46 10.47C17.31 10.01 17.13 9.57 16.89 9.16L17.88 7.6L16.3 6.02L14.74 7.01C14.33 6.77 13.89 6.59 13.43 6.44L13.02 4.65H10.78L10.37 6.44C9.91 6.59 9.47 6.77 9.06 7.01L7.5 6.02L5.92 7.6L6.91 9.16C6.67 9.57 6.49 10.01 6.34 10.47L4.55 10.88V13.12L6.34 13.53C6.49 13.99 6.67 14.43 6.91 14.84L5.92 16.4L7.5 17.98L9.06 16.99C9.47 17.23 9.91 17.41 10.37 17.56L10.78 19.35H13.02L13.43 17.56C13.89 17.41 14.33 17.23 14.74 16.99L16.3 17.98L17.88 16.4L16.89 14.84C17.13 14.43 17.31 13.99 17.46 13.53L19.25 13.12Z" />
      </svg>
    )
  };

  return icons[type] || null;
};

const BellIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4.75C9.653 4.75 7.75 6.653 7.75 9V11.059C7.75 11.775 7.503 12.469 7.051 13.025L5.686 14.705C4.747 15.861 5.57 17.6 7.058 17.6H16.942C18.43 17.6 19.253 15.861 18.314 14.705L16.949 13.025C16.497 12.469 16.25 11.775 16.25 11.059V9C16.25 6.653 14.347 4.75 12 4.75Z" />
    <path d="M10 19.25C10.456 19.855 11.18 20.25 12 20.25C12.82 20.25 13.544 19.855 14 19.25" />
  </svg>
);

function Sidebar({ user, onLogout, currentPage }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);
  const [notificationError, setNotificationError] = useState('');
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const canManageStock = ['admin', 'manager'].includes(user.role);
  const canViewReports = ['admin', 'manager'].includes(user.role);
  const canManageUsers = user.role === 'admin';

  const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/dashboard', id: 'dashboard' },
    { icon: 'inventory', label: 'Inventory', path: '/inventory', id: 'inventory' },
    canManageStock ? { icon: 'orders', label: 'Sales', path: '/orders', id: 'orders' } : null,
    canManageStock ? { icon: 'purchase', label: 'Purchases', path: '/purchase', id: 'purchase' } : null,
    canViewReports ? { icon: 'reporting', label: 'Reporting', path: '/reporting', id: 'reporting' } : null,
    canManageUsers ? { icon: 'team', label: 'Manage Users', path: '/manage-users', id: 'manage-users' } : null,
    { icon: 'settings', label: 'Settings', path: '/settings', id: 'settings' }
  ].filter(Boolean);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      setIsNotificationLoading(true);

      try {
        const response = await api.get('/api/notifications?limit=10');

        if (!isMounted) {
          return;
        }

        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
        setNotificationError('');
      } catch (error) {
        if (isMounted) {
          setNotificationError(error.message || 'Failed to load notifications.');
        }
      } finally {
        if (isMounted) {
          setIsNotificationLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let detachSocketListener = () => {};

    const connectSocket = async () => {
      try {
        if (!isMounted) {
          return;
        }

        detachSocketListener = await subscribeToOrganizationSocket({
          organizationId: user.organizationId,
          userId: user.id,
          handlers: {
            'notification:new': (notification) => {
              setNotifications((prev) => mergeNotification(prev, notification));
              setUnreadCount((prev) => prev + (notification.isRead ? 0 : 1));
            },
            'notification:updated': (payload) => {
              if (payload.userId !== user.id) {
                return;
              }

              setNotifications((prev) => prev.map((notification) => (
                notification.id === payload.notification.id ? payload.notification : notification
              )));
              setUnreadCount(payload.unreadCount || 0);
            },
            'notification:all-read': (payload) => {
              if (payload.userId !== user.id) {
                return;
              }

              setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
              setUnreadCount(payload.unreadCount || 0);
            }
          }
        });
      } catch (error) {
        if (isMounted) {
          setNotificationError((prev) => prev || error.message || 'Realtime notifications are unavailable.');
        }
      }
    };

    connectSocket();

    return () => {
      isMounted = false;
      detachSocketListener();
    };
  }, [user.id, user.organizationId]);

  const handleLogout = () => {
    Promise.resolve(onLogout()).finally(() => {
      navigate('/login');
    });
  };

  const handleNotificationRead = async (notificationId, isRead) => {
    if (isRead) {
      return;
    }

    try {
      const response = await api.patch(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) => prev.map((notification) => (
        notification.id === notificationId ? response.notification : notification
      )));
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      setNotificationError(error.message || 'Failed to update notification.');
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);

    try {
      const response = await api.patch('/api/notifications/read-all');
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      setUnreadCount(response.unreadCount || 0);
      setNotificationError('');
    } catch (error) {
      setNotificationError(error.message || 'Failed to mark notifications as read.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <p className="user-name">{user.name}</p>
          <p className="user-email" title={user.email}>{user.email}</p>
          <p className="user-email" title={user.organizationName}>{user.organizationName}</p>
          <p className="user-email">{user.role}</p>
        </div>
      </div>

      <div className="sidebar-utility-card" ref={panelRef}>
        <div className="sidebar-utility-header">
          <p className="sidebar-section-label">Notifications</p>
          {unreadCount ? <span className="notification-chip">{unreadCount}</span> : null}
        </div>
        <button
          type="button"
          className={`notification-trigger ${isNotificationOpen ? 'open' : ''}`}
          onClick={() => setIsNotificationOpen((prev) => !prev)}
        >
          <span className="notification-icon">
            <BellIcon />
          </span>
          <span className="notification-trigger-text">Team Activity</span>
        </button>

        {isNotificationOpen ? (
          <div className="notification-panel">
            <div className="notification-panel-header">
              <div>
                <h3>Latest Updates</h3>
                <p>Live organization activity feed</p>
              </div>
              <button
                type="button"
                className="notification-link"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll || unreadCount === 0}
              >
                {isMarkingAll ? 'Saving...' : 'Mark all read'}
              </button>
            </div>

            {notificationError ? <div className="notification-error">{notificationError}</div> : null}

            {isNotificationLoading ? (
              <p className="notification-empty">Loading notifications...</p>
            ) : notifications.length ? (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                    onClick={() => handleNotificationRead(notification.id, notification.isRead)}
                  >
                    <div className="notification-item-top">
                      <strong>{notification.title}</strong>
                      <span>{formatNotificationTime(notification.createdAt)}</span>
                    </div>
                    <p>{notification.message}</p>
                    {!notification.isRead ? <span className="notification-dot" /> : null}
                  </button>
                ))}
              </div>
            ) : (
              <p className="notification-empty">No notifications yet for this organization.</p>
            )}
          </div>
        ) : null}
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Navigation</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">
              <Icon type={item.icon} />
            </span>
            <span className="nav-item-text">{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
