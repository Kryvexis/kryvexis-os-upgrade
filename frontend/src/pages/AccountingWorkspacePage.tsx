import { Link } from 'react-router-dom';
import { Card } from '../components/Card';

const accountingBlocks = [
  { label: 'Debtors', path: '/invoices', blurb: 'Overdue accounts, debtor aging, and follow-up actions.' },
  { label: 'Creditors', path: '/procurement', blurb: 'Supplier-side payables and bill follow-through.' },
  { label: 'Statements', path: '/customers', blurb: 'Account statements and customer balance visibility.' },
  { label: 'Expenses', path: '/settings', blurb: 'Expense policy and cash handling foundation.' },
  { label: 'Cash Up', path: '/payments', blurb: 'Receipts, proof, and end-of-day finance control.' }
] as const;

export function AccountingWorkspacePage() {
  return (
    <div className="page-grid module-workspace-page">
      <Card title="Accounting workspace" subtitle="Like the mockup, accounting opens as a workspace of finance blocks instead of a cluttered sidebar list." className="module-hero-card">
        <div className="module-block-grid procurement-module-grid">
          {accountingBlocks.map((block) => (
            <Link key={block.label} to={block.path} className="module-block-card">
              <span className="module-block-icon" />
              <strong>{block.label}</strong>
              <p>{block.blurb}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
