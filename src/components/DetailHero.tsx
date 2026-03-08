import type { ReactNode } from 'react';

type Metric = {
  label: string;
  value: string;
  detail: string;
};

export function DetailHero({
  eyebrow = 'Record',
  title,
  description,
  metrics,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  metrics: Metric[];
  actions?: ReactNode;
}) {
  return (
    <section className="detail-hero glass-panel">
      <div className="detail-hero-main">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      <div className="detail-hero-actions">{actions}</div>
      <div className="detail-hero-metrics">
        {metrics.map((metric) => (
          <article key={metric.label} className="detail-metric">
            <span className="eyebrow">{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
