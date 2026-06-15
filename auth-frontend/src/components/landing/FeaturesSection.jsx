import {
  Upload,
  FolderSearch,
  ShieldCheck,
  Mail,
  Download,
  Trash2,
} from 'lucide-react';

const features = [
  {
    icon: Upload,
    color: 'blue',
    title: 'Drag-and-drop upload',
    description:
      'Upload files up to 10 MB in a single drop. Easily rename and customize display titles before saving.',
  },
  {
    icon: FolderSearch,
    color: 'green',
    title: 'Instant file search',
    description:
      'Find any file in your drive with real-time search. Filter by name across your entire library.',
  },
  {
    icon: ShieldCheck,
    color: 'purple',
    title: 'Secure link sharing',
    description:
      'Each download link is encrypted and expires automatically, ensuring your personal links cannot be shared or hijacked.',
  },
  {
    icon: Mail,
    color: 'orange',
    title: 'Identity protection',
    description:
      'Enterprise-grade security using verified logins. Keep unauthorized users away with instant access-passcode validation.',
  },
  {
    icon: Download,
    color: 'teal',
    title: 'One-click downloads',
    description:
      'Open or download any file from your dashboard. Links refresh automatically when you load your drive.',
  },
  {
    icon: Trash2,
    color: 'rose',
    title: 'Complete file control',
    description:
      'Rename, organize, and permanently delete files to keep your workspace clutter-free.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="features-section" id="features" aria-labelledby="features-heading">
      <div className="container text-center">
        <span className="section-label">Features</span>
        <h2 className="section-title" id="features-heading">
          Everything you need to manage cloud files
        </h2>
        <p className="section-subtitle" style={{ margin: '12px auto 0' }}>
          From upload to download, CloudDrive gives you a complete file management experience
          backed by production-grade cloud infrastructure.
        </p>

        <div className="features-grid">
          {features.map(({ icon: Icon, color, title, description }) => (
            <article key={title} className="feature-card">
              <div className={`feature-icon feature-icon--${color}`}>
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
