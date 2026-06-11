import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Alert({ type = 'error', children }) {
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <div className={`alert alert-${type}`} role="alert" aria-live="assertive">
      <Icon size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
      <p>{children}</p>
    </div>
  );
}
