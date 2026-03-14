import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { ExpenseRow, FinanceExceptionRow } from '../types';

export function ExpensesPage() {
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [exceptions, setExceptions] = useState<FinanceExceptionRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => api.expensesLedger().then(setRows);

  useEffect(() => {
    load();
    api.financeExceptions().then((items) => {
      setExceptions(items.filter((item) => /expense|supplier/i.test(`${item.title} ${item.detail}`)));
    });
  }, []);

  async function approve(id: string) {
    setBusy(id);
    try {
      await api.approveExpense(id);
      await load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page-grid">
      <Card title="Expenses" subtitle="Operational spend with recommendation-led approvals.">
        <div className="table-wrap">
          <table className="data-grid">
            <thead>
              <tr>
                <th>Category</th>
                <th>Supplier</th>
                <th>Amount</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Recommendation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <td>{item.supplier}</td>
                  <td>{item.amount}</td>
                  <td>{item.branch}</td>
                  <td>{item.status}</td>
                  <td>{item.recommendation}</td>
                  <td>
                    <button className="ghost-button" type="button" onClick={() => approve(item.id)} disabled={busy === item.id || item.status === 'Approved'}>
                      {item.status === 'Approved' ? 'Approved' : busy === item.id ? 'Approving…' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Spend exceptions" subtitle="Expenses and supplier issues that need finance review before close.">
        <div className="table-wrap">
          <table className="data-grid">
            <thead>
              <tr>
                <th>Signal</th>
                <th>Branch</th>
                <th>Severity</th>
                <th>Detail</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {exceptions.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <div className="muted-inline">{item.kind}</div>
                  </td>
                  <td>{item.branch}</td>
                  <td>{item.severity}</td>
                  <td>{item.detail}</td>
                  <td>{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
