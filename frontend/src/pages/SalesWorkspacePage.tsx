import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Customer, Invoice, Payment, Quote } from '../types';

function WorkspaceBlock({ title, body, to }: { title: string; body: string; to: string }) {
  return (
    <Link to={to} className="workspace-block">
      <div className="workspace-icon" />
      <div className="workspace-block-copy">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </Link>
  );
}

export function SalesWorkspacePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    Promise.all([api.customers(), api.quotes(), api.invoices(), api.payments()]).then(([c, q, i, p]) => {
      setCustomers(c);
      setQuotes(q);
      setInvoices(i);
      setPayments(p);
    });
  }, []);

  const approvals = useMemo(() => quotes.filter((item) => item.status === 'Pending approval').length, [quotes]);
  const overdue = useMemo(() => invoices.filter((item) => item.status.toLowerCase().includes('overdue')).length, [invoices]);
  const proofChecks = useMemo(() => payments.filter((item) => item.proof === 'Missing' || item.status === 'Pending proof').length, [payments]);

  return (
    <div className="module-page-grid">
      <section className="module-hero-card">
        <div className="module-hero-copy">
          <p className="eyebrow">Sales workspace</p>
          <h2>Open the core sales blocks the way your mockup is structured.</h2>
          <p className="module-subcopy">Module first, records second. Jump into customers, quotes, invoices, and payments from one clean control surface.</p>
        </div>
        <div className="module-chip-row">
          <span className="module-chip">{customers.length} customers</span>
          <span className="module-chip">{quotes.length} quotes</span>
          <span className="module-chip">{invoices.length} invoices</span>
          <span className="module-chip">{payments.length} payments</span>
        </div>
      </section>

      <section className="module-board">
        <div className="module-board-head">
          <div>
            <strong className="module-board-count">4</strong>
            <p>Customer, quote, invoice, and payment control blocks.</p>
          </div>
          <div className="module-chip-row compact-row">
            <span className="module-chip">{approvals} approvals</span>
            <span className="module-chip">{overdue} overdue</span>
            <span className="module-chip">{proofChecks} proof checks</span>
          </div>
        </div>
        <div className="workspace-block-grid two-up">
          <WorkspaceBlock title="Customers" body="Master accounts, credit posture, and next actions." to="/customers" />
          <WorkspaceBlock title="Quotes" body="Drafts, approvals, and quote-to-invoice flow." to="/quotes" />
          <WorkspaceBlock title="Invoices" body="Issued invoices, reminders, and collections view." to="/invoices" />
          <WorkspaceBlock title="Payments" body="Receipts, proof checks, and allocation workflow." to="/payments" />
        </div>
      </section>
    </div>
  );
}
