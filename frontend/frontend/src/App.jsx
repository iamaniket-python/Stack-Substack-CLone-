import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { fetchCurrentUser } from './features/auth/authSlice';
import Navbar from './components/Navbar';
import Login from './pages/Authentication/Login';
import Register from './pages/Authentication/Register';
import WritePost from './pages/WritePost';
import ProtectedRoute from './routes/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import AuthorProfile from './pages/AuthorProfile';

function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (!initialized) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<div>Home feed — Step 3 builds this</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      
        <Route element={<ProtectedRoute />}>
        <Route path="/write" element={<WritePost />} />
        <Route path="/write/:id" element={<WritePost />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/author/:id" element={<AuthorProfile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;