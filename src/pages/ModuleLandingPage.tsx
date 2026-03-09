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
    focus: ['Customers, quotes, invoices, and follow-up live inside one revenue workspace.', 'Accepted quotes should flow into invoice issuing with fewer clicks.', 'Statements and debtor actions stay close to customer context.'],
    queueTitle: 'Sales queue',
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
    sideTitle: 'Phase 1 scope',
    sideItems: ['Customers', 'Quotes', 'Invoices', 'Payments handoff', 'Role-aware dashboard widgets'],
    quickLinks: [
      { label: 'Customers', href: '/customers', detail: 'Profiles, balances, and account health' },
      { label: 'Quotes', href: '/quotes', detail: 'Create, review, and convert quotes' },
      { label: 'Invoices', href: '/invoices', detail: 'Billing, reminders, and debtor control' }
    ]
  },
  Finance: {
    stats: [
      { label: 'Debtors book', value: 'R 241,880', detail: 'Open invoices' },
      { label: 'Receipts today', value: 'R 32,600', detail: '8 allocations posted' },
      { label: 'Approvals pending', value: '5', detail: 'Cross-module decisions' },
      { label: 'Statements ready', value: '22', detail: 'Tonight schedule' }
    ],
    focus: ['Finance in Phase 1 centers on invoices, payments, and approvals.', 'Collections and receipts stay close to the customer document trail.', 'Deeper accounting layers land in later phases.'],
    queueTitle: 'Finance queue',
    queueDescription: 'Core finance actions tied to invoices, receipts, and approval control.',
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
    sideTitle: 'Phase 2 and later',
    sideItems: ['Debtors aging', 'Creditors', 'Expenses', 'Cash up', 'Reconciliation foundations'],
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
    focus: ['Phase 1 includes products and stock posture.', 'Procurement, GRNs, and supplier bill matching deepen in Phase 2.', 'Keep the inventory lane clean and mobile-friendly from the start.'],
    queueTitle: 'Inventory queue',
    queueDescription: 'Live stock visibility and replenishment pressure.',
    columns: [
      { key: 'record', label: 'Item / Move' },
      { key: 'counterparty', label: 'Branch / Location' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: '1', record: 'KX-200 Access Point', counterparty: 'Main Branch', owner: 'Warehouse', status: 'Below reorder point' },
      { id: '2', record: 'TRF-188', counterparty: 'Cape Town to JHB', owner: 'Warehouse', status: 'Awaiting dispatch' },
      { id: '3', record: 'SKU-902', counterparty: 'Johannesburg', owner: 'Inventory', status: 'Critical level' }
    ],
    sideTitle: 'Phase 2 build-outs',
    sideItems: ['Suppliers', 'Purchase orders', 'Goods received', 'Supplier bills', 'Valuation support'],
    quickLinks: [
      { label: 'Products', href: '/products', detail: 'Catalog, stock, and reorder posture' },
      { label: 'Purchase Orders', href: '/purchase-orders', detail: 'Replenishment and supplier execution' },
      { label: 'Approvals', href: '/approvals', detail: 'Stock and procurement blockers' }
    ]
  },
  Admin: {
    stats: [
      { label: 'Active users', value: '18', detail: '6 roles in use' },
      { label: 'Theme modes', value: '3', detail: 'Light, dark, system' },
      { label: 'Branches', value: '4', detail: 'Role-aware context' },
      { label: 'Audit events today', value: '132', detail: 'Traceable changes' }
    ],
    focus: ['Settings, themes, and role-aware controls are core Phase 1 deliverables.', 'The shell should stay shared across desktop and mobile.', 'Templates and automation rules deepen after the commerce basics are stable.'],
    queueTitle: 'Admin queue',
    queueDescription: 'Workspace controls, appearance, access, and rollout readiness.',
    columns: [
      { key: 'record', label: 'Control item' },
      { key: 'counterparty', label: 'Scope' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: '1', record: 'Role template update', counterparty: 'Sales', owner: 'Admin', status: 'Awaiting publish' },
      { id: '2', record: 'Theme preference rollout', counterparty: 'All users', owner: 'System', status: 'Live' },
      { id: '3', record: 'Mobile shell review', counterparty: 'Operations', owner: 'Product', status: 'In test' }
    ],
    sideTitle: 'Phase roadmap',
    sideItems: ['Phase 1: Shell and core commerce', 'Phase 2: Inventory and procurement depth', 'Phase 3: Workflow, accounting, automation, and reports'],
    quickLinks: [
      { label: 'Settings', href: '/settings', detail: 'Appearance and system preferences' },
      { label: 'Dashboard', href: '/dashboard', detail: 'Return to control center' },
      { label: 'Finance', href: '/accounting', detail: 'Open billing and controls' }
    ]
  }
};

export function ModuleLandingPage({ title, description }: { title: string; description: string }) {
  const baseConfig = moduleConfigs[title] ?? moduleConfigs.Admin;
  const config = title === 'Procurement' || title === 'Operations' || title === 'Reports' ? moduleConfigs.Admin : baseConfig;
  const [view, setView] = useState<'overview' | 'queue' | 'roadmap'>('overview');

  const rows = useMemo(() => {
    if (view === 'queue') return config.rows;
    if (view === 'roadmap') return [...config.rows].reverse();
    return config.rows.slice(0, 2);
  }, [config.rows, view]);

  const sideItems = view === 'roadmap' ? config.sideItems : view === 'queue' ? config.quickLinks.map((item) => item.label) : config.focus;

  return (
    <div className="page-stack">
      <PageHeader
        title={title}
        description={description}
        actions={<div className="quick-link-row premium-actions">{config.quickLinks.map((item) => <NavLink key={item.href} className="soft-button" to={item.href}>{item.label}</NavLink>)}</div>}
      />

      <section className="module-hero glass-panel">
        <div className="module-hero-copy">
          <p className="eyebrow">Phase 1 focus</p>
          <h2>{title} workspace</h2>
          <p className="page-description">{title === 'Sales' || title === 'Inventory' || title === 'Finance' || title === 'Admin' ? 'A cleaner parent workspace with the detailed tools folded inside.' : 'This lane stays mapped to the Phase 1 shell while deeper operational depth lands later.'}</p>
        </div>
        <div className="section-tabs premium-section-tabs" aria-label={`${title} views`}>
          {(['overview', 'queue', 'roadmap'] as const).map((tab) => (
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
        {config.stats.map((item) => <StatCard key={item.label} label={item.label} value={item.value} detail={item.detail} />)}
      </section>

      <div className="content-split premium-content-split">
        <div className="page-stack">
          <TableShell
            title={config.queueTitle}
            description={view === 'roadmap' ? 'Roadmap-flavoured slice of the current workspace queue.' : config.queueDescription}
            columns={config.columns}
            rows={rows}
            actions={<span className="eyebrow">{rows.length} visible records</span>}
          />
          <PanelCard title={view === 'roadmap' ? 'What lands next' : `${title} principles`}>
            <ul className="clean-list">{sideItems.map((item) => (<li key={item}>{item}</li>))}</ul>
          </PanelCard>
        </div>

        <PanelCard title={config.sideTitle}>
          <ul className="clean-list">{config.sideItems.map((item) => (<li key={item}>{item}</li>))}</ul>
        </PanelCard>
      </div>
    </div>
  );
}
