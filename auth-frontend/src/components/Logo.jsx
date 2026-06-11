import { Link } from 'react-router-dom';
import { Cloud } from 'lucide-react';

export default function Logo({ showAccent = true, light = false }) {
  return (
    <Link
      to="/"
      className="logo"
      aria-label="CloudDrive home"
      style={light ? { color: '#fff' } : undefined}
    >
      <span className="logo-icon" aria-hidden="true">
        <Cloud size={20} strokeWidth={2.5} />
      </span>
      CloudDrive{showAccent && <span className="logo-accent" style={light ? { color: '#7dd3fc' } : undefined}>.</span>}
    </Link>
  );
}
