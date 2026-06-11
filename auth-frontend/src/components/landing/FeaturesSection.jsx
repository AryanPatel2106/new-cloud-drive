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
    title: 'Drag-and-drop uploads',
    description:
      'Upload files up to 10 MB directly to AWS S3. Give each file a custom display name before storing.',
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
    title: 'Secure presigned URLs',
    description:
      'Downloads use time-limited presigned links so your S3 bucket stays private and protected.',
  },
  {
    icon: Mail,
    color: 'orange',
    title: 'Email OTP verification',
    description:
      'Every account is verified with a one-time passcode sent to your inbox before you can sign in.',
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
    title: 'Complete file lifecycle',
    description:
      'Rename, organize, and permanently delete files from both your dashboard and S3 storage.',
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
