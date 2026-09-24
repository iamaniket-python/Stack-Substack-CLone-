import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
// lucide icons: mobile par text hide hoga, icon hi dikhega
import {
  Search,
  PenLine,
  LayoutDashboard,
  MessageCircle,
  LogOut,
  LogIn,
} from 'lucide-react';
import { logoutUser } from '../features/auth/authSlice';
import { connectSocket, disconnectSocket } from '../socket/socketClient';
import NotificationBell from './NotificationBell';
import '../styles/navbar.css';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) connectSocket();
    return () => {
      if (!user) disconnectSocket();
    };
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    disconnectSocket();
    toast.success('Logged out');
    navigate('/login');
  };

  // NavLink current page par apne aap "active" class laga deta hai
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Stack
      </Link>

      <div className="navbar-links">
        {/* title + aria-label: text hide hone par bhi accessibility aur hover tooltip milega */}
        <NavLink to="/search" className="nav-link" title="Search" aria-label="Search">
          <Search size={18} />
          <span className="nav-label">Search</span>
        </NavLink>

        {user ? (
          <>
            <NavLink to="/write" className="nav-link" title="Write" aria-label="Write">
              <PenLine size={18} />
              <span className="nav-label">Write</span>
            </NavLink>

            <NavLink
              to="/dashboard"
              className="nav-link"
              title="Dashboard"
              aria-label="Dashboard"
            >
              <LayoutDashboard size={18} />
              <span className="nav-label">Dashboard</span>
            </NavLink>

            <NavLink
              to="/messages"
              className="nav-link"
              title="Messages"
              aria-label="Messages"
            >
              <MessageCircle size={18} />
              <span className="nav-label">Messages</span>
            </NavLink>

            <NotificationBell />

            {/* user.id na ho to /author/undefined ka link hi nahi banega (issue #3 ka guard) */}
            {user.id && (
              <Link
                to={`/author/${user.id}`}
                className="navbar-avatar"
                title="Profile"
                aria-label="Profile"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name || 'Profile'} />
                ) : (
                  <span className="navbar-avatar-fallback">
                    {(user.name?.[0] || '?').toUpperCase()}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="navbar-logout"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
              <span className="nav-label">Logout</span>
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="nav-link" title="Log in" aria-label="Log in">
              <LogIn size={18} />
              <span className="nav-label">Log in</span>
            </NavLink>

            {/* Sign up CTA mobile par bhi text ke saath rahega */}
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