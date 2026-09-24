import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
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

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Stack
      </Link>

      <div className="navbar-links">
        <Link to="/search">Search</Link>

        {user ? (
          <>
            <Link to="/write">Write</Link>
            <Link to="/dashboard">Dashboard</Link>
            <NotificationBell />
            <Link to={`/author/${user.id}`} className="navbar-avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} />
              ) : (
                <span className="navbar-avatar-fallback">{user.name[0]}</span>
              )}
            </Link>
            <button onClick={handleLogout} className="navbar-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="navbar-cta">
              Sign up
            </Link>
            <Link to="/messages">Messages</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;