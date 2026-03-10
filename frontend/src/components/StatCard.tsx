import type { KPI } from '../data/mock';

export function StatCard({ item }: { item: KPI }) {
  return (
    <article className={`stat-card tone-${item.tone ?? 'accent'}`}>
      <p className="eyebrow">{item.label}</p>
      <h3>{item.value}</h3>
      <p className="muted">{item.detail}</p>
    </article>
  );
}
