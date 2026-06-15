import { Shield, Zap, Lock } from 'lucide-react';
import Logo from '../Logo';

const highlights = [
  { icon: Shield, text: 'Secure, verified access to keep your account protected' },
  { icon: Lock, text: 'Every file link is encrypted and automatically expires' },
  { icon: Zap, text: 'Fast uploads with instant access from any device' },
];

export default function AuthLayout({ icon: Icon, title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <aside className="auth-panel auth-panel--brand" aria-hidden="true">
        <div className="auth-brand-content">
          <Logo light />
          <h2>Your files, secured and always within reach.</h2>
          <p>
            CloudDrive combines a modern file manager with enterprise-grade cloud storage.
            Upload, rename, search, and download — all from one clean dashboard.
          </p>
          <div className="auth-features">
            {highlights.map(({ icon: FeatureIcon, text }) => (
              <div key={text} className="auth-feature">
                <span className="auth-feature-icon">
                  <FeatureIcon size={18} />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="auth-panel auth-form-panel">
        <div className="auth-card">
          <header className="auth-header">
            {Icon && (
              <div className="auth-icon-wrap">
                <Icon size={24} aria-hidden="true" />
              </div>
            )}
            <h1 className="auth-title">{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </header>
          {children}
          {footer && <footer className="auth-footer">{footer}</footer>}
        </div>
      </main>
    </div>
  );
}
