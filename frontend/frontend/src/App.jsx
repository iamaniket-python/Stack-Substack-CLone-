import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useLocation } from 'react-router-dom';
import { fetchCurrentUser } from './features/auth/authSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from "./pages/Authentication/Login"; 
import Register from './pages/Authentication/Register';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import WritePost from './pages/WritePost';
import Dashboard from './pages/Dashboard';
import AuthorProfile from './pages/AuthorProfile';
import Messages from './pages/Messages';
import Search from './pages/Search';
import ProtectedRoute from './routes/ProtectedRoute';
import NotificationsPage from './pages/NotificationsPage';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import TermsAndConditions from './pages/Legal/TermsAndConditions';
import RefundPolicy from './pages/Legal/RefundPolicy';



function App() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (!initialized) {
    return <div className="app-loading">Loading...</div>;
  }

  // Messages full-height chat screen hai, wahan footer layout tod dega
  const showFooter = !pathname.startsWith('/messages');

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/author/:id" element={<AuthorProfile />} />
        <Route path="/search" element={<Search />} />

        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/write" element={<WritePost />} />
          <Route path="/write/:id" element={<WritePost />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
      {showFooter && <Footer />}
    </>
  );
}

export default App;