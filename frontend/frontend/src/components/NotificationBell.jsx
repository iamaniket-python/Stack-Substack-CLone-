import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchNotifications,
  receiveLiveNotification,
} from '../features/notifications/notificationSlice';
import { getSocket } from '../socket/socketClient';
import '../styles/notifications.css';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Listen for live notifications on the shared socket connection
  // — badge count update hota rahega chahe user page pe ho ya na ho
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (notification) => dispatch(receiveLiveNotification(notification));
    socket.on('notification:new', handler);

    return () => socket.off('notification:new', handler);
  }, [dispatch]);

  return (
    <Link to="/notifications" className="notif-bell-wrapper" title="Notifications" aria-label="Notifications">
      <span className="notif-bell-btn">
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </span>
    </Link>
  );
};

export default NotificationBell;