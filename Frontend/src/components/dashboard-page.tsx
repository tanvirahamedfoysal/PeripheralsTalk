export function DashboardPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="dash-content">
      <p className="eyebrow" style={{ color: "var(--red)" }}>
        {eyebrow}
      </p>
      <h1 className="dash-title">{title}</h1>
      <p className="muted" style={{ maxWidth: 720, lineHeight: 1.7 }}>
        {description}
      </p>
      {children}
    </div>
  );
}
export function Metrics({
  items,
}: {
  items: { label: string; value: string; note?: string }[];
}) {
  return (
    <div className="metric-grid">
      {items.map((i) => (
        <div className="metric" key={i.label}>
          <span className="eyebrow muted">{i.label}</span>
          <div className="value">{i.value}</div>
          <small className="muted">
            {i.note || "Updated as new information becomes available"}
          </small>
        </div>
      ))}
    </div>
  );
}
