import Logo from './Logo';
import Spinner from './Spinner';

export default function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading">
      <Logo />
      <Spinner label="Loading your workspace…" />
    </div>
  );
}
