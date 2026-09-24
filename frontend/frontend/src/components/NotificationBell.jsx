import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  receiveLiveNotification,
} from '../features/notifications/notificationSlice';
import { getSocket } from '../socket/socketClient';
import '../styles/notifications.css';

const NOTIFICATION_LABELS = {
  new_subscriber: (n) => `${n.actor_name} subscribed to you`,
  new_comment: (n) => `${n.actor_name} commented on your post`,
  new_like: (n) => `${n.actor_name} liked your post`,
  new_message: (n) => `${n.actor_name} sent you a message`,
  post_published: (n) => `${n.actor_name} published a new post`,
};

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const { items, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Listen for live notifications on the shared socket connection
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (notification) => dispatch(receiveLiveNotification(notification));
    socket.on('notification:new', handler);

    return () => socket.off('notification:new', handler);
  }, [dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifClick = (notif) => {
    if (!notif.is_read) dispatch(markAsRead(notif.id));
  };

  return (
    <div className="notif-bell-wrapper" ref={dropdownRef}>
      <button className="notif-bell-btn" onClick={() => setOpen((o) => !o)}>
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={() => dispatch(markAllAsRead())} className="notif-mark-all">
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {items.length === 0 ? (
              <p className="notif-empty">No notifications yet</p>
            ) : (
              items.map((n) => {
                const label = NOTIFICATION_LABELS[n.type]?.(n) || n.message;
                return (
                  <div
                    key={n.id}
                    className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                    onClick={() => handleNotifClick(n)}
                  >
                    <img
                      src={n.actor_avatar || 'https://via.placeholder.com/36'}
                      alt=""
                      className="notif-item-avatar"
                    />
                    <div className="notif-item-body">
                      <p>{label}</p>
                      <span>{timeAgo(n.created_at)}</span>
                    </div>
                    {!n.is_read && <span className="notif-dot" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;