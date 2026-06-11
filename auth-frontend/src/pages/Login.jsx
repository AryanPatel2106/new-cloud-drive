import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import AuthLayout from '../components/layout/AuthLayout';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

export default function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loginIdentity, setLoginIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useSEO({
    title: 'Sign In',
    description: 'Sign in to your CloudDrive account to access your secure cloud file storage dashboard.',
    path: '/login',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = loginIdentity.includes('@')
      ? { email: loginIdentity, password }
      : { username: loginIdentity, password };

    try {
      const response = await api.post('/auth/login', payload);

      if (response.data?.data?.requiresVerification) {
        navigate('/verify-otp', { state: { email: response.data.data.email } });
        return;
      }

      await refreshUser();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Sign in to access your cloud drive and manage your files."
      footer={
        <>
          <p>
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
          <p>
            Don&apos;t have an account? <Link to="/register">Create one for free</Link>
          </p>
        </>
      }
    >
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-identity" className="form-label">Username or email</label>
          <input
            id="login-identity"
            type="text"
            className="form-input"
            required
            autoComplete="username"
            placeholder="you@example.com"
            value={loginIdentity}
            onChange={(e) => setLoginIdentity(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password" className="form-label">Password</label>
          <input
            id="login-password"
            type="password"
            className="form-input"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <Spinner label="Signing in…" /> : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
