import { Link } from 'react-router-dom';
import { Card } from '../components/Card';

const salesBlocks = [
  { label: 'Customers', path: '/customers', blurb: 'Master accounts, credit posture, and next actions.' },
  { label: 'Quotes', path: '/quotes', blurb: 'Drafts, approvals, and quote-to-invoice flow.' },
  { label: 'Invoices', path: '/invoices', blurb: 'Issued invoices, reminders, and collections view.' },
  { label: 'Payments', path: '/payments', blurb: 'Receipts, proof checks, and allocation workflow.' }
] as const;

export function SalesWorkspacePage() {
  return (
    <div className="page-grid module-workspace-page">
      <Card title="Sales workspace" subtitle="Open the core sales blocks the way your mockup is structured — module first, records second." className="module-hero-card">
        <div className="module-hero-grid">
          <div>
            <strong className="hero-value compact-hero-value">4</strong>
            <p className="hero-support">Customer, quote, invoice, and payment control blocks.</p>
          </div>
          <div className="hero-chip-stack horizontal-chips">
            <span className="hero-chip small-chip">Customers</span>
            <span className="hero-chip small-chip">Quotes</span>
            <span className="hero-chip small-chip">Invoices</span>
            <span className="hero-chip small-chip">Payments</span>
          </div>
        </div>
        <div className="module-block-grid">
          {salesBlocks.map((block) => (
            <Link key={block.path} to={block.path} className="module-block-card">
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
