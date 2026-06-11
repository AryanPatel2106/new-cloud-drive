import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

export default function DashboardNav() {
  const { user, logout } = useAuth();

  return (
    <header className="dashboard-nav">
      <div className="container dashboard-nav-inner">
        <Logo />
        <div className="user-menu">
          <div className="user-chip">
            <span className="user-avatar" aria-hidden="true">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            <LogOut size={16} aria-hidden="true" /> Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

export function DashboardHeader({ user }) {
  return (
    <header className="dashboard-header">
      <div>
        <h1>Welcome back, {user.fullName || user.username}!</h1>
        <p>
          Manage your cloud files — upload, search, rename, and download from your personal drive.
        </p>
      </div>
      <span className="status-badge">
        <span className="status-dot" aria-hidden="true" />
        Account verified
      </span>
    </header>
  );
}
