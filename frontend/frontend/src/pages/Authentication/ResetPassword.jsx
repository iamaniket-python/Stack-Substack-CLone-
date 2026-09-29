import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LinkIcon } from 'lucide-react';
import { resetPasswordAPI } from '../../features/auth/passwordResetAPI';
import '../../styles/auth.css';
import '../../styles/auth-extras.css';

const TOKEN_REGEX = /^[a-f0-9]{64}$/i;

const validatePassword = (v) => {
  if (!v) return 'Naya password daalna zaroori hai';
  if (v.length < 8) return 'Password kam se kam 8 characters ka hona chahiye';
  return '';
};

const validateConfirm = (pw, confirm) => {
  if (!confirm) return 'Password dobara daalo';
  if (pw !== confirm) return 'Dono passwords match nahi kar rahe';
  return '';
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ password: '', confirm: '', form: '' });
  const [loading, setLoading] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(!TOKEN_REGEX.test(token || ''));

  if (linkInvalid) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-success" role="alert">
          <div className="auth-success-icon">
            <LinkIcon aria-hidden="true" />
          </div>
          <h1>Link kaam nahi kar raha</h1>
          <p className="auth-card-subtitle">
            Ye reset link invalid hai, expire ho gaya hai ya pehle use ho chuka hai.
          </p>
          <p className="auth-switch">
            <Link to="/forgot-password">Naya link mangao</Link>
          </p>
        </div>
      </div>
    );
  }

  const clear = (key) => setErrors((prev) => ({ ...prev, [key]: '', form: '' }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // double submit roko

    const next = {
      password: validatePassword(password),
      confirm: validateConfirm(password, confirm),
      form: '',
    };
    setErrors(next);
    if (next.password || next.confirm) return;

    setLoading(true);
    try {
      await resetPasswordAPI({ token, password });
      toast.success('Password badal gaya. Ab login karo.');
      navigate('/login', { replace: true });
    } catch (err) {
      if (err?.response?.status === 400) {
        // Client-side checks pass ho chuke hain, to 400 ka matlab token invalid/expired
        setLinkInvalid(true);
      } else {
        const m = err?.response
          ? err.response.data?.message || 'Kuch gadbad ho gayi, dobara try karo'
          : 'Network problem hai, internet check karke dobara try karo';
        setErrors((prev) => ({ ...prev, form: m }));
        toast.error(m);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Naya password set karo</h1>
        <p className="auth-card-subtitle">Kam se kam 8 characters ka password chuno.</p>

        {errors.form && (
          <p className="auth-error" role="alert">
            {errors.form}
          </p>
        )}

        <label htmlFor="password">Naya password</label>
        <div className="password-input-wrapper">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            autoFocus
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
      </form>
    </div>
  );
};

export default ResetPassword;