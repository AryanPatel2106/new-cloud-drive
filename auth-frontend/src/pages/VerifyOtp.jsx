import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import api from '../api/axios';
import { useSEO } from '../hooks/useSEO';
import AuthLayout from '../components/layout/AuthLayout';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useSEO({
    title: 'Verify Email',
    description: 'Verify your CloudDrive account with the one-time passcode sent to your email.',
    path: '/verify-otp',
    noindex: true,
  });

  useEffect(() => {
    if (!email) {
      setFeedback({ type: 'error', message: 'No email found. Redirecting to registration…' });
      const timer = setTimeout(() => navigate('/register'), 3000);
      return () => clearTimeout(timer);
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setLoading(true);

    try {
      await api.post('/auth/verify-otp', { otp, email });
      setFeedback({ type: 'success', message: 'Email verified! Redirecting to sign in…' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Invalid or expired code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setFeedback({ type: '', message: '' });
    try {
      await api.post('/auth/resend-otp', { email });
      setFeedback({ type: 'success', message: 'A new verification code has been sent to your email.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Could not resend code.' });
    }
  };

  return (
    <AuthLayout
      icon={MailCheck}
      title="Verify your email"
      subtitle={
        <>
          Enter the 6-character code sent to{' '}
          <strong style={{ color: 'var(--slate-800)' }}>{email || 'your email'}</strong>.
          It expires in 5 minutes.
        </>
      }
    >
      {feedback.message && (
        <Alert type={feedback.type === 'success' ? 'success' : 'error'}>{feedback.message}</Alert>
      )}

      <form onSubmit={handleVerify} className="auth-form">
        <div className="form-group">
          <label htmlFor="otp-input" className="form-label">Verification code</label>
          <input
            id="otp-input"
            type="text"
            className="form-input form-input--otp"
            required
            placeholder="A1B2C3"
            maxLength={32}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            autoComplete="one-time-code"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading || !email}>
          {loading ? <Spinner label="Verifying…" /> : 'Verify email'}
        </button>
      </form>

      <div className="auth-actions-row">
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleResend} disabled={!email}>
          Resend code
        </button>
        <Link to="/register" className="btn btn-ghost btn-sm">Start over</Link>
      </div>
    </AuthLayout>
  );
}
