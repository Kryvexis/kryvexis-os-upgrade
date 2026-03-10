import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { Role } from '../types';
export function RolesPage() {
  const [items, setItems] = useState<Role[]>([]);
  useEffect(() => { api.roles().then(setItems); }, []);
  return <Card title="Roles and access" subtitle="Permission maps, dashboard intent, and action boundaries."><div className="role-grid">{items.map((item) => <article key={item.key} className="role-card"><div className="role-card-head"><strong>{item.label}</strong><span className="eyebrow">{item.key}</span></div><p>{item.description}</p><ul>{item.dashboards.map((feature) => <li key={feature}>{feature}</li>)}</ul></article>)}</div></Card>;
}
