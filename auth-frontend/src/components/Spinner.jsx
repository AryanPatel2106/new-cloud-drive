import { Loader2 } from 'lucide-react';

export default function Spinner({ label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Loader2 className="spinner" aria-hidden="true" />
      {label && <span>{label}</span>}
    </span>
  );
}
