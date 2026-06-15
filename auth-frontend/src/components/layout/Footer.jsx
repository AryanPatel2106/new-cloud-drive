import { Link } from 'react-router-dom';
import Logo from '../Logo';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
  ],
  Account: [
    { label: 'Sign in', to: '/login' },
    { label: 'Create account', to: '/register' },
    { label: 'Reset password', to: '/forgot-password' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>
              CloudDrive helps individuals and teams store, organize, and access their files
              securely from anywhere — with enterprise-grade protection built in.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="footer-col">
              <h4>{title}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to}>{link.label}</Link>
                    ) : (
                      <a href={link.href}>{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} CloudDrive. All rights reserved.</span>
          <span>Reliable · Secure · Always available</span>
        </div>
      </div>
    </footer>
  );
}
