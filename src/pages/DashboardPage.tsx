import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
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

const baseChartMonths = [
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
  { label: 'Invoice INV-1042 marked as', accent: 'Paid', tone: 'green', href: '/invoices' },
  { label: 'Stock transfer TRF-184 moved to', accent: 'In Transit', tone: 'amber', href: '/inventory' },
  { label: 'PO-2034 submitted for', accent: 'Approval', tone: 'green', href: '/purchase-orders/1' },
  { label: 'Payment received from', accent: 'Northline Stores', tone: 'amber', href: '/payments' },
  { label: 'Delivery DEL-215 ready for', accent: 'Dispatch', tone: 'green', href: '/operations' }
] as const;

const stockItems = [
  { name: 'KX-200 Access Point', sku: 'KX-200', stock: '12 available', href: '/products/1' },
  { name: 'CCTV Camera Dome', sku: 'CCTV-204', stock: '4 available', href: '/products' },
  { name: '12U Wall Cabinet', sku: 'CAB-160', stock: '3 available', href: '/products' }
] as const;

const roleActions: Record<RoleKey, Array<{ label: string; href: string }>> = {
  admin: [
    { label: 'Open approvals', href: '/approvals' },
    { label: 'Review finance', href: '/accounting' },
    { label: 'System settings', href: '/admin' }
  ],
  sales: [
    { label: 'Create quote', href: '/quotes' },
    { label: 'View customers', href: '/customers' },
    { label: 'Open invoices', href: '/invoices' }
  ],
  warehouse: [
    { label: 'View products', href: '/products' },
    { label: 'Stock board', href: '/inventory' },
    { label: 'Open POs', href: '/purchase-orders' }
  ],
  finance: [
    { label: 'Open payments', href: '/payments' },
    { label: 'Debtors book', href: '/accounting' },
    { label: 'Issue statements', href: '/invoices' }
  ],
  procurement: [
    { label: 'Supplier queue', href: '/procurement' },
    { label: 'Open POs', href: '/purchase-orders' },
    { label: 'Stock risk', href: '/inventory' }
  ],
  operations: [
    { label: 'Task board', href: '/operations' },
    { label: 'Approvals', href: '/approvals' },
    { label: 'Notifications', href: '/notifications' }
  ]
};

export function DashboardPage() {
  const { activeRole, branchName, setBranchName } = usePreferences();
  const roleBoard = dashboardByRole[activeRole];
  const [timeRange, setTimeRange] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [doneTasks, setDoneTasks] = useState<string[]>([]);

  const chartMonths = useMemo(() => {
    const factor = timeRange === 'monthly' ? 1 : timeRange === 'quarterly' ? 1.2 : 1.45;
    return baseChartMonths.map((item) => ({
      ...item,
      revenue: Math.round(item.revenue * factor),
      target: Math.round(item.target * factor),
      trend: Math.round(item.trend * factor),
      targetTrend: Math.round(item.targetTrend * factor)
    }));
  }, [timeRange]);

  const chartTotal = useMemo(() => {
    const total = chartMonths.reduce((sum, item) => sum + item.revenue, 0) * 1000;
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(total);
  }, [chartMonths]);

  const visibleTasks = roleBoard.tasks.filter((task) => !doneTasks.includes(task.label));

  return (
    <div className="dashboard-screen">
      <section className="dashboard-toolbar glass-panel">
        <div>
          <p className="eyebrow">Workspace control</p>
          <h3>{branchName} dashboard</h3>
          <p className="page-description">This pass adds real clickable controls so the dashboard is not just a static mockup.</p>
        </div>
        <div className="dashboard-toolbar-actions">
          <div className="mini-toggle-group">
            {['Main Branch', 'Cape Town', 'Johannesburg'].map((branch) => (
              <button key={branch} type="button" className={`mini-toggle ${branchName === branch ? 'active' : ''}`} onClick={() => setBranchName(branch)}>
                {branch}
              </button>
            ))}
          </div>
          <div className="quick-link-row">
            {roleActions[activeRole].map((item) => (
              <NavLink key={item.href} to={item.href} className="soft-button">
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <section className="hero-stats-row">
        {roleBoard.statCards.map((card) => (
          <NavLink key={card.label} to={card.label.includes('Approvals') ? '/approvals' : card.label.includes('Stock') ? '/inventory' : card.label.includes('Quote') ? '/quotes' : card.label.includes('Payment') || card.label.includes('Cash') ? '/payments' : '/invoices'} className="hero-stat-card glass-panel clickable-card">
            <div className={`hero-stat-icon ${card.tone}`}>{card.icon}</div>
            <div>
              <h3>{card.label}</h3>
              <div className="hero-stat-value-row">
                <strong>{card.value}</strong>
                <span>{card.detail}</span>
              </div>
            </div>
          </NavLink>
        ))}
      </section>

      <section className="dashboard-feature-grid">
        <article className="dashboard-panel chart-panel glass-panel">
          <div className="dashboard-panel-header dashboard-panel-stack">
            <div>
              <h3>Sales Overview</h3>
              <p className="page-description">Switch the range and the chart values update.</p>
            </div>
            <div className="mini-toggle-group">
              {(['monthly', 'quarterly', 'yearly'] as const).map((range) => (
                <button key={range} type="button" className={`mini-toggle ${timeRange === range ? 'active' : ''}`} onClick={() => setTimeRange(range)}>
                  {range[0].toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-summary-row">
            <div>
              <div className="chart-total">{chartTotal}</div>
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
              <div className="chart-grid-lines"><span /><span /><span /></div>
              <div className="chart-columns">
                {chartMonths.map((item) => (
                  <div key={item.month} className="chart-column-group" title={`${item.month}: Revenue ${item.revenue} / Target ${item.target}`}>
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
            </div>
          </div>
        </article>

        <article className="dashboard-panel tasks-panel glass-panel">
          <div className="dashboard-panel-header dashboard-panel-icons">
            <h3>{activeRole[0].toUpperCase() + activeRole.slice(1)} focus</h3>
            <div className="panel-icon-actions">
              <NavLink className="icon-button compact icon-link" to={`/${activeRole === 'warehouse' ? 'inventory' : activeRole}`}>↗</NavLink>
            </div>
          </div>
          <div className="task-list">
            {visibleTasks.map((task) => (
              <button key={task.label} type="button" className="task-row task-button" onClick={() => setDoneTasks((current) => [...current, task.label])}>
                <div className="task-main">
                  <span className="task-check">☑</span>
                  <span>{task.label}</span>
                </div>
                <span className={`task-due ${task.tone ?? ''}`}>{task.due}</span>
              </button>
            ))}
            {visibleTasks.length === 0 ? <div className="empty-inline-state">All current focus items cleared for this session.</div> : null}
          </div>
        </article>

        <article className="dashboard-panel debtors-panel glass-panel">
          <div className="dashboard-panel-header dashboard-panel-icons">
            <h3>{activeRole === 'finance' ? 'Debtors & Creditors' : 'Priority visibility'}</h3>
            <div className="panel-icon-actions">
              <NavLink className="icon-button compact icon-link" to={activeRole === 'procurement' ? '/purchase-orders' : activeRole === 'warehouse' ? '/products' : '/customers'}>↗</NavLink>
            </div>
          </div>
          <div className="account-summary-grid">
            <div className="account-summary-card"><span className="account-title">Accounts Receivable</span><div className="account-summary-row"><span>Open value</span><strong>R 32,450</strong></div></div>
            <div className="account-summary-card"><span className="account-title">Accounts Payable</span><div className="account-summary-row"><span>Review</span><strong>R 21,870</strong></div></div>
          </div>
          <div className="top-debtors-block">
            <h4>{activeRole === 'procurement' ? 'Supplier performance' : 'Top items'}</h4>
            <div className="debtor-list">
              {roleBoard.debtors.map((item) => (
                <NavLink key={item.name} to={activeRole === 'procurement' ? '/purchase-orders' : '/customers'} className="debtor-row clickable-card">
                  <span>{item.name}</span>
                  <strong>{item.amount}</strong>
                  <div className="debtor-track"><span className={`debtor-fill ${item.tone}`} style={{ width: `${item.fill}%` }} /></div>
                </NavLink>
              ))}
            </div>
          </div>
        </article>

        <article className="dashboard-panel activity-panel glass-panel">
          <div className="dashboard-panel-header dashboard-panel-icons">
            <h3>Recent Activities</h3>
            <div className="panel-icon-actions"><NavLink className="icon-button compact icon-link" to="/notifications">↗</NavLink></div>
          </div>
          <div className="recent-activity-list">
            {activities.map((item, index) => (
              <NavLink key={`${item.label}-${index}`} to={item.href} className="recent-activity-row clickable-card">
                <span className={`status-dot ${item.tone}`}>•</span>
                <p>{item.label} <strong>{item.accent}</strong></p>
              </NavLink>
            ))}
          </div>
        </article>

        <article className="dashboard-panel stock-panel glass-panel">
          <div className="dashboard-panel-header dashboard-panel-icons">
            <h3>Low stock items</h3>
            <div className="panel-icon-actions"><NavLink className="icon-button compact icon-link" to="/products">↗</NavLink></div>
          </div>
          <div className="stock-list">
            {stockItems.map((item) => (
              <NavLink key={item.sku} to={item.href} className="stock-row clickable-card">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.sku}</p>
                </div>
                <span>{item.stock}</span>
              </NavLink>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
