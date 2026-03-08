import { PageHeader } from '../components/PageHeader';

const statCards = [
  {
    label: 'Open Invoices',
    value: '$45,230',
    meta: 'Overdue',
    tone: 'rose',
    icon: '◔'
  },
  {
    label: 'Pending Approvals',
    value: '6',
    meta: 'Requests',
    tone: 'amber',
    icon: '◉'
  },
  {
    label: 'Low Stock Alerts',
    value: '8',
    meta: 'Products',
    tone: 'red',
    icon: '!'
  },
  {
    label: 'Cash on Hand',
    value: '$145,890',
    meta: '',
    tone: 'green',
    icon: '◐'
  }
] as const;

const monthBars = [110, 160, 105, 118, 190, 205, 265, 248];
const targetBars = [45, 38, 42, 74, 88, 78, 104, 182];
const revenueLine = [28, 72, 55, 74, 124, 164, 146, 188];
const targetLine = [14, 28, 22, 34, 58, 74, 88, 106];
const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const tasks = [
  ['Review Monthly Report', 'Today', ''],
  ['Follow up with Acme Corp', 'Today', ''],
  ['Restock Warehouse A', 'Tomorrow', ''],
  ['Approve Purchase Order #1045', 'Pending', 'pending'],
  ['Schedule Team Meeting', 'Friday', '']
] as const;

const activities = [
  ['Invoice #5679 marked as', 'Paid', 'good'],
  ['Stock Transfer completed', '', 'warn'],
  ['PO #1045 submitted for', 'Approval', 'good'],
  ['Payment Received from', 'Global Tech Ltd', 'warn'],
  ['Shipment Delivered to', 'Warehouse', 'good']
] as const;

const debtors = [
  ['Acme Corporation', '$12,700', 100, 'good'],
  ['Global Tech Ltd', '$8,500', 72, 'warn'],
  ['Sunrise Retail', '$6,100', 58, 'danger']
] as const;

const lowStock = [
  ['Wireless Mouse', 'WM-1002', '5', 'Reorder'],
  ['Printer Toner Cartridge', 'PTC-204', '2', 'Reorder'],
  ['LED Desk Lamp', 'LDL-160', '3', 'Reorder']
] as const;

export function DashboardPage() {
  return (
    <div className="page-stack kry-dashboard-page">
      <PageHeader
        title="Admin Dashboard"
        description="A dark, high-clarity operating surface for finance, approvals, stock, and day-to-day execution."
        actions={<button className="soft-button primary">Open command center</button>}
      />

      <section className="kpi-grid">
        {statCards.map((card) => (
          <article key={card.label} className="stat-card glass-panel kpi-card">
            <div className={`kpi-icon ${card.tone}`}>{card.icon}</div>
            <div>
              <h3>{card.label}</h3>
              <div className="kpi-value-row">
                <strong>{card.value}</strong>
                {card.meta ? <span>{card.meta}</span> : null}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="hero-grid">
        <article className="panel-card glass-panel sales-overview-card">
          <div className="panel-heading split-heading">
            <div>
              <h3>Sales Overview</h3>
              <div className="sales-total">$78,200</div>
              <div className="sales-accent-bar" />
            </div>
            <div className="chart-toolbar">
              <button className="soft-pill">This Month</button>
              <div className="legend-pills">
                <span><i className="legend-swatch revenue" />Revenue</span>
                <span><i className="legend-swatch target" />Target</span>
              </div>
            </div>
          </div>

          <div className="chart-frame">
            <div className="chart-grid-lines">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="bars-layer" aria-hidden="true">
              {monthBars.map((value, index) => (
                <div key={`bar-a-${index}`} className="bar-cluster">
                  <span className="bar revenue-bar" style={{ height: `${value}px` }} />
                  <span className="bar target-bar" style={{ height: `${targetBars[index]}px` }} />
                </div>
              ))}
            </div>
            <svg className="line-layer" viewBox="0 0 760 220" preserveAspectRatio="none" role="img" aria-label="Revenue and target chart">
              <polyline
                fill="none"
                stroke="rgba(136, 237, 102, 0.95)"
                strokeWidth="3"
                points={revenueLine.map((value, index) => `${40 + index * 96},${200 - value}`).join(' ')}
              />
              <polyline
                fill="none"
                stroke="rgba(255, 165, 58, 0.92)"
                strokeWidth="3"
                points={targetLine.map((value, index) => `${40 + index * 96},${200 - value}`).join(' ')}
              />
              {revenueLine.map((value, index) => (
                <circle key={`rev-${index}`} cx={40 + index * 96} cy={200 - value} r="5.5" fill="rgba(136, 237, 102, 1)" />
              ))}
              {targetLine.map((value, index) => (
                <circle key={`tar-${index}`} cx={40 + index * 96} cy={200 - value} r="5" fill="rgba(255, 184, 77, 1)" />
              ))}
            </svg>
            <div className="chart-axis months-axis">
              {months.map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
        </article>

        <article className="panel-card glass-panel list-panel">
          <div className="panel-heading split-heading compact-heading">
            <h3>Tasks &amp; Reminders</h3>
            <div className="panel-actions">✎ ⚙</div>
          </div>
          <div className="task-list">
            {tasks.map(([label, due, tone]) => (
              <div key={label} className="task-row">
                <div className="task-main">
                  <span className="task-check">✓</span>
                  <span>{label}</span>
                </div>
                <div className="task-side">
                  {tone === 'pending' ? <span className="status-pill pending">Pending</span> : <span className="task-due">{due}</span>}
                  <span className="task-chevron">›</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="secondary-grid">
        <article className="panel-card glass-panel ledger-panel">
          <div className="panel-heading split-heading compact-heading">
            <h3>Debtors &amp; Creditors</h3>
            <div className="panel-actions">↗ ⚙</div>
          </div>

          <div className="ledger-cards">
            <div className="ledger-card">
              <span className="ledger-title">Accounts Receivable</span>
              <div className="ledger-row">
                <span>Revenue</span>
                <strong>$32,450</strong>
              </div>
            </div>
            <div className="ledger-card">
              <span className="ledger-title">Accounts Payable</span>
              <div className="ledger-row">
                <span>Review</span>
                <strong>$21,870</strong>
              </div>
            </div>
          </div>

          <div className="debtor-table">
            <h4>Top Debtors</h4>
            {debtors.map(([name, value, width, tone]) => (
              <div key={name} className="debtor-row">
                <div>
                  <strong>{name}</strong>
                </div>
                <strong>{value}</strong>
                <div className="progress-track">
                  <span className={`progress-fill ${tone}`} style={{ width: `${width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card glass-panel list-panel recent-panel">
          <div className="panel-heading split-heading compact-heading">
            <h3>Recent Activities</h3>
            <div className="panel-actions">↗</div>
          </div>
          <div className="activity-feed">
            {activities.map(([prefix, highlight, tone], index) => (
              <div key={`${prefix}-${index}`} className="activity-row">
                <span className={`activity-dot ${tone}`}>{tone === 'warn' ? '2' : '2'}</span>
                <p>
                  {prefix} {highlight ? <strong>{highlight}</strong> : null}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="table-shell glass-panel low-stock-panel">
        <div className="table-shell-header">
          <div>
            <h3>Low Stock Items</h3>
            <p>Products below threshold that need purchasing attention.</p>
          </div>
          <div className="panel-actions">☰ ˅ ⠇</div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Reorder</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map(([product, sku, stock, action]) => (
                <tr key={sku}>
                  <td>{product}</td>
                  <td>{sku}</td>
                  <td>{stock} in Stock</td>
                  <td><button className="table-action-button">{action}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
