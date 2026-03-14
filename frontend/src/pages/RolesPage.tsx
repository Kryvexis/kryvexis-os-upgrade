import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { Role } from '../types';

const fallback: Role[] = [
  { key: 'manager', label: 'Manager', description: 'Sees branch operations and reports.', dashboards: ['Dashboard', 'Reports', 'Notifications'] },
  { key: 'sales', label: 'Sales', description: 'Works customers, quotes, invoices, and collections.', dashboards: ['Dashboard', 'Sales', 'Customers'] },
  { key: 'admin', label: 'Admin', description: 'Oversees system setup and all modules.', dashboards: ['Dashboard', 'Reports', 'Settings'] }
];

export function RolesPage() {
  const [items, setItems] = useState<Role[]>(fallback);
  useEffect(() => { api.roles().then(setItems).catch(() => setItems(fallback)); }, []);
  return (
    <Card title="Roles and access" subtitle="Permission maps and dashboard intent.">
      <div className="role-grid">
        {items.map((item) => (
          <article key={item.key} className="role-card">
            <div className="role-card-head"><strong>{item.label}</strong><span className="eyebrow">{item.key}</span></div>
            <p>{item.description}</p>
            <ul>{item.dashboards.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </article>
        ))}
      </div>
    </Card>
  );
}
