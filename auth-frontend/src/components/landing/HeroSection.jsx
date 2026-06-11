import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, HardDrive } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="container hero-grid">
        <div className="hero-content">
          <span className="section-label">AWS S3 Powered Storage</span>
          <h1 id="hero-heading">
            Store, manage &amp; access your files — <span>anywhere, anytime</span>
          </h1>
          <p className="hero-lead">
            CloudDrive is a secure personal cloud workspace. Upload documents, images, and media
            to Amazon S3, organize them in seconds, and download with encrypted presigned links.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start for free <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign in to your drive</Link>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <Shield size={16} aria-hidden="true" /> Email-verified accounts
            </div>
            <div className="trust-item">
              <HardDrive size={16} aria-hidden="true" /> S3-backed file storage
            </div>
            <div className="trust-item">
              <Clock size={16} aria-hidden="true" /> Presigned secure downloads
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src="/images/hero-illustration.svg"
            alt="CloudDrive dashboard showing secure file storage interface"
            width={640}
            height={480}
            loading="eager"
          />
          <div className="hero-visual-badge">
            <Shield size={24} color="#22c55e" aria-hidden="true" />
            <div>
              <strong>256-bit encryption at rest</strong>
              <span>Powered by AWS infrastructure</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
