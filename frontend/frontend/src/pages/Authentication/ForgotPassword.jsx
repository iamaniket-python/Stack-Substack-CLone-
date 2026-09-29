import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { directResetPasswordAPI } from '../../features/auth/passwordResetAPI';
import '../../styles/auth.css';
import '../../styles/auth-extras.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (v) => {
  const t = v.trim();
  if (!t) return 'Email daalna zaroori hai';
  if (!EMAIL_REGEX.test(t)) return 'Sahi email address daalo';
  return '';
};

const validatePassword = (v) => {
  if (!v) return 'Naya password daalna zaroori hai';
  if (v.length < 8) return 'Password kam se kam 8 characters ka hona chahiye';
  return '';
};

const validateConfirm = (pw, c) => {
  if (!c) return 'Password dobara daalo';
  if (pw !== c) return 'Dono passwords match nahi kar rahe';
  return '';
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', confirm: '', form: '' });
  const [loading, setLoading] = useState(false);

  const clear = (key) => setErrors((p) => ({ ...p, [key]: '', form: '' }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // double submit roko

    const next = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirm(password, confirm),
      form: '',
    };
    setErrors(next);
    if (next.email || next.password || next.confirm) return;

    setLoading(true);
    try {
      await directResetPasswordAPI({ email: email.trim(), password });
      toast.success('Password badal gaya. Ab login karo.');
      navigate('/login', { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      let m;
      if (!err?.response) m = 'Network problem hai, internet check karke dobara try karo';
      else if (status === 404) m = 'Is email se koi account nahi mila';
      else if (status === 429) m = 'Bahut zyada koshish ho gayi, thodi der baad try karo';
      else m = err.response.data?.message || 'Kuch gadbad ho gayi, dobara try karo';

      if (status === 404) setErrors((p) => ({ ...p, email: m }));
      else setErrors((p) => ({ ...p, form: m }));
      toast.error(m);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Password reset karo</h1>
        <p className="auth-card-subtitle">Apna email aur naya password daalo.</p>

        {errors.form && (
          <p className="auth-error" role="alert">
            {errors.form}
          </p>
        )}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) clear('email');
          }}
          onBlur={() => email && setErrors((p) => ({ ...p, email: validateEmail(email) }))}
          disabled={loading}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
          required
        />
        {errors.email && (
          <p id="email-error" className="field-error" role="alert">
            {errors.email}
          </p>
        )}

        <label htmlFor="password">Naya password</label>
        <div className="password-input-wrapper">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) clear('password');
            }}
            onBlur={() =>
              password && setErrors((p) => ({ ...p, password: validatePassword(password) }))
            }
            disabled={loading}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
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
        {errors.password && (
          <p id="password-error" className="field-error" role="alert">
            {errors.password}
          </p>
        )}

        <label htmlFor="confirm">Password dobara likho</label>
        <input
          id="confirm"
          name="confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (errors.confirm) clear('confirm');
          }}
          onBlur={() =>
            confirm && setErrors((p) => ({ ...p, confirm: validateConfirm(password, confirm) }))
          }
          disabled={loading}
          aria-invalid={Boolean(errors.confirm)}
          aria-describedby={errors.confirm ? 'confirm-error' : undefined}
          required
        />
        {errors.confirm && (
          <p id="confirm-error" className="field-error" role="alert">
            {errors.confirm}
          </p>
        )}

        <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? (
            <span className="auth-btn-content">
              <span className="auth-spinner" aria-hidden="true" />
              Save ho raha hai...
            </span>
          ) : (
            'Password badlo'
          )}
        </button>

        <p className="auth-switch">
          Yaad aa gaya? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;