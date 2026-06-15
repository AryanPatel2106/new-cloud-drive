const stats = [
  { value: '99.99%', label: 'Uptime guarantee' },
  { value: '10 MB', label: 'Max file size' },
  { value: 'Encrypted', label: 'File sharing links' },
  { value: 'Instant', label: 'Access & sync' },
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
