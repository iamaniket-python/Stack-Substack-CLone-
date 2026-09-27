import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getNotificationsAPI } from '../features/notifications/notificationAPI';
import {
  markAsRead,
  markAllAsRead,
} from '../features/notifications/notificationSlice';
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

const NotificationsPage = () => {
  const dispatch = useDispatch();

  // Local state — is page ka apna pagination hai, Redux slice ke
  // global `items` (jo bell dropdown use karta hai) ko overwrite
  // nahi karna chahte
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState('idle'); // idle | loading | loadingMore | error
  const unreadCount = items.filter((n) => !n.is_read).length;

  const loadPage = useCallback(async (pageNum, mode) => {
    setStatus(mode === 'append' ? 'loadingMore' : 'loading');
    try {
      const { data } = await getNotificationsAPI(pageNum);
      const fetched = data.data.notifications || [];

      setItems((prev) => (mode === 'append' ? [...prev, ...fetched] : fetched));
      // Agar backend ne is page mein khaali/kam items diye, maan lo aur pages nahi hain
      setHasMore(fetched.length > 0 && fetched.length >= 10);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadPage(1, 'replace');
  }, [loadPage]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPage(nextPage, 'append');
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) {
      dispatch(markAsRead(notif.id));
      setItems((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="notifications-page">
      <div className="notifications-page-header">
        <h2>Notifications</h2>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="notif-mark-all">
            Mark all read
          </button>
        )}
      </div>

      {status === 'loading' ? (
        <p className="notif-empty">Loading...</p>
      ) : items.length === 0 ? (
        <p className="notif-empty">No notifications yet</p>
      ) : (
        <>
          <div className="notif-list notif-list-page">
            {items.map((n) => {
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
            })}
          </div>

          {hasMore && (
            <button
              className="notif-load-more"
              onClick={handleLoadMore}
              disabled={status === 'loadingMore'}
            >
              {status === 'loadingMore' ? 'Loading...' : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage;