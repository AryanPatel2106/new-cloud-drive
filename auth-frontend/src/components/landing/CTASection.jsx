import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="cta-section" id="pricing" aria-labelledby="cta-heading">
      <div className="container cta-inner">
        <h2 id="cta-heading">Ready to organize your files in the cloud?</h2>
        <p>
          Join CloudDrive today and experience secure, fast file storage with a dashboard
          designed for clarity and ease of use.
        </p>
        <div className="cta-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Create free account <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">Sign in</Link>
        </div>
      </div>
    </section>
  );
}
