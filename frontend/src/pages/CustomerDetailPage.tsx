import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActivityFeed } from '../components/ActivityFeed';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { RecordTimeline } from '../components/RecordTimeline';
import { api } from '../lib/api';
import type { Customer, CustomerSummary } from '../types';

export function CustomerDetailPage() {
  const { id = '' } = useParams();
  const [item, setItem] = useState<Customer | null>(null);
  const [summary, setSummary] = useState<CustomerSummary | null>(null);

  useEffect(() => {
    api.customer(id).then(setItem);
    api.customerSummary(id).then(setSummary);
  }, [id]);

  if (!item || !summary) return <div className="loading-state">Loading record...</div>;

  return (
    <div className="record-layout">
      <Card className="record-hero">
        <div className="record-head">
          <div>
            <p className="eyebrow">Customer record</p>
            <h2>{item.name}</h2>
          </div>
          <Badge value={item.status} />
        </div>
        <div className="record-meta">
          <div><span>Customer ID</span><strong>{item.id}</strong></div>
          <div><span>Owner</span><strong>{item.owner}</strong></div>
          <div><span>Branch</span><strong>{item.branch}</strong></div>
          <div><span>Balance</span><strong>{item.balance}</strong></div>
          <div><span>Risk</span><strong>{item.risk}</strong></div>
        </div>
      </Card>

      <div className="kpi-grid compact-kpi-grid">
        <Card className="metric-card"><p className="eyebrow">Total spend</p><strong>{summary.totalSpend}</strong><p>{summary.invoiceCount} invoices booked</p></Card>
        <Card className="metric-card"><p className="eyebrow">Average order value</p><strong>{summary.averageOrderValue}</strong><p>Last purchase {summary.lastPurchaseDate}</p></Card>
        <Card className="metric-card"><p className="eyebrow">Open balance</p><strong>{summary.openBalance}</strong><p>{summary.collectionStatus}</p></Card>
        <Card className="metric-card"><p className="eyebrow">Account health</p><strong>{summary.accountHealth}</strong><p>{summary.overdueInvoices} overdue invoices • last payment {summary.lastPaymentDate}</p></Card>
      </div>

      <div className="split-grid">
        <Card title="Record context" subtitle="Status, owner, next action, and account controls.">
          <div className="detail-stack">
            <div><span>Contact</span><strong>{item.contact}</strong></div>
            <div><span>Phone</span><strong>{item.phone}</strong></div>
            <div><span>Credit terms</span><strong>{item.creditTerms}</strong></div>
            <div><span>Price list</span><strong>{item.priceList}</strong></div>
            <div><span>Next action</span><strong>{item.nextAction}</strong></div>
            <p>{item.notes}</p>
          </div>
        </Card>

        <Card title="Activity and collaboration" subtitle="Timeline, notes, and account-level follow-up.">
          <RecordTimeline items={item.activity} />
        </Card>
      </div>

      <div className="split-grid three-up-grid">
        <Card title="Account health snapshot" subtitle="Linked commercial posture across sales and finance.">
          <div className="detail-stack">
            <div><span>Collection status</span><strong>{summary.collectionStatus}</strong></div>
            <div><span>Open quotes</span><strong>{summary.openQuotes.length}</strong></div>
            <div><span>Recent invoices</span><strong>{summary.recentInvoices.length}</strong></div>
            <div><span>Recent payments</span><strong>{summary.recentPayments.length}</strong></div>
          </div>
        </Card>

        <Card title="Top products bought" subtitle="The first layer of client purchase intelligence.">
          <div className="notification-stack">
            {summary.topProducts.map((product) => (
              <article key={product.sku} className="mini-list-row">
                <div>
                  <strong>{product.name}</strong>
                  <p>{product.sku}</p>
                </div>
                <div className="align-right">
                  <strong>{product.revenue}</strong>
                  <p>{product.quantity} units</p>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <div className="split-grid">
        <Card title="Recent invoices" subtitle="Customer billing history for faster follow-up.">
          <div className="notification-stack">
            {summary.recentInvoices.map((invoice) => (
              <article key={invoice.id} className="mini-list-row">
                <div>
                  <strong><Link to={`/invoices/${invoice.id}`}>{invoice.id}</Link></strong>
                  <p>{invoice.status} • {invoice.due}</p>
                </div>
                <div className="align-right">
                  <strong>{invoice.amount}</strong>
                  <p>{invoice.paymentStatus}</p>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card title="Recent payments" subtitle="Receipts and allocation trail.">
          <div className="notification-stack">
            {summary.recentPayments.map((payment) => (
              <article key={payment.id} className="mini-list-row">
                <div>
                  <strong><Link to={`/payments/${payment.id}`}>{payment.ref}</Link></strong>
                  <p>{payment.method} • {payment.status}</p>
                </div>
                <div className="align-right">
                  <strong>{payment.amount}</strong>
                  <p>{payment.date}</p>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Linked account activity" subtitle="Unified quote, invoice, payment, and system actions tied back to this customer.">
        <ActivityFeed items={summary.linkedActivity} />
      </Card>

      <Card title="Purchase history summary" subtitle="Chronological customer story across quote, invoice, and payment events.">
        <div className="history-table-wrap">
          <table className="data-grid history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {summary.purchaseHistory.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td><span className="badge neutral">{entry.type}</span></td>
                  <td>{entry.reference}</td>
                  <td>{entry.amount}</td>
                  <td><Badge value={entry.status} /></td>
                  <td>{entry.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
