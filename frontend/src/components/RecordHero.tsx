export function RecordHero({ title, description, actions }: { title: string; description: string; actions?: string[] }) {
  return (
    <section className="record-hero">
      <div>
        <p className="eyebrow">Kryvexis OS</p>
        <h1>{title}</h1>
        <p className="hero-copy">{description}</p>
      </div>
      <div className="hero-actions">
        {(actions ?? []).map((action) => (
          <button key={action} className="primary-button">{action}</button>
        ))}
      </div>
    </section>
  );
}
