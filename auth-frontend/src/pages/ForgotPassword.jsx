import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import api from '../api/axios';
import { useSEO } from '../hooks/useSEO';
import AuthLayout from '../components/layout/AuthLayout';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  useSEO({
    title: 'Forgot Password',
    description: 'Reset your CloudDrive account password. Enter your email to receive a secure reset link.',
    path: '/forgot-password',
    noindex: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setStatus({
        type: 'success',
        msg: 'If an account exists with that email, a password reset link has been sent.',
      });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={KeyRound}
      title="Reset your password"
      subtitle="Enter the email associated with your account and we'll send you a reset link."
      footer={
        <p>
          Remember your password? <Link to="/login">Back to sign in</Link>
        </p>
      }
    >
      {status.msg && <Alert type={status.type === 'success' ? 'success' : 'error'}>{status.msg}</Alert>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="recovery-email" className="form-label">Email address</label>
          <input
            id="recovery-email"
            type="email"
            className="form-input"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <Spinner label="Sending link…" /> : 'Send reset link'}
        </button>
      </form>
    </AuthLayout>
  );
}
