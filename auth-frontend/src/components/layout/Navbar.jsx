import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

export default function Navbar({ variant = 'public' }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Logo />

        {variant === 'public' && (
          <>
            <button
              type="button"
              className="navbar-toggle"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>

            <div className={`navbar-menu ${menuOpen ? 'is-active' : ''}`}>
              <nav className="navbar-links" aria-label="Main navigation">
                <a href="/#features" className="nav-link" onClick={() => setMenuOpen(false)}>Features</a>
                <a href="/#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
                <a href="/#faq" className="nav-link" onClick={() => setMenuOpen(false)}>FAQ</a>
              </nav>
              <div className="navbar-actions">
                {user ? (
                  <Link to="/" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                    My Drive
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>
                      Sign in
                    </Link>
                    <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                      Get started free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

