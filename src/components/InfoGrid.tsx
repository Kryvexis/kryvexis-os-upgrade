type InfoItem = {
  label: string;
  value: string;
};

export function InfoGrid({ title, items }: { title: string; items: InfoItem[] }) {
  return (
    <section className="panel-card glass-panel">
      <div className="panel-heading">
        <h3>{title}</h3>
      </div>
      <div className="info-grid">
        {items.map((item) => (
          <div key={item.label} className="info-row">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
