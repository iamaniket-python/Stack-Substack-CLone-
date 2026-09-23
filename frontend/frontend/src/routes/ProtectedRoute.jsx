import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user, initialized } = useSelector((state) => state.auth);

  if (!initialized) return null; // wait for the session check to finish
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;