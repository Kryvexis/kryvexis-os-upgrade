import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { StatCard } from '../components/StatCard';
import { TableShell } from '../components/TableShell';

type WorkspaceStat = { label: string; value: string; detail: string };
type WorkspaceTile = { label: string; href: string; detail: string; tag: string };
type WorkspaceRow = Record<string, string> & { id: string };

type ModuleConfig = {
  eyebrow: string;
  intro: string;
  chips: string[];
  stats: WorkspaceStat[];
  tiles: WorkspaceTile[];
  queueTitle: string;
  queueDescription: string;
  columns: Array<{ key: string; label: string }>;
  rows: WorkspaceRow[];
  insightsTitle: string;
  insights: string[];
  phaseTitle: string;
  phaseItems: string[];
  actions: string[];
};

const moduleConfigs: Record<string, ModuleConfig> = {
  Sales: {
    eyebrow: 'Revenue and customer operations',
    intro: 'Quotes, customers, invoices, payment follow-up, and commercial next actions in one calmer workspace.',
    chips: ['Quote to cash', 'Customer health', 'Collections visibility'],
    stats: [
      { label: 'Quotes awaiting action', value: '18', detail: '3 need approval today' },
      { label: 'Invoices due this week', value: 'R 84,220', detail: 'Collections focus' },
      { label: 'Quote conversion', value: '68%', detail: 'Last 30 days' },
      { label: 'Customer follow-ups', value: '7', detail: 'Due before close' }
    ],
    tiles: [
      { label: 'Customers', href: '/customers', detail: 'Profiles, balances, contacts, statements, and credit posture.', tag: 'Accounts' },
      { label: 'Quotes', href: '/quotes', detail: 'Create, approve, and convert quotes with fewer clicks.', tag: 'Pipeline' },
      { label: 'Invoices', href: '/invoices', detail: 'Issue invoices, track due dates, and monitor reminders.', tag: 'Billing' },
      { label: 'Payments', href: '/payments', detail: 'Review receipts and allocation handoff from finance.', tag: 'Collections' }
    ],
    queueTitle: 'Live commercial queue',
    queueDescription: 'The current work needing attention across customers, quotes, invoices, and debtor follow-up.',
    columns: [
      { key: 'record', label: 'Record' },
      { key: 'counterparty', label: 'Customer' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: '1', record: 'QT-1011', counterparty: 'Aether Group', owner: 'Antonie', status: 'Awaiting approval' },
      { id: '2', record: 'INV-1058', counterparty: 'Northline Stores', owner: 'Finance', status: 'Due tomorrow' },
      { id: '3', record: 'CUS-084', counterparty: 'Crest Office Park', owner: 'Sales desk', status: 'Credit review' }
    ],
    insightsTitle: 'What this workspace should feel like',
    insights: [
      'One clear lane from customer to quote to invoice to payment follow-up.',
      'Status, owner, timestamps, and next actions always visible.',
      'Role-aware visibility so sales sees the essentials without clutter.'
    ],
    phaseTitle: 'Phase 1 build focus',
    phaseItems: ['Dashboard', 'Customers', 'Quotes', 'Invoices', 'Payments', 'Settings', 'Roles and themes'],
    actions: ['New quote', 'Capture customer', 'Open debtor list']
  },
  Finance: {
    eyebrow: 'Financial control and collections',
    intro: 'Invoices, receipts, approvals, debtor visibility, and cleaner control surfaces for finance users.',
    chips: ['Debtors first', 'Receipts and allocations', 'Approval inbox'],
    stats: [
      { label: 'Debtors book', value: 'R 241,880', detail: 'Open invoices' },
      { label: 'Receipts today', value: 'R 32,600', detail: '8 allocations posted' },
      { label: 'Approvals pending', value: '5', detail: 'Cross-module decisions' },
      { label: 'Statements ready', value: '22', detail: 'Tonight schedule' }
    ],
    tiles: [
      { label: 'Invoices', href: '/invoices', detail: 'Issue, review, chase, and control invoice status.', tag: 'Receivables' },
      { label: 'Payments', href: '/payments', detail: 'Customer receipts, allocations, and proof handling.', tag: 'Cash' },
      { label: 'Approvals', href: '/approvals', detail: 'Cross-module approval inbox for commercial and stock events.', tag: 'Control' },
      { label: 'Settings', href: '/settings?tab=roles', detail: 'Role templates, payment terms, and notification preferences.', tag: 'Policy' }
    ],
    queueTitle: 'Finance control queue',
    queueDescription: 'High-signal items for debtor follow-up, allocations, and decisions waiting on finance.',
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
    insightsTitle: 'Finance design principles',
    insights: [
      'Accounting should feel like the control backbone, not a side tab.',
      'Everything should flow back to traceable documents and accountable outcomes.',
      'Receipts, statements, and approvals need fast drill-down paths.'
    ],
    phaseTitle: 'Phase 1 now · deeper accounting later',
    phaseItems: ['Invoices', 'Payments', 'Approvals', 'Statements visibility', 'Expenses and cash-up next phase'],
    actions: ['Record receipt', 'Run statements', 'Review approvals']
  },
  Inventory: {
    eyebrow: 'Stock posture and replenishment',
    intro: 'Products, stock risk, purchase orders, and replenishment pressure in a cleaner inventory control room.',
    chips: ['Low stock watch', 'Incoming stock', 'Procurement handoff'],
    stats: [
      { label: 'Tracked SKUs', value: '1,284', detail: 'Across all branches' },
      { label: 'Low stock items', value: '12', detail: 'Need reorder review' },
      { label: 'Transfers pending', value: '7', detail: 'Cross-branch movement' },
      { label: 'Incoming units', value: '87', detail: 'Expected this week' }
    ],
    tiles: [
      { label: 'Products', href: '/products', detail: 'Catalog, stock on hand, reorder thresholds, and branch visibility.', tag: 'Catalog' },
      { label: 'Purchase Orders', href: '/purchase-orders', detail: 'Supplier ordering, expected receipt dates, and execution.', tag: 'Procurement' },
      { label: 'Approvals', href: '/approvals', detail: 'Stock exceptions, blockers, and procurement decisions.', tag: 'Exceptions' },
      { label: 'Dashboard', href: '/dashboard', detail: 'Jump back to low-stock and operational alerts.', tag: 'Overview' }
    ],
    queueTitle: 'Stock pressure queue',
    queueDescription: 'What the warehouse and procurement lane should resolve next.',
    columns: [
      { key: 'record', label: 'Item / Move' },
      { key: 'counterparty', label: 'Branch / Location' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: '1', record: 'KX-200 Access Point', counterparty: 'Main Branch', owner: 'Warehouse', status: 'Below reorder point' },
      { id: '2', record: 'TRF-188', counterparty: 'Cape Town → JHB', owner: 'Warehouse', status: 'Awaiting dispatch' },
      { id: '3', record: 'PO-2034', counterparty: 'SignalWave Supply', owner: 'Procurement', status: 'Expected Friday' }
    ],
    insightsTitle: 'Inventory design principles',
    insights: [
      'Multi-branch stock posture should stay visible without burying the user in ERP noise.',
      'Low-stock, incoming stock, and approvals need one clear decision lane.',
      'Mobile readiness matters for warehouse and operations workflows.'
    ],
    phaseTitle: 'Phase 1 with Phase 2 in view',
    phaseItems: ['Products', 'Stock posture', 'Purchase orders', 'Goods received next', 'Supplier bills next'],
    actions: ['Add product', 'Raise PO', 'Review low stock']
  },
  Admin: {
    eyebrow: 'Platform controls and appearance',
    intro: 'Roles, preferences, themes, and workspace standards that keep the OS coherent as more modules arrive.',
    chips: ['Shared shell', 'Role-aware visibility', 'Config-driven growth'],
    stats: [
      { label: 'Active users', value: '18', detail: '6 roles in use' },
      { label: 'Theme modes', value: '3', detail: 'Light, dark, system' },
      { label: 'Branches', value: '4', detail: 'Role-aware context' },
      { label: 'Audit events today', value: '132', detail: 'Traceable changes' }
    ],
    tiles: [
      { label: 'Settings', href: '/settings', detail: 'Appearance, profile, business settings, and preferences.', tag: 'Preferences' },
      { label: 'Dashboard', href: '/dashboard', detail: 'Return to the main control center and branch activity.', tag: 'Control room' },
      { label: 'Sales', href: '/sales', detail: 'Check the customer-facing module state and layout quality.', tag: 'Module QA' },
      { label: 'Finance', href: '/accounting', detail: 'Verify billing, payments, and approval control surfaces.', tag: 'Governance' }
    ],
    queueTitle: 'Admin readiness queue',
    queueDescription: 'The work needed to keep the shell consistent while Phase 1 moves toward a full platform.',
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
    insightsTitle: 'Admin design principles',
    insights: [
      'Every new module should still feel like one operating system.',
      'Navigation should stay calm as deeper workflows move inside parent workspaces.',
      'Role visibility, branch scope, and auditability must be designed from the beginning.'
    ],
    phaseTitle: 'Roadmap staging',
    phaseItems: ['Phase 1: shell and core commerce', 'Phase 2: inventory and procurement', 'Phase 3: workflow depth'],
    actions: ['Open settings', 'Review roles', 'Check theme modes']
  }
};

function WorkspaceCard({ title, items }: { title: string; items: string[] }) {
  return (
    <PanelCard title={title}>
      <ul className="clean-list workspace-clean-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </PanelCard>
  );
}

export function ModuleLandingPage({ title, description }: { title: string; description: string }) {
  const config = useMemo(() => {
    if (title === 'Finance') return moduleConfigs.Finance;
    if (title === 'Inventory') return moduleConfigs.Inventory;
    if (title === 'Sales') return moduleConfigs.Sales;
    return moduleConfigs.Admin;
  }, [title]);
  const [view, setView] = useState<'overview' | 'live' | 'plan'>('overview');

  const rows = useMemo(() => {
    if (view === 'live') return config.rows;
    if (view === 'plan') return [...config.rows].reverse();
    return config.rows.slice(0, 2);
  }, [config.rows, view]);

  const phaseList = view === 'plan' ? config.phaseItems : config.insights;

  return (
    <div className="page-stack rebuilt-workspace-page">
      <PageHeader
        eyebrow={config.eyebrow}
        title={title}
        description={description}
        actions={<div className="quick-link-row premium-actions rebuilt-page-actions">{config.actions.map((action) => <button key={action} className="soft-button" type="button">{action}</button>)}</div>}
      />

      <section className="workspace-overview-shell">
        <div className="workspace-overview-card glass-panel">
          <div className="workspace-overview-head">
            <div>
              <p className="eyebrow">Workspace overview</p>
              <h2>{title} control room</h2>
              <p className="page-description">{config.intro}</p>
            </div>
            <div className="section-tabs rebuilt-segmented-tabs" aria-label={`${title} views`}>
              {(['overview', 'live', 'plan'] as const).map((tab) => (
                <button key={tab} type="button" className={`section-tab ${view === tab ? 'active' : ''}`} onClick={() => setView(tab)}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="workspace-chip-row">
            {config.chips.map((chip) => (
              <span key={chip} className="workspace-chip">{chip}</span>
            ))}
          </div>
        </div>

        <aside className="workspace-context-card glass-panel">
          <p className="eyebrow">Phase 1 direction</p>
          <strong>Calm, dense, role-aware</strong>
          <p>{description}</p>
          <div className="workspace-context-grid">
            <div className="muted-card">
              <span className="eyebrow">Visible now</span>
              <strong>{rows.length} live items</strong>
            </div>
            <div className="muted-card">
              <span className="eyebrow">Next</span>
              <strong>{view === 'plan' ? 'Roadmap' : 'Execution'}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="workspace-tile-grid">
        {config.tiles.map((tile) => (
          <NavLink key={tile.href} to={tile.href} className="workspace-tile glass-panel">
            <span className="workspace-tile-tag">{tile.tag}</span>
            <strong>{tile.label}</strong>
            <p>{tile.detail}</p>
          </NavLink>
        ))}
      </section>

      <section className="stats-grid compact">
        {config.stats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} detail={item.detail} />
        ))}
      </section>

      <div className="content-split rebuilt-content-split">
        <div className="page-stack">
          <TableShell
            title={config.queueTitle}
            description={config.queueDescription}
            columns={config.columns}
            rows={rows}
            actions={<span className="eyebrow">{view === 'overview' ? 'Snapshot' : view === 'live' ? 'Live queue' : 'Plan view'}</span>}
          />
          <WorkspaceCard title={config.insightsTitle} items={phaseList} />
        </div>

        <div className="page-stack">
          <WorkspaceCard title={config.phaseTitle} items={config.phaseItems} />
          <PanelCard title="Why this rebuild matters">
            <ul className="clean-list workspace-clean-list">
              <li>Navigation stays clean while detailed tools move inside the parent workspace.</li>
              <li>Content cards now sit in a stable grid instead of overlapping stacked blocks.</li>
              <li>The shell is closer to the premium, soft-business direction from the blueprint.</li>
            </ul>
          </PanelCard>
        </div>
      </div>
    </div>
  );
}
