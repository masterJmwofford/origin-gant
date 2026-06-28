export default function DashBoard({ stats }) {
  return (
    <div className="dashboard">
      {stats.map((stat) => (
        <section className="card" key={stat.label}>
          <span className="stat-value">{stat.value}</span>
          <h2>{stat.label}</h2>
          <p>{stat.description}</p>
        </section>
      ))}
    </div>
  );
}
