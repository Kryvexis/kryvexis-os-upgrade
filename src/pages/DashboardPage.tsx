import { usePreferences } from '../preferences/PreferencesProvider';
import type { RoleKey } from '../layout/navigation';

const dashboardByRole: Record<RoleKey, {
  statCards: Array<{ label: string; value: string; detail: string; tone: string; icon: string }>;
  tasks: Array<{ label: string; due: string; tone?: string }>;
  debtors: Array<{ name: string; amount: string; fill: number; tone: string }>;
}> = {
  admin: {
    statCards: [
      { label: 'Open Invoices', value: 'R 241,880', detail: 'Debtors book', tone: 'rose', icon: 'R' },
      { label: 'Pending Approvals', value: '6', detail: 'Cross-module queue', tone: 'amber', icon: '!' },
      { label: 'Low Stock Alerts', value: '12', detail: 'Products at risk', tone: 'red', icon: '•' },
      { label: 'Cash Collected', value: 'R 32,600', detail: 'Today', tone: 'green', icon: '+' }
    ],
    tasks: [
      { label: 'Approve PO-2034 for Cape Town branch', due: 'Today', tone: 'warning' },
      { label: 'Review overdue debtor pack', due: 'Today' },
      { label: 'Publish invoice numbering defaults', due: 'Tomorrow' },
      { label: 'Resolve cash-up variance in JHB', due: 'Tomorrow' },
      { label: 'Check branch KPI digest schedule', due: 'Friday' }
    ],
    debtors: [
      { name: 'Aether Group', amount: 'R 24,500', fill: 100, tone: 'green' },
      { name: 'Northline Stores', amount: 'R 8,200', fill: 52, tone: 'amber' },
      { name: 'Crest Office Park', amount: 'R 13,870', fill: 65, tone: 'red' }
    ]
  },
  sales: {
    statCards: [
      { label: 'Quotes Awaiting Action', value: '18', detail: 'Need sales follow-up', tone: 'amber', icon: 'Q' },
      { label: 'Invoices Due', value: 'R 84,220', detail: 'This week', tone: 'rose', icon: 'I' },
      { label: 'Quote Conversion', value: '68%', detail: 'Last 30 days', tone: 'green', icon: '%' },
      { label: 'Customer Flags', value: '5', detail: 'Pricing or credit', tone: 'red', icon: '!' }
    ],
    tasks: [
      { label: 'Send revision for QT-1011', due: 'Today' },
      { label: 'Follow up on Northline invoice', due: 'Today', tone: 'warning' },
      { label: 'Prepare statement run for Aether Group', due: 'Tomorrow' },
      { label: 'Review expiring quotes', due: 'Friday' },
      { label: 'Update customer price list', due: 'Friday' }
    ],
    debtors: [
      { name: 'Aether Group', amount: 'R 24,500', fill: 100, tone: 'green' },
      { name: 'Northline Stores', amount: 'R 8,200', fill: 52, tone: 'amber' },
      { name: 'BluePeak Foods', amount: 'R 6,100', fill: 40, tone: 'red' }
    ]
  },
  warehouse: {
    statCards: [
      { label: 'Low Stock', value: '12', detail: 'Need reorder review', tone: 'red', icon: '!' },
      { label: 'Pending Transfers', value: '7', detail: 'Cross-branch movement', tone: 'amber', icon: 'T' },
      { label: 'Goods Awaiting Receipt', value: '4', detail: 'Today', tone: 'rose', icon: 'G' },
      { label: 'Available Units', value: '1,842', detail: 'All branches', tone: 'green', icon: '+' }
    ],
    tasks: [
      { label: 'Count incoming goods for PO-2031', due: 'Today' },
      { label: 'Dispatch Cape Town transfer', due: 'Today', tone: 'warning' },
      { label: 'Investigate stock discrepancy for KX-200', due: 'Tomorrow' },
      { label: 'Prepare low-stock list for procurement', due: 'Tomorrow' },
      { label: 'Review dead-stock candidates', due: 'Friday' }
    ],
    debtors: [
      { name: 'Main Branch coverage', amount: '84%', fill: 84, tone: 'green' },
      { name: 'Cape Town coverage', amount: '53%', fill: 53, tone: 'amber' },
      { name: 'JHB coverage', amount: '38%', fill: 38, tone: 'red' }
    ]
  },
  finance: {
    statCards: [
      { label: 'Debtors Book', value: 'R 241,880', detail: 'Open invoices', tone: 'rose', icon: 'D' },
      { label: 'Receipts Today', value: 'R 32,600', detail: '8 allocations posted', tone: 'green', icon: '+' },
      { label: 'Supplier Payments Due', value: 'R 117,420', detail: 'Next 7 days', tone: 'amber', icon: 'P' },
      { label: 'Cash-up Variances', value: '2', detail: 'Need sign-off', tone: 'red', icon: '!' }
    ],
    tasks: [
      { label: 'Allocate RCPT-2204 against INV-1049', due: 'Today' },
      { label: 'Review supplier bill mismatch SB-412', due: 'Today', tone: 'warning' },
      { label: 'Run debtor statements', due: 'Tomorrow' },
      { label: 'Schedule Friday supplier payments', due: 'Tomorrow' },
      { label: 'Clear JHB cash-up variance', due: 'Friday' }
    ],
    debtors: [
      { name: 'Aether Group', amount: 'R 24,500', fill: 100, tone: 'green' },
      { name: 'Northline Stores', amount: 'R 8,200', fill: 52, tone: 'amber' },
      { name: 'Crest Office Park', amount: 'R 13,870', fill: 65, tone: 'red' }
    ]
  },
  procurement: {
    statCards: [
      { label: 'Open POs', value: '14', detail: '4 awaiting approval', tone: 'amber', icon: 'P' },
      { label: 'Late Suppliers', value: '3', detail: 'Past expected date', tone: 'red', icon: '!' },
      { label: 'Bills Unmatched', value: '5', detail: 'Need PO and GRN review', tone: 'rose', icon: 'B' },
      { label: 'Reorder Candidates', value: '12', detail: 'Generated from stock rules', tone: 'green', icon: 'R' }
    ],
    tasks: [
      { label: 'Release PO-2034 after approval', due: 'Today' },
      { label: 'Chase Alpha Industrial overdue delivery', due: 'Today', tone: 'warning' },
      { label: 'Run reorder sweep for Cape Town', due: 'Tomorrow' },
      { label: 'Compare supplier lead times', due: 'Tomorrow' },
      { label: 'Prepare unmatched bill pack', due: 'Friday' }
    ],
    debtors: [
      { name: 'Vertex Trade', amount: '9.2 days', fill: 92, tone: 'green' },
      { name: 'Nexa Supply', amount: '6.1 days', fill: 61, tone: 'amber' },
      { name: 'Alpha Industrial', amount: '3.4 days', fill: 34, tone: 'red' }
    ]
  },
  operations: {
    statCards: [
      { label: 'Open Tasks', value: '26', detail: 'Across teams', tone: 'amber', icon: 'T' },
      { label: 'Deliveries Queued', value: '9', detail: 'Ready to dispatch', tone: 'green', icon: 'D' },
      { label: 'Returns In Process', value: '4', detail: 'Need decision', tone: 'rose', icon: 'R' },
      { label: 'Linked Approvals', value: '6', detail: 'Operational blockers', tone: 'red', icon: '!' }
    ],
    tasks: [
      { label: 'Dispatch DEL-215 to Aether Group', due: 'Today' },
      { label: 'Close return inspection RET-020', due: 'Today', tone: 'warning' },
      { label: 'Assign picking team to JOB-882', due: 'Tomorrow' },
      { label: 'Upload proof of completion', due: 'Tomorrow' },
      { label: 'Review branch task backlog', due: 'Friday' }
    ],
    debtors: [
      { name: 'Dispatch readiness', amount: '86%', fill: 86, tone: 'green' },
      { name: 'Return closure', amount: '58%', fill: 58, tone: 'amber' },
      { name: 'Proof capture', amount: '42%', fill: 42, tone: 'red' }
    ]
  }
};

const chartMonths = [
  { month: 'Nov', revenue: 90, target: 34, trend: 20, targetTrend: 16 },
  { month: 'Dec', revenue: 132, target: 46, trend: 38, targetTrend: 22 },
  { month: 'Jan', revenue: 88, target: 42, trend: 30, targetTrend: 18 },
  { month: 'Feb', revenue: 96, target: 58, trend: 38, targetTrend: 26 },
  { month: 'Mar', revenue: 148, target: 74, trend: 72, targetTrend: 39 },
  { month: 'Apr', revenue: 144, target: 68, trend: 92, targetTrend: 46 },
  { month: 'May', revenue: 188, target: 92, trend: 84, targetTrend: 52 },
  { month: 'Jun', revenue: 138, target: 140, trend: 102, targetTrend: 62 }
] as const;

const activities = [
  { label: 'Invoice INV-1042 marked as', accent: 'Paid', tone: 'green' },
  { label: 'Stock transfer TRF-184 moved to', accent: 'In Transit', tone: 'amber' },
  { label: 'PO-2034 submitted for', accent: 'Approval', tone: 'green' },
  { label: 'Payment received from', accent: 'Northline Stores', tone: 'amber' },
  { label: 'Delivery DEL-215 ready for', accent: 'Dispatch', tone: 'green' }
] as const;

const stockItems = [
  { name: 'KX-200 Access Point', sku: 'KX-200', stock: '12 available' },
  { name: 'CCTV Camera Dome', sku: 'CCTV-204', stock: '4 available' },
  { name: '12U Wall Cabinet', sku: 'CAB-160', stock: '3 available' }
] as const;

export function DashboardPage() {
  const { activeRole } = usePreferences();
  const roleBoard = dashboardByRole[activeRole];

  return (
    <div className="dashboard-screen">
      <section className="hero-stats-row">
        {roleBoard.statCards.map((card) => (
          <article key={card.label} className="hero-stat-card glass-panel">
            <div className={`hero-stat-icon ${card.tone}`}>{card.icon}</div>
            <div>
              <h3>{card.label}</h3>
              <div className="hero-stat-value-row">
                <strong>{card.value}</strong>
                <span>{card.detail}</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-feature-grid">
        <article className="dashboard-panel chart-panel glass-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Sales Overview</h3>
            </div>
            <span className="panel-muted-action">This Month</span>
          </div>

          <div className="chart-summary-row">
            <div>
              <div className="chart-total">R 78,200</div>
              <div className="chart-total-underline" />
            </div>
            <div className="chart-legend">
              <span><i className="legend-swatch green" /> Revenue</span>
              <span><i className="legend-swatch red" /> Target</span>
            </div>
          </div>

          <div className="chart-shell">
            <div className="chart-y-axis">
              <span>R 300k</span>
              <span>R 200k</span>
              <span>R 100k</span>
            </div>
            <div className="chart-area">
              <div className="chart-grid-lines">
                <span />
                <span />
                <span />
              </div>
              <div className="chart-columns">
                {chartMonths.map((item) => (
                  <div key={item.month} className="chart-column-group">
                    <div className="bars-with-lines">
                      <div className="chart-bars">
                        <span className="bar revenue" style={{ height: `${item.revenue}px` }} />
                        <span className="bar target" style={{ height: `${item.target}px` }} />
                      </div>
                      <span className="line-point revenue-line" style={{ bottom: `${item.trend}px` }} />
                      <span className="line-point target-line" style={{ bottom: `${item.targetTrend}px` }} />
                    </div>
                    <small>{item.month}</small>
                  </div>
                ))}
              </div>
              <div className="trend-line revenue-trend">
                <span style={{ left: '4%', bottom: '20px', width: '15%', transform: 'rotate(-12deg)' }} />
                <span style={{ left: '18%', bottom: '34px', width: '13%', transform: 'rotate(8deg)' }} />
                <span style={{ left: '31%', bottom: '29px', width: '13%', transform: 'rotate(-6deg)' }} />
                <span style={{ left: '44%', bottom: '38px', width: '14%', transform: 'rotate(-18deg)' }} />
                <span style={{ left: '58%', bottom: '66px', width: '14%', transform: 'rotate(-14deg)' }} />
                <span style={{ left: '72%', bottom: '86px', width: '12%', transform: 'rotate(8deg)' }} />
                <span style={{ left: '84%', bottom: '82px', width: '12%', transform: 'rotate(-18deg)' }} />
              </div>
              <div className="trend-line target-trend">
                <span style={{ left: '4%', bottom: '16px', width: '15%', transform: 'rotate(-6deg)' }} />
                <span style={{ left: '18%', bottom: '22px', width: '13%', transform: 'rotate(4deg)' }} />
                <span style={{ left: '31%', bottom: '18px', width: '13%', transform: 'rotate(-8deg)' }} />
                <span style={{ left: '44%', bottom: '26px', width: '14%', transform: 'rotate(-10deg)' }} />
                <span style={{ left: '58%', bottom: '39px', width: '14%', transform: 'rotate(-8deg)' }} />
                <span style={{ left: '72%', bottom: '46px', width: '12%', transform: 'rotate(-8deg)' }} />
                <span style={{ left: '84%', bottom: '52px', width: '12%', transform: 'rotate(-8deg)' }} />
              </div>
            </div>
          </div>
        </article>

        <article className="dashboard-panel tasks-panel glass-panel">
          <div className="dashboard-panel-header dashboard-panel-icons">
            <h3>{activeRole[0].toUpperCase() + activeRole.slice(1)} focus</h3>
            <div className="panel-icon-actions">
              <button className="icon-button compact" type="button" aria-label="Open tasks">↗</button>
              <button className="icon-button compact" type="button" aria-label="Task settings">⚙</button>
            </div>
          </div>
          <div className="task-list">
            {roleBoard.tasks.map((task) => (
              <div key={task.label} className="task-row">
                <div className="task-main">
                  <span className="task-check">☑</span>
                  <span>{task.label}</span>
                </div>
                <span className={`task-due ${task.tone ?? ''}`}>{task.due}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel debtors-panel glass-panel">
          <div className="dashboard-panel-header dashboard-panel-icons">
            <h3>{activeRole === 'finance' ? 'Debtors & Creditors' : 'Priority visibility'}</h3>
            <div className="panel-icon-actions">
              <button className="icon-button compact" type="button" aria-label="Open panel">↗</button>
              <button className="icon-button compact" type="button" aria-label="Panel settings">⚙</button>
            </div>
          </div>

          <div className="account-summary-grid">
            <div className="account-summary-card">
              <span className="account-title">Accounts Receivable</span>
              <div className="account-summary-row">
                <span>Open value</span>
                <strong>R 32,450</strong>
              </div>
            </div>
            <div className="account-summary-card">
              <span className="account-title">Accounts Payable</span>
              <div className="account-summary-row">
                <span>Review</span>
                <strong>R 21,870</strong>
              </div>
            </div>
          </div>

          <div className="top-debtors-block">
            <h4>{activeRole === 'procurement' ? 'Supplier performance' : 'Top items'}</h4>
            <div className="debtor-list">
              {roleBoard.debtors.map((item) => (
                <div key={item.name} className="debtor-row">
                  <span>{item.name}</span>
                  <strong>{item.amount}</strong>
                  <div className="debtor-track">
                    <span className={`debtor-fill ${item.tone}`} style={{ width: `${item.fill}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="dashboard-panel activity-panel glass-panel">
          <div className="dashboard-panel-header dashboard-panel-icons">
            <h3>Recent Activities</h3>
            <div className="panel-icon-actions">
              <button className="icon-button compact" type="button" aria-label="Open activities">↗</button>
            </div>
          </div>
          <div className="recent-activity-list">
            {activities.map((item, index) => (
              <div key={`${item.label}-${index}`} className="recent-activity-row">
                <span className={`status-dot ${item.tone}`}>•</span>
                <p>
                  {item.label} {item.accent ? <strong>{item.accent}</strong> : null}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <article className="dashboard-panel stock-panel glass-panel">
        <div className="dashboard-panel-header dashboard-panel-icons">
          <h3>Low Stock Items</h3>
          <div className="panel-icon-actions text-actions">
            <span>☰</span>
            <span>⌄</span>
            <span>⋯</span>
          </div>
        </div>

        <div className="stock-table-wrap">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Reorder</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item) => (
                <tr key={item.sku}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.stock}</td>
                  <td><button className="reorder-button" type="button">Reorder</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
