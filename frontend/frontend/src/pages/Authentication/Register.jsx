import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { registerUser, clearAuthError } from '../../features/auth/authSlice';
import '../../styles/auth.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_NAME = 60;

const validate = ({ name, email, password }) => {
  const errors = {};

  const n = name.trim();
  if (!n) errors.name = 'Please enter your name';
  else if (n.length < 2) errors.name = 'Name must be at least 2 characters';
  else if (n.length > MAX_NAME) errors.name = `Name must be under ${MAX_NAME} characters`;

  const e = email.trim();
  if (!e) errors.email = 'Please enter your email';
  else if (!EMAIL_REGEX.test(e)) errors.email = 'Please enter a valid email address';

  if (!password) errors.password = 'Please enter a password';
  else if (password.length < MIN_PASSWORD)
    errors.password = `Password must be at least ${MIN_PASSWORD} characters`;
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    errors.password = 'Password must include at least one letter and one number';

  return errors;
};

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const isLoading = status === 'loading';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Us field ka error type karte hi hata do
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // double submit roko

    const found = validate(formData);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      // Pehle galat field par focus
      const first = ['name', 'email', 'password'].find((k) => found[k]);
      if (first) document.getElementById(first)?.focus();
      return;
    }

    dispatch(clearAuthError());

    const result = await dispatch(
      registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password, // password ko trim mat karo
      })
    );

    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created!');
      navigate('/');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create your account</h1>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          autoFocus
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
          maxLength={MAX_NAME}
          required
        />
        {errors.name && (
          <p id="name-error" className="auth-field-error" role="alert">
            {errors.name}
          </p>
        )}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
          required
        />
        {errors.email && (
          <p id="email-error" className="auth-field-error" role="alert">
            {errors.email}
          </p>
        )}

        <label htmlFor="password">Password</label>
        <div className="password-input-wrapper">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : 'password-hint'}
            required
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {errors.password ? (
          <p id="password-error" className="auth-field-error" role="alert">
            {errors.password}
          </p>
        ) : (
          <p id="password-hint" className="auth-field-hint">
            At least {MIN_PASSWORD} characters, with a letter and a number.
          </p>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;