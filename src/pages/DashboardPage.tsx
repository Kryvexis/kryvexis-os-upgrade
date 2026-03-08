const statCards = [
  { label: 'Open Invoices', value: '$45,230', detail: 'Overdue', tone: 'rose', icon: '◔' },
  { label: 'Pending Approvals', value: '6', detail: 'Requests', tone: 'amber', icon: '◉' },
  { label: 'Low Stock Alerts', value: '8', detail: 'Products', tone: 'red', icon: '!' },
  { label: 'Cash on Hand', value: '$145,890', detail: 'Available', tone: 'green', icon: '$' }
] as const;

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

const tasks: Array<{ label: string; due: string; tone?: string }> = [
  { label: 'Review Monthly Report', due: 'Today' },
  { label: 'Follow up with Acme Corp', due: 'Today' },
  { label: 'Restock Warehouse A', due: 'Tomorrow' },
  { label: 'Approve Purchase Order #1045', due: 'Pending', tone: 'warning' },
  { label: 'Schedule Team Meeting', due: 'Friday' }
] as const;

const debtors = [
  { name: 'Acme Corporation', amount: '$12,700', fill: 100, tone: 'green' },
  { name: 'Global Tech Ltd', amount: '$8,500', fill: 52, tone: 'amber' },
  { name: 'Sunrise Retail', amount: '$6,100', fill: 40, tone: 'red' }
] as const;

const activities = [
  { label: 'Invoice #5679 marked as', accent: 'Paid', tone: 'green' },
  { label: 'Stock Transfer completed', accent: '', tone: 'amber' },
  { label: 'PO #1045 submitted for', accent: 'Approval', tone: 'green' },
  { label: 'Payment Received from', accent: 'Global Tech Ltd', tone: 'amber' },
  { label: 'Shipment Delivered to', accent: 'Warehouse', tone: 'green' }
] as const;

const stockItems = [
  { name: 'Wireless Mouse', sku: 'WM-1002', stock: '5 in Stock' },
  { name: 'Printer Toner Cartridge', sku: 'PTC-204', stock: '2 in Stock' },
  { name: 'LED Desk Lamp', sku: 'LDL-160', stock: '3 in Stock' }
] as const;

export function DashboardPage() {
  return (
    <div className="dashboard-screen">
      <section className="hero-stats-row">
        {statCards.map((card) => (
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
              <div className="chart-total">$78,200</div>
              <div className="chart-total-underline" />
            </div>
            <div className="chart-legend">
              <span><i className="legend-swatch green" /> Revenue</span>
              <span><i className="legend-swatch red" /> Target</span>
            </div>
          </div>

          <div className="chart-shell">
            <div className="chart-y-axis">
              <span>$300</span>
              <span>$300</span>
              <span>$100</span>
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
            <h3>Tasks &amp; Reminders</h3>
            <div className="panel-icon-actions">
              <button className="icon-button compact" type="button" aria-label="Open tasks">↗</button>
              <button className="icon-button compact" type="button" aria-label="Task settings">⚙</button>
            </div>
          </div>
          <div className="task-list">
            {tasks.map((task) => (
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
            <h3>Debtors &amp; Creditors</h3>
            <div className="panel-icon-actions">
              <button className="icon-button compact" type="button" aria-label="Open debtors and creditors">↗</button>
              <button className="icon-button compact" type="button" aria-label="Debtors settings">⚙</button>
            </div>
          </div>

          <div className="account-summary-grid">
            <div className="account-summary-card">
              <span className="account-title">Accounts Receivable</span>
              <div className="account-summary-row">
                <span>Revenue</span>
                <strong>$32,450</strong>
              </div>
            </div>
            <div className="account-summary-card">
              <span className="account-title">Accounts Payable</span>
              <div className="account-summary-row">
                <span>Review</span>
                <strong>$21,870</strong>
              </div>
            </div>
          </div>

          <div className="top-debtors-block">
            <h4>Top Debtors</h4>
            <div className="debtor-list">
              {debtors.map((item) => (
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
                <span className={`status-dot ${item.tone}`}>{item.tone === 'green' ? '2' : '2'}</span>
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
