import type { KPI } from '../types';
export function KpiCard({ item }: { item: KPI }) {
  return <article className="kpi-card"><span className="eyebrow">{item.label}</span><strong>{item.value}</strong><p>{item.detail}</p></article>;
}
