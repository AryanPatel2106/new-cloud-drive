const stats = [
  { value: '99.99%', label: 'S3 availability SLA' },
  { value: '10 MB', label: 'Max upload per file' },
  { value: '1 hr', label: 'Presigned link expiry' },
  { value: '5 min', label: 'OTP verification window' },
];

export default function StatsSection() {
  return (
    <section className="stats-section" aria-label="Platform statistics">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-item">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
