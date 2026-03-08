import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { StatCard } from '../components/StatCard';
import { TableShell } from '../components/TableShell';

type ModuleConfig = {
  stats: Array<{ label: string; value: string; detail: string }>;
  focus: string[];
  queueTitle: string;
  queueDescription: string;
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, string> & { id: string }>;
  sideTitle: string;
  sideItems: string[];
  quickLinks: Array<{ label: string; href: string; detail: string }>;
};

const moduleConfigs: Record<string, ModuleConfig> = {
  Sales: {
    stats: [
      { label: 'Quotes awaiting action', value: '18', detail: '3 need approval today' },
      { label: 'Invoices due this week', value: 'R 84,220', detail: 'Collections focus' },
      { label: 'Quote conversion', value: '68%', detail: 'Last 30 days' },
      { label: 'Returns pending', value: '4', detail: 'Need inspection' }
    ],
    focus: ['Keep customers, quotes, and invoices in one sales lane', 'Push accepted quotes into invoice issuing', 'Use fewer clicks between pipeline and debtor follow-up'],
    queueTitle: 'Sales control room',
    queueDescription: 'Commercial activity, pipeline risk, and follow-up tasks.',
    columns: [
      { key: 'record', label: 'Record' },
      { key: 'counterparty', label: 'Customer' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: '1', record: 'QT-1011', counterparty: 'Aether Group', owner: 'Antonie', status: 'Awaiting approval' },
      { id: '2', record: 'INV-1058', counterparty: 'Northline Stores', owner: 'Finance', status: 'Due tomorrow' },
      { id: '3', record: 'RET-020', counterparty: 'BluePeak Foods', owner: 'Sales', status: 'Inspection needed' }
    ],
    sideTitle: 'Sales next build',
    sideItems: ['Customer statements', 'Discount approval policy', 'Quote to invoice conversion log', 'Rep targets and branch leaderboard'],
    quickLinks: [
      { label: 'Customers', href: '/customers', detail: 'Profiles, balances, and account health' },
      { label: 'Quotes', href: '/quotes', detail: 'Create, review, and convert quotes' },
      { label: 'Invoices', href: '/invoices', detail: 'Billing, reminders, and debtor control' }
    ]
  },
  Finance: {
    stats: [
      { label: 'Debtors book', value: 'R 241,880', detail: 'Open invoices' },
      { label: 'Creditors due', value: 'R 117,420', detail: 'Next 7 days' },
      { label: 'Receipts today', value: 'R 32,600', detail: '8 allocations posted' },
      { label: 'Cash-up variances', value: '2', detail: 'Need sign-off' }
    ],
    focus: ['Keep invoicing, receipts, and approvals together', 'Reduce bouncing between finance screens', 'Make payment allocation and follow-up feel immediate'],
    queueTitle: 'Finance control',
    queueDescription: 'Core finance actions tied to commercial and procurement events.',
    columns: [
      { key: 'record', label: 'Record' },
      { key: 'counterparty', label: 'Counterparty' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: '1', record: 'INV-1049', counterparty: 'Northline Stores', owner: 'Credit control', status: 'Overdue' },
      { id: '2', record: 'RCPT-2204', counterparty: 'Northline Stores', owner: 'Finance desk', status: 'Unallocated' },
      { id: '3', record: 'APP-045', counterparty: 'PO-2034', owner: 'Finance lead', status: 'Needs decision' }
    ],
    sideTitle: 'Finance next build',
    sideItems: ['Supplier statements', 'Expense approvals', 'Reconciliation foundations', 'Audit extracts and exports'],
    quickLinks: [
      { label: 'Invoices', href: '/invoices', detail: 'Issue, chase, and reconcile invoices' },
      { label: 'Payments', href: '/payments', detail: 'Receipts, allocations, and proof' },
      { label: 'Approvals', href: '/approvals', detail: 'Cross-module approval inbox' }
    ]
  },
  Inventory: {
    stats: [
      { label: 'Tracked SKUs', value: '1,284', detail: 'Across all branches' },
      { label: 'Low stock items', value: '12', detail: 'Need reorder review' },
      { label: 'Transfers pending', value: '7', detail: 'Cross-branch movement' },
      { label: 'Incoming units', value: '87', detail: 'Expected this week' }
    ],
    focus: ['Group products, procurement, and receiving under one stock lane', 'Expose low-stock pressure without extra navigation', 'Keep warehouse actions close to purchase orders'],
    queueTitle: 'Inventory operations',
    queueDescription: 'Live stock visibility, movement health, and replenishment pressure.',
    columns: [
      { key: 'record', label: 'Item / Move' },
      { key: 'counterparty', label: 'Branch / Location' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: '1', record: 'KX-200 Access Point', counterparty: 'Main Branch', owner: 'Warehouse', status: 'Below reorder point' },
      { id: '2', record: 'PO-2034', counterparty: 'Vertex Trade', owner: 'Procurement', status: 'Awaiting approval' },
      { id: '3', record: 'GRN-093', counterparty: 'Johannesburg', owner: 'Receiving', status: 'Awaiting count confirmation' }
    ],
    sideTitle: 'Inventory next build',
    sideItems: ['Reserved stock logic', 'Available vs incoming stock', 'Dead stock analysis', 'Barcode and scan-ready workflows'],
    quickLinks: [
      { label: 'Products', href: '/products', detail: 'Catalog, stock, and reorder posture' },
      { label: 'Purchase Orders', href: '/purchase-orders', detail: 'Replenishment and supplier execution' },
      { label: 'Approvals', href: '/approvals', detail: 'Stock and procurement blockers' }
    ]
  },
  Procurement: {
    stats: [
      { label: 'Open POs', value: '14', detail: '4 awaiting approval' },
      { label: 'Late suppliers', value: '3', detail: 'Past expected date' },
      { label: 'Bills unmatched', value: '5', detail: 'Need PO/GRN review' },
      { label: 'Reorder candidates', value: '12', detail: 'Generated from stock rules' }
    ],
    focus: ['Suppliers and quotes', 'Purchase orders', 'Goods received', 'Supplier bill matching'],
    queueTitle: 'Procurement queue',
    queueDescription: 'Supplier execution, receiving health, and discrepancy handling.',
    columns: [
      { key: 'record', label: 'Record' },
      { key: 'counterparty', label: 'Supplier' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: '1', record: 'PO-2034', counterparty: 'Vertex Trade', owner: 'Procurement', status: 'Awaiting approval' },
      { id: '2', record: 'SB-412', counterparty: 'Nexa Supply', owner: 'Finance', status: 'Price mismatch' },
      { id: '3', record: 'ACK-081', counterparty: 'Alpha Industrial', owner: 'Receiving', status: 'Delivery overdue' }
    ],
    sideTitle: 'Procurement next build',
    sideItems: ['Supplier scorecards', 'Lead time reporting', 'PO acknowledgement flow', 'Reorder sweeps and alerts'],
    quickLinks: [
      { label: 'Purchase Orders', href: '/purchase-orders', detail: 'Supplier POs and matching' },
      { label: 'Products', href: '/products', detail: 'Low-stock and supplier linkage' },
      { label: 'Approvals', href: '/approvals', detail: 'Approval path for purchases' }
    ]
  },
  Operations: {
    stats: [
      { label: 'Open tasks', value: '26', detail: 'Across teams' },
      { label: 'Deliveries queued', value: '9', detail: 'Ready to dispatch' },
      { label: 'Returns in process', value: '4', detail: 'Need decision' },
      { label: 'Approvals linked', value: '6', detail: 'Operational blockers' }
    ],
    focus: ['Job cards and tasks', 'Picking and dispatch', 'Returns flow', 'Proof of completion'],
    queueTitle: 'Operations board',
    queueDescription: 'Daily execution lane for jobs, deliveries, and exceptions.',
    columns: [
      { key: 'record', label: 'Record' },
      { key: 'counterparty', label: 'Target' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: '1', record: 'JOB-882', counterparty: 'Cape Town dispatch', owner: 'Ops lead', status: 'Picking in progress' },
      { id: '2', record: 'DEL-215', counterparty: 'Aether Group', owner: 'Driver team', status: 'Awaiting proof' },
      { id: '3', record: 'RET-020', counterparty: 'Northline Stores', owner: 'Warehouse', status: 'Inspection booked' }
    ],
    sideTitle: 'Operations next build',
    sideItems: ['Dispatch board', 'Proof capture', 'Return disposition states', 'Task templates by branch'],
    quickLinks: [
      { label: 'Approvals', href: '/approvals', detail: 'Clear blockers and approvals' },
      { label: 'Inventory', href: '/inventory', detail: 'Move into stock and receiving views' },
      { label: 'Dashboard', href: '/dashboard', detail: 'Return to branch overview' }
    ]
  },
  Reports: {
    stats: [
      { label: 'Saved reports', value: '24', detail: 'Role-based packs' },
      { label: 'Exports this week', value: '11', detail: 'Finance and management' },
      { label: 'Forecast runs', value: '3', detail: 'Collections and demand' },
      { label: 'Branch packs', value: '5', detail: 'Ready every Monday' }
    ],
    focus: ['Sales reporting', 'Stock reporting', 'Accounting reporting', 'Forecasting'],
    queueTitle: 'Reporting hub',
    queueDescription: 'Decision support views across revenue, stock, finance, and procurement.',
    columns: [
      { key: 'record', label: 'Pack / Report' },
      { key: 'counterparty', label: 'Audience' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: '1', record: 'Debtor aging pack', counterparty: 'Finance', owner: 'System job', status: 'Scheduled daily' },
      { id: '2', record: 'Branch performance', counterparty: 'Executive', owner: 'Reporting', status: 'Ready to export' },
      { id: '3', record: 'Low-stock exceptions', counterparty: 'Procurement', owner: 'Inventory', status: 'Needs review' }
    ],
    sideTitle: 'Reports next build',
    sideItems: ['Trend charts', 'Forecast assumptions', 'Role-specific export packs', 'Scheduled report delivery'],
    quickLinks: [
      { label: 'Dashboard', href: '/dashboard', detail: 'Return to summary view' },
      { label: 'Finance', href: '/accounting', detail: 'Open finance source data' },
      { label: 'Inventory', href: '/inventory', detail: 'Open stock source data' }
    ]
  },
  Admin: {
    stats: [
      { label: 'Active users', value: '18', detail: '6 roles in use' },
      { label: 'Automation rules', value: '14', detail: 'Email and internal events' },
      { label: 'Audit events today', value: '132', detail: 'System-wide traceability' },
      { label: 'Open imports', value: '2', detail: 'Validation needed' }
    ],
    focus: ['Users and roles', 'Branches and defaults', 'Templates and numbering', 'Audit and automations'],
    queueTitle: 'Administration center',
    queueDescription: 'Control plane for access, templates, audit, and workspace rules.',
    columns: [
      { key: 'record', label: 'Control item' },
      { key: 'counterparty', label: 'Scope' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: '1', record: 'Role template update', counterparty: 'Sales', owner: 'Admin', status: 'Awaiting publish' },
      { id: '2', record: 'Invoice template', counterparty: 'All branches', owner: 'Finance', status: 'Draft revision' },
      { id: '3', record: 'Import map - Products', counterparty: 'Inventory', owner: 'System', status: 'Validated' }
    ],
    sideTitle: 'Admin next build',
    sideItems: ['Approver chains', 'Branch-specific numbering', 'Data import mappings', 'Automation audit viewer'],
    quickLinks: [
      { label: 'Settings', href: '/settings', detail: 'Appearance and system preferences' },
      { label: 'Dashboard', href: '/dashboard', detail: 'Return to control center' },
      { label: 'Finance', href: '/accounting', detail: 'Open billing and controls' }
    ]
  }
};

export function ModuleLandingPage({ title, description }: { title: string; description: string }) {
  const config = moduleConfigs[title] ?? moduleConfigs.Admin;
  const [view, setView] = useState<'overview' | 'live queue' | 'next up'>('overview');

  const rows = useMemo(() => {
    if (view === 'live queue') return config.rows;
    if (view === 'next up') return [...config.rows].reverse();
    return config.rows.slice(0, 2);
  }, [config.rows, view]);

  return (
    <div className="page-stack">
      <PageHeader
        title={title}
        description={description}
        actions={<div className="quick-link-row premium-actions">{config.quickLinks.map((item) => <NavLink key={item.href} className="soft-button" to={item.href}>{item.label}</NavLink>)}</div>}
      />

      <section className="module-hero glass-panel">
        <div>
          <p className="eyebrow">Workspace focus</p>
          <h2>{title} is now a parent tab</h2>
          <p className="page-description">The sidebar stays calmer while the detailed tools live inside this workspace where they belong.</p>
        </div>
        <div className="section-tabs premium-section-tabs" aria-label={`${title} views`}>
          {(['overview', 'live queue', 'next up'] as const).map((tab) => (
            <button key={tab} type="button" className={`section-tab ${view === tab ? 'active' : ''}`} onClick={() => setView(tab)}>
              {tab}
            </button>
          ))}
        </div>
      </section>

      <section className="submodule-grid">
        {config.quickLinks.map((item) => (
          <NavLink key={item.href} to={item.href} className="submodule-card glass-panel">
            <span className="eyebrow">Inside {title}</span>
            <strong>{item.label}</strong>
            <p>{item.detail}</p>
          </NavLink>
        ))}
      </section>

      <section className="stats-grid compact">
        {config.stats.map((item) => (<StatCard key={item.label} label={item.label} value={item.value} detail={item.detail} />))}
      </section>

      <div className="content-split premium-content-split">
        <div className="page-stack">
          <TableShell title={config.queueTitle} description={view === 'next up' ? 'Priority view arranged around the next handoffs to clear.' : config.queueDescription} columns={config.columns} rows={rows} actions={<span className="eyebrow">{rows.length} visible records</span>} />
          <PanelCard title={`${title} focus`}>
            <ul className="clean-list">{(view === 'next up' ? config.sideItems : config.focus).map((item) => (<li key={item}>{item}</li>))}</ul>
          </PanelCard>
        </div>

        <PanelCard title={view === 'live queue' ? 'Linked tools' : config.sideTitle}>
          <ul className="clean-list">{(view === 'live queue' ? config.quickLinks.map((item) => item.label) : config.sideItems).map((item) => (<li key={item}>{item}</li>))}</ul>
        </PanelCard>
      </div>
    </div>
  );
}
