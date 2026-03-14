import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '../components/ModuleWorkspace';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { AccountingBrain } from '../types';

export function AccountingWorkspacePage() {
  const [brain, setBrain] = useState<AccountingBrain | null>(null);

  useEffect(() => {
    api.accountingBrain().then(setBrain).catch(() => null);
  }, []);

  return (
    <div className="page-grid">
      <Card
        title={brain?.headline || 'Accounting Intelligence'}
        subtitle={brain?.summary || 'Finance recommendations, exception ranking, and debtor pressure in one cockpit.'}
      >
        <div className="kpi-grid compact-kpi-grid">
          {(brain?.focus || []).slice(0, 3).map((item) => (
            <Card key={item.id} className="metric-card" title={item.title} subtitle={item.action}>
              <strong>{item.impact}</strong>
              <p>{item.detail}</p>
              <p className="muted-inline">Confidence: {item.confidence}</p>
            </Card>
          ))}
        </div>
      </Card>
      <ModuleWorkspace
        title="Accounting Intelligence"
        items={[
          { title: 'Debtors', to: '/accounting/debtors', icon: '◔' },
          { title: 'Statements', to: '/accounting/statements', icon: '▤' },
          { title: 'Cash Up', to: '/accounting/cash-up', icon: '◫' },
          { title: 'Expenses', to: '/accounting/expenses', icon: '▦' },
          { title: 'Creditors', to: '/accounting/creditors', icon: '◕' },
          { title: 'Exceptions', to: '/accounting/exceptions', icon: '✦' }
        ]}
      />
      <Card title="Recommended finance actions" subtitle="What the accounting brain wants your team to do next.">
        <div className="table-wrap"><table className="data-grid"><thead><tr><th>Action</th><th>Branch</th><th>Severity</th><th>Detail</th><th>Next move</th></tr></thead><tbody>
          {(brain?.recommendedActions || []).map((item) => (
            <tr key={item.id}>
              <td><strong>{item.title}</strong><div className="muted-inline">{item.kind}</div></td>
              <td>{item.branch}</td>
              <td>{item.severity}</td>
              <td>{item.detail}</td>
              <td>{item.action}</td>
            </tr>
          ))}
        </tbody></table></div>
      </Card>
    </div>
  );
}
