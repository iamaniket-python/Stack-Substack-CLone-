import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";
import { loginUser, clearAuthError } from "../../features/auth/authSlice";
import "../../styles/auth-extras.css";
import "../../styles/auth.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [isSlow, setIsSlow] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);

  const isLoading = status === "loading";

  // ProtectedRoute ne jahan se bheja tha wahin wapas jao, warna home
  const redirectTo = location.state?.from?.pathname || "/";

  // Page chhodte waqt purana error saaf karo
  useEffect(() => {
    dispatch(clearAuthError());
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  // Render free tier cold start: 4 sec se zyada lage to user ko batao
  useEffect(() => {
    if (!isLoading) {
      setIsSlow(false);
      return;
    }
    const timer = setTimeout(() => setIsSlow(true), 4000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldError) setFieldError("");
    if (error) dispatch(clearAuthError());
  };

  const handlePasswordKey = (e) => {
    setCapsLockOn(e.getModifierState && e.getModifierState("CapsLock"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // double submit roko

    const email = formData.email.trim();

    if (!EMAIL_REGEX.test(email)) {
      setFieldError("Please enter a valid email address");
      return;
    }
    if (!formData.password) {
      setFieldError("Please enter your password");
      return;
    }

    dispatch(clearAuthError());

    const result = await dispatch(
      loginUser({ email, password: formData.password }),
    );

    if (loginUser.fulfilled.match(result)) {
      toast.success("Welcome back!");
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  const shownError = fieldError || error;

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Welcome back</h1>
        <p className="auth-card-subtitle">
          Log in to continue reading and writing.
        </p>

        {shownError && (
          <p className="auth-error" role="alert">
            {shownError}
          </p>
        )}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />

        <label htmlFor="password">Password</label>
        <div className="password-input-wrapper">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            onKeyUp={handlePasswordKey}
            onKeyDown={handlePasswordKey}
            onBlur={() => setCapsLockOn(false)}
            disabled={isLoading}
            required
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {capsLockOn && (
          <p className="auth-caps-warning" role="status">
            <TriangleAlert size={14} /> Caps Lock is on
          </p>
        )}
        <div className="auth-forgot-row">
          <Link to="/forgot-password" className="auth-forgot-link">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="auth-btn-content">
              <span className="auth-spinner" aria-hidden="true" />
              Logging in...
            </span>
          ) : (
            "Log in"
          )}
        </button>

        {isSlow && (
          <p className="auth-slow-hint" role="status">
            Server jag raha hai, pehli baar 30-60 sec lag sakte hain. Please
            wait...
          </p>
        )}

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
