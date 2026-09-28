import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  PenLine,
  LayoutDashboard,
  MessageCircle,
  LogOut,
  LogIn,
} from 'lucide-react';
import { logoutUser } from '../features/auth/authSlice';
import { getConversationsAPI } from '../features/messages/messageAPI';
import { connectSocket, disconnectSocket, getSocket } from '../socket/socketClient';
import NotificationBell from './NotificationBell';
import '../styles/navbar.css';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) connectSocket();
    return () => {
      if (!user) disconnectSocket();
    };
  }, [user]);

  // Total unread messages: Messages icon ke badge ke liye
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;
    let attachedSocket = null;

    const refresh = async () => {
      try {
        const { data } = await getConversationsAPI();
        if (cancelled) return;
        const total = data.data.conversations.reduce(
          (sum, c) => sum + (Number(c.unread_count) || 0),
          0
        );
        setUnreadCount(total);
      } catch {
        // badge silent fail: navbar par toast nahi chahiye
      }
    };

    // Socket late connect ho to bhi listener lag jaye
    const attach = () => {
      const s = getSocket();
      if (s && s !== attachedSocket) {
        if (attachedSocket) attachedSocket.off('message:new', refresh);
        s.on('message:new', refresh);
        attachedSocket = s;
      }
    };

    refresh();
    attach();
    const retryTimer = setInterval(attach, 1500);
    // Messages page / ChatWindow padhne ke baad ye event bhejte hain
    window.addEventListener('messages:changed', refresh);

    return () => {
      cancelled = true;
      clearInterval(retryTimer);
      window.removeEventListener('messages:changed', refresh);
      if (attachedSocket) attachedSocket.off('message:new', refresh);
    };
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    disconnectSocket();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="navbar" aria-label="Main navigation">
      <Link to="/" className="navbar-logo" aria-label="Stack home">
        Stack
      </Link>

      <div className="navbar-links">
        <NavLink to="/search" className="nav-link" title="Search" aria-label="Search">
          <Search size={18} aria-hidden="true" />
          <span className="nav-label">Search</span>
        </NavLink>

        {user ? (
          <>
            <NavLink to="/write" className="nav-link" title="Write" aria-label="Write">
              <PenLine size={18} aria-hidden="true" />
              <span className="nav-label">Write</span>
            </NavLink>

            <NavLink
              to="/dashboard"
              className="nav-link"
              title="Dashboard"
              aria-label="Dashboard"
            >
              <LayoutDashboard size={18} aria-hidden="true" />
              <span className="nav-label">Dashboard</span>
            </NavLink>

            <NavLink
              to="/messages"
              className="nav-link nav-link--with-badge"
              title="Messages"
              aria-label={unreadCount > 0 ? `Messages, ${unreadCount} unread` : 'Messages'}
            >
              <MessageCircle size={18} aria-hidden="true" />
              <span className="nav-label">Messages</span>
              {unreadCount > 0 && (
                <span className="nav-unread-badge" aria-hidden="true">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>

            <NotificationBell />

            {user.id && (
              <Link
                to={`/author/${user.id}`}
                className="navbar-avatar"
                title="Your profile"
                aria-label="Your profile"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name ? `${user.name} ka profile photo` : 'Aapka profile photo'}
                  />
                ) : (
                  <span className="navbar-avatar-fallback" aria-hidden="true">
                    {(user.name?.[0] || '?').toUpperCase()}
                  </span>
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="navbar-logout"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} aria-hidden="true" />
              <span className="nav-label">Logout</span>
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="nav-link" title="Log in" aria-label="Log in">
              <LogIn size={18} aria-hidden="true" />
              <span className="nav-label">Log in</span>
            </NavLink>

            <Link to="/register" className="navbar-cta">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;