const steps = [
  {
    number: 1,
    title: 'Create your account',
    description:
      'Register with your email, verify your identity securely, and get instant access to your personal cloud drive.',
  },
  {
    number: 2,
    title: 'Upload your files',
    description:
      'Select files from your device, optionally rename them, and upload them to your secure workspace in one step.',
  },
  {
    number: 3,
    title: 'Manage from anywhere',
    description:
      'Search, rename, download, or delete files from any browser. Your storage is always up-to-date and synced across devices.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="how-section" id="how-it-works" aria-labelledby="how-heading">
      <div className="container text-center">
        <span className="section-label">How it works</span>
        <h2 className="section-title" id="how-heading">
          Up and running in three simple steps
        </h2>
        <p className="section-subtitle" style={{ margin: '12px auto 0' }}>
          No complex setup. Create an account, upload files, and start managing your cloud storage today.
        </p>

        <div className="steps-grid">
          {steps.map((step) => (
            <article key={step.number} className="step-card">
              <span className="step-number" aria-hidden="true">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
