import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../api/axios';
import { useSEO } from '../hooks/useSEO';
import AuthLayout from '../components/layout/AuthLayout';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useSEO({
    title: 'Create Account',
    description: 'Create a free CloudDrive account and get secure AWS S3 cloud storage with email-verified access.',
    path: '/register',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      const targetEmail = response.data?.data?.email || formData.email;
      navigate('/verify-otp', { state: { email: targetEmail } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Get started with free cloud storage. We'll send a verification code to your email."
      footer={
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="reg-fullName" className="form-label">Full name</label>
          <input
            id="reg-fullName"
            type="text"
            name="fullName"
            className="form-input"
            autoComplete="name"
            placeholder="Alex Patel"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-username" className="form-label">Username *</label>
          <input
            id="reg-username"
            type="text"
            name="username"
            className="form-input"
            required
            autoComplete="username"
            placeholder="alexp"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-email" className="form-label">Email address *</label>
          <input
            id="reg-email"
            type="email"
            name="email"
            className="form-input"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-password" className="form-label">Password *</label>
          <input
            id="reg-password"
            type="password"
            name="password"
            className="form-input"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <Spinner label="Creating account…" /> : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
