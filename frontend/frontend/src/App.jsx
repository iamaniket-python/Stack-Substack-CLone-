import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { fetchCurrentUser } from './features/auth/authSlice';
import Navbar from './components/Navbar';
import Login from "./pages/Authentication/Login";
import Register from './pages/Authentication/Register';
import ForgotPassword from './pages/Authentication/ForgotPassword';
import ResetPassword from './pages/Authentication/ResetPassword';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import WritePost from './pages/WritePost';
import Dashboard from './pages/Dashboard';
import AuthorProfile from './pages/AuthorProfile';
import Messages from './pages/Messages';
import Search from './pages/Search';
import ProtectedRoute from './routes/ProtectedRoute';
import NotificationsPage from './pages/NotificationsPage';
import AppLoader from './components/AppLoader';

function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (!initialized) {
      return <AppLoader />;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/author/:id" element={<AuthorProfile />} />
        <Route path="/search" element={<Search />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/write" element={<WritePost />} />
          <Route path="/write/:id" element={<WritePost />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;