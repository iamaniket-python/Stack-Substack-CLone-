import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MailCheck } from 'lucide-react';
import { forgotPasswordAPI } from '../../features/auth/passwordResetAPI';
import '../../styles/auth.css';
import '../../styles/auth-extras.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (value) => {
  const v = value.trim();
  if (!v) return 'Email daalna zaroori hai';
  if (!EMAIL_REGEX.test(v)) return 'Sahi email address daalo';
  return '';
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  // Blur par validate
  const handleBlur = () => {
    if (email) setError(validateEmail(email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // double submit roko

    const msg = validateEmail(email);
    setError(msg);
    if (msg) return;

    setLoading(true);
    try {
      await forgotPasswordAPI(email.trim());
      setSent(true);
    } catch (err) {
      const m = err?.response
        ? err.response.data?.message || 'Kuch gadbad ho gayi, dobara try karo'
        : 'Network problem hai, internet check karke dobara try karo';
      setError(m);
      toast.error(m);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-success" role="status">
          <div className="auth-success-icon">
            <MailCheck aria-hidden="true" />
          </div>
          <h1>Email check karo</h1>
          <p className="auth-card-subtitle">
            Agar <strong>{email.trim()}</strong> se account hai, to password reset link bhej
            diya gaya hai. Link 30 minute tak valid hai.
          </p>
          <p className="auth-switch">
            <Link to="/login">Login par wapas jao</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Password bhool gaye?</h1>
        <p className="auth-card-subtitle">
          Apna email daalo, hum reset link bhej denge.
        </p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'email-error' : undefined}
          required
        />
        {error && (
          <p id="email-error" className="field-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? (
            <span className="auth-btn-content">
              <span className="auth-spinner" aria-hidden="true" />
              Bhej rahe hain...
            </span>
          ) : (
            'Reset link bhejo'
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