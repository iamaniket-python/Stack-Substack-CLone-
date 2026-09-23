import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logoutUser } from '../features/auth/authSlice';
import '../styles/navbar.css';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Substack
      </Link>

      <div className="navbar-links">
        <Link to="/search">Search</Link>

        {user ? (
          <>
            <Link to="/write">Write</Link>
            <Link to="/dashboard">Dashboard</Link>
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
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;