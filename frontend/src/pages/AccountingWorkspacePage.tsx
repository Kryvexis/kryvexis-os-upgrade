import { Link } from 'react-router-dom';

const items = [
  { title: 'Debtors', subtitle: 'Open balances, reminders, and collections.', to: '/invoices' },
  { title: 'Creditors', subtitle: 'Supplier-side obligations and controls.', to: '/notifications' },
  { title: 'Statements', subtitle: 'Statement generation and account view.', to: '/invoices' },
  { title: 'Expenses', subtitle: 'Expense capture and review.', to: '/notifications' },
  { title: 'Cash Up', subtitle: 'Cash-up reconciliation and exceptions.', to: '/payments' }
];

export function AccountingWorkspacePage() {
  return (
    <div className="module-page">
      <section className="module-shell">
        <div className="module-shell-head">
          <div>
            <span className="eyebrow">Accounting workspace</span>
            <h2>Accounting</h2>
            <p>Debtors, creditors, statements, expenses, and cash-up controls grouped into one finance workspace.</p>
          </div>
          <div className="module-shell-stat">
            <strong>5</strong>
            <span>Control blocks</span>
          </div>
        </div>
        <div className="workspace-block-grid workspace-block-grid-five">
          {items.map((item) => (
            <Link key={item.title} to={item.to} className="workspace-block">
              <span className="workspace-block-icon" />
              <strong>{item.title}</strong>
              <p>{item.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
