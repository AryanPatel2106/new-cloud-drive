import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

export default function Navbar({ variant = 'public' }) {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Logo />

        {variant === 'public' && (
          <>
            <nav className="navbar-links" aria-label="Main navigation">
              <a href="/#features" className="nav-link">Features</a>
              <a href="/#how-it-works" className="nav-link">How it works</a>
              <a href="/#faq" className="nav-link">FAQ</a>
            </nav>
            <div className="navbar-actions">
              {user ? (
                <Link to="/" className="btn btn-primary btn-sm">My Drive</Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                  <Link to="/register" className="btn btn-primary btn-sm">Get started free</Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
