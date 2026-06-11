import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import api from '../api/axios';
import { useSEO } from '../hooks/useSEO';
import AuthLayout from '../components/layout/AuthLayout';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

export default function ResetPassword() {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [info, setInfo] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  useSEO({
    title: 'Set New Password',
    description: 'Set a new password for your CloudDrive account.',
    path: `/reset-password/${resetToken}`,
    noindex: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInfo({ type: '', msg: '' });
    setLoading(true);

    try {
      await api.post(`/auth/reset-password/${resetToken}`, { newPassword });
      setInfo({ type: 'success', msg: 'Password updated! Redirecting to sign in…' });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setInfo({ type: 'error', msg: err.response?.data?.message || 'Invalid or expired reset link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LockKeyhole}
      title="Set a new password"
      subtitle="Choose a strong password for your CloudDrive account."
      footer={
        <p>
          <Link to="/login">Back to sign in</Link>
        </p>
      }
    >
      {info.msg && <Alert type={info.type === 'success' ? 'success' : 'error'}>{info.msg}</Alert>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="new-password" className="form-label">New password</label>
          <input
            id="new-password"
            type="password"
            className="form-input"
            required
            autoComplete="new-password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <Spinner label="Updating password…" /> : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  );
}
