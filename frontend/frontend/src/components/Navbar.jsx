import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Home,
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
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) connectSocket();
    return () => {
      if (!user) disconnectSocket();
    };
  }, [user]);

  // Bottom bar sirf logged-in user ko dikhta hai: page ke neeche jagah chhodo
  useEffect(() => {
    document.body.classList.toggle('has-bottom-nav', Boolean(user));
    return () => document.body.classList.remove('has-bottom-nav');
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

  const onWritePage = location.pathname.startsWith('/write');

  return (
    <>
      {/* ---------- TOP BAR: logo left, search + profile right ---------- */}
      <header className="navbar">
        <Link to="/" className="navbar-logo" aria-label="Stack home">
          Stack
        </Link>

        <div className="navbar-actions">
          <NavLink to="/search" className="top-icon" title="Search" aria-label="Search">
            <Search size={20} aria-hidden="true" />
          </NavLink>

          {user ? (
            <>
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
                className="top-icon top-icon--danger"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={19} aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="top-icon" title="Log in" aria-label="Log in">
                <LogIn size={20} aria-hidden="true" />
              </NavLink>
              <Link to="/register" className="navbar-cta">
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ---------- BOTTOM BAR + FLOATING + (sirf logged-in) ---------- */}
      {user && (
        <>
          <nav className="bottom-nav" aria-label="Main navigation">
            <NavLink to="/" end className="nav-link" title="Home" aria-label="Home">
              <Home size={22} aria-hidden="true" />
            </NavLink>

            <NavLink
              to="/dashboard"
              className="nav-link"
              title="Dashboard"
              aria-label="Dashboard"
            >
              <LayoutDashboard size={22} aria-hidden="true" />
            </NavLink>

            <NavLink
              to="/messages"
              className="nav-link nav-link--with-badge"
              title="Chat"
              aria-label={unreadCount > 0 ? `Chat, ${unreadCount} unread` : 'Chat'}
            >
              <MessageCircle size={22} aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="nav-unread-badge" aria-hidden="true">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>

            <NotificationBell />
          </nav>

          {!onWritePage && (
            <Link to="/write" className="fab" title="Write a post" aria-label="Write a post">
              <Plus size={28} aria-hidden="true" />
            </Link>
          )}
        </>
      )}
    </>
  );
};

export default Navbar;