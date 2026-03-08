import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { StatCard } from '../components/StatCard';
import { TableShell } from '../components/TableShell';

type RecordItem = {
  id: string;
  search: string;
  status: string;
  [key: string]: ReactNode | string;
};

function ChecklistCard({ title, items }: { title: string; items: string[] }) {
  return (
    <PanelCard title={title}>
      <ul className="clean-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </PanelCard>
  );
}

function MiniGrid({ items }: { items: Array<{ label: string; value: string; detail: string }> }) {
  return (
    <div className="mini-summary-grid">
      {items.map((item) => (
        <div key={item.label} className="muted-card">
          <span className="eyebrow">{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

function FlowStrip({ title, steps }: { title: string; steps: string[] }) {
  return (
    <PanelCard title={title}>
      <div className="flow-strip">
        {steps.map((step, index) => (
          <div key={step} className="flow-step">
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}

function WorkspaceToolbar({
  search,
  onSearchChange,
  statuses,
  activeStatus,
  onStatusChange,
  primaryAction,
  secondaryAction,
  metrics
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statuses: string[];
  activeStatus: string;
  onStatusChange: (value: string) => void;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  metrics?: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="workspace-toolbar glass-panel">
      <div className="workspace-toolbar-row">
        <label className="workspace-search">
          <span>Search</span>
          <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search records, parties, branches, or actions" />
        </label>
        <div className="workspace-actions">
          {secondaryAction}
          {primaryAction}
        </div>
      </div>
      <div className="workspace-toolbar-row workspace-toolbar-lower">
        <div className="chip-row" role="tablist" aria-label="Workspace filters">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              className={`filter-chip ${activeStatus === status ? 'active' : ''}`}
              onClick={() => onStatusChange(status)}
            >
              {status}
            </button>
          ))}
        </div>
        {metrics ? (
          <div className="workspace-metrics">
            {metrics.map((metric) => (
              <div key={metric.label} className="workspace-metric muted-card">
                <span className="eyebrow">{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getFilteredRows(rows: RecordItem[], search: string, status: string) {
  const query = search.trim().toLowerCase();
  return rows.filter((row) => {
    const matchesStatus = status === 'All' || row.status === status;
    const matchesQuery = !query || row.search.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });
}

export function CustomersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [rows, setRows] = useState<RecordItem[]>([
    {
      id: '1',
      customer: <NavLink className="text-link" to="/customers/1">Aether Group</NavLink>,
      status: 'Active',
      terms: '30 day terms',
      balance: 'R 24,500',
      rep: 'Antonie',
      next: 'Statement run today',
      search: 'Aether Group active 30 day terms R24500 Antonie statement run today'
    },
    {
      id: '2',
      customer: 'Northline Stores',
      status: 'Credit review',
      terms: '45 day terms',
      balance: 'R 8,200',
      rep: 'Maya',
      next: 'Call debtor tomorrow',
      search: 'Northline Stores credit review 45 day terms R8200 Maya call debtor tomorrow'
    },
    {
      id: '3',
      customer: 'BluePeak Foods',
      status: 'Good standing',
      terms: 'COD',
      balance: 'R 0',
      rep: 'Chris',
      next: 'Renew price list',
      search: 'BluePeak Foods good standing COD R0 Chris renew price list'
    },
    {
      id: '4',
      customer: 'Crest Office Park',
      status: 'Onboarding',
      terms: 'Pending approval',
      balance: 'R 13,870',
      rep: 'Sales desk',
      next: 'Approve credit limit',
      search: 'Crest Office Park onboarding pending approval R13870 Sales desk approve credit limit'
    }
  ]);

  const filteredRows = useMemo(() => getFilteredRows(rows, search, status), [rows, search, status]);

  return (
    <div className="page-stack">
      <PageHeader title="Customers" description="Master customer accounts with contacts, credit posture, statements, communications, and next actions." actions={<button className="soft-button primary" onClick={() => setRows((current) => [{ id: String(current.length + 1), customer: 'New walk-in account', status: 'Onboarding', terms: 'Cash account', balance: 'R 0', rep: 'Sales desk', next: 'Capture contacts', search: 'new walk-in account onboarding cash account capture contacts' }, ...current])}>New customer</button>} />

      <section className="stats-grid compact">
        <StatCard label="Customers" value="248" detail="188 active, 17 onboarding" />
        <StatCard label="Outstanding" value="R 91,240" detail="Open balances under follow-up" />
        <StatCard label="Statements due" value="22" detail="Ready for scheduled send" />
        <StatCard label="Risk flags" value="14" detail="Credit or dispute review" />
      </section>

      <WorkspaceToolbar
        search={search}
        onSearchChange={setSearch}
        statuses={['All', 'Active', 'Credit review', 'Good standing', 'Onboarding']}
        activeStatus={status}
        onStatusChange={setStatus}
        secondaryAction={<button className="soft-button" onClick={() => { setSearch(''); setStatus('All'); }}>Reset</button>}
        metrics={[
          { label: 'Visible accounts', value: String(filteredRows.length) },
          { label: 'Follow-ups today', value: '7' }
        ]}
      />

      <FlowStrip title="Sales-to-cash lane" steps={['Customer', 'Quote', 'Approval', 'Invoice', 'Payment', 'Statement']} />

      <div className="content-split">
        <div className="page-stack">
          <TableShell
            title="Customer operating list"
            description="Commercial health, terms, account balance, and next workflow action per customer."
            columns={[
              { key: 'customer', label: 'Customer' },
              { key: 'status', label: 'Status' },
              { key: 'terms', label: 'Terms' },
              { key: 'balance', label: 'Balance' },
              { key: 'rep', label: 'Owner' },
              { key: 'next', label: 'Next action' }
            ]}
            rows={filteredRows as Array<Record<string, ReactNode> & { id: string }>}
            actions={<NavLink className="soft-button" to="/customers/1">Open customer profile</NavLink>}
          />
          <MiniGrid
            items={[
              { label: 'Collections', value: 'R 18,200', detail: 'Expected this week' },
              { label: 'Credit holds', value: '3', detail: 'Require manager review' },
              { label: 'Statements queued', value: '22', detail: 'Finance run prepared' }
            ]}
          />
        </div>
        <div className="page-stack">
          <ChecklistCard
            title="Customer workspace now does real work"
            items={[
              'Search and status filtering across live customer rows',
              'Clickable customer profile entry point for drill-down',
              'In-session customer creation for fast prototype testing',
              'Next actions aligned to statements, credit, and onboarding'
            ]}
          />
          <ChecklistCard
            title="Next implementation targets"
            items={[
              'Customer statement run and scheduled delivery',
              'Credit-limit approvals and dispute notes',
              'Communication log with quote and invoice events'
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const rows: RecordItem[] = [
    { id: '1', product: <NavLink className="text-link" to="/products/1">KX-100 Router</NavLink>, stock: '84', available: '72', location: 'Main / Cape Town', reorder: '40', status: 'Healthy', search: 'KX-100 Router 84 72 Main Cape Town reorder 40 healthy' },
    { id: '2', product: <NavLink className="text-link" to="/products/1">KX-200 Access Point</NavLink>, stock: '19', available: '12', location: 'Main', reorder: '25', status: 'Low stock', search: 'KX-200 Access Point 19 12 Main reorder 25 low stock' },
    { id: '3', product: 'KX-500 Switch', stock: '42', available: '39', location: 'Main / JHB', reorder: '18', status: 'Healthy', search: 'KX-500 Switch 42 39 Main JHB reorder 18 healthy' },
    { id: '4', product: 'KX-900 CCTV Kit', stock: '8', available: '5', location: 'Cape Town', reorder: '10', status: 'Critical', search: 'KX-900 CCTV Kit 8 5 Cape Town reorder 10 critical' },
    { id: '5', product: 'CAB-160 Wall Cabinet', stock: '11', available: '9', location: 'Johannesburg', reorder: '12', status: 'At risk', search: 'CAB-160 Wall Cabinet 11 9 Johannesburg reorder 12 at risk' }
  ];
  const filteredRows = useMemo(() => getFilteredRows(rows, search, status), [rows, search, status]);

  return (
    <div className="page-stack">
      <PageHeader title="Products" description="Catalog, stock posture, branch availability, pricing signals, and supplier linkage in one control room." actions={<button className="soft-button primary">Add product</button>} />
      <section className="stats-grid compact">
        <StatCard label="Products" value="1,284" detail="Tracked SKUs" />
        <StatCard label="Low stock" value="12" detail="Require reorder review" />
        <StatCard label="Incoming" value="87" detail="Expected across branches" />
        <StatCard label="At risk" value="31" detail="Available stock under pressure" />
      </section>
      <WorkspaceToolbar
        search={search}
        onSearchChange={setSearch}
        statuses={['All', 'Healthy', 'Low stock', 'At risk', 'Critical']}
        activeStatus={status}
        onStatusChange={setStatus}
        primaryAction={<NavLink className="soft-button primary" to="/purchase-orders">Open replenishment</NavLink>}
        metrics={[
          { label: 'Visible SKUs', value: String(filteredRows.length) },
          { label: 'Reorder candidates', value: '12' }
        ]}
      />
      <div className="content-split">
        <div className="page-stack">
          <TableShell
            title="Product control"
            description="Visibility into stock on hand, available stock, location spread, and reorder thresholds."
            columns={[
              { key: 'product', label: 'Product' },
              { key: 'status', label: 'Status' },
              { key: 'stock', label: 'On hand' },
              { key: 'available', label: 'Available' },
              { key: 'location', label: 'Location' },
              { key: 'reorder', label: 'Reorder point' }
            ]}
            rows={filteredRows as Array<Record<string, ReactNode> & { id: string }>}
            actions={<NavLink className="soft-button" to="/products/1">Open sample product</NavLink>}
          />
          <FlowStrip title="Inventory record shape" steps={['SKU', 'Branch stock', 'Supplier links', 'Movements', 'Reorder', 'Valuation later']} />
        </div>
        <div className="page-stack">
          <ChecklistCard
            title="Warehouse and procurement hooks"
            items={[
              'Status filter surfaces low stock and critical items instantly',
              'Product detail page shows movement history and supplier posture',
              'Reorder thresholds make procurement work visible from the product tab',
              'Branch/location view supports mobile stock checks later'
            ]}
          />
          <MiniGrid
            items={[
              { label: 'Barcode', value: 'Later', detail: 'Scanning path stays in scope' },
              { label: 'Suppliers', value: 'Linked', detail: 'Ready for PO sourcing' },
              { label: 'Pricing', value: 'Multi-tier', detail: 'Sell and cost posture visible' }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export function QuotesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const rows: RecordItem[] = [
    { id: '1', quote: 'QT-1008', customer: 'Aether Group', amount: 'R 18,200', status: 'Awaiting approval', valid: '14 Mar', owner: 'Antonie', search: 'QT-1008 Aether Group R18200 awaiting approval 14 Mar Antonie' },
    { id: '2', quote: 'QT-1009', customer: 'BluePeak Foods', amount: 'R 6,480', status: 'Sent', valid: '16 Mar', owner: 'Maya', search: 'QT-1009 BluePeak Foods R6480 sent 16 Mar Maya' },
    { id: '3', quote: 'QT-1010', customer: 'Northline Stores', amount: 'R 11,240', status: 'Draft', valid: '18 Mar', owner: 'Chris', search: 'QT-1010 Northline Stores R11240 draft 18 Mar Chris' },
    { id: '4', quote: 'QT-1011', customer: 'Crest Office Park', amount: 'R 28,500', status: 'High-value review', valid: '19 Mar', owner: 'Sales desk', search: 'QT-1011 Crest Office Park R28500 high-value review 19 Mar Sales desk' },
    { id: '5', quote: 'QT-1012', customer: 'Metro Wireless', amount: 'R 9,960', status: 'Accepted', valid: '21 Mar', owner: 'Antonie', search: 'QT-1012 Metro Wireless R9960 accepted 21 Mar Antonie' }
  ];
  const filteredRows = useMemo(() => getFilteredRows(rows, search, status), [rows, search, status]);

  return (
    <div className="page-stack">
      <PageHeader title="Quotes" description="Commercial pipeline with validity control, approvals, conversion readiness, and follow-up pressure." actions={<button className="soft-button primary">Create quote</button>} />
      <section className="stats-grid compact">
        <StatCard label="Open quotes" value="34" detail="Across all reps" />
        <StatCard label="Awaiting approval" value="6" detail="Discount or margin override" />
        <StatCard label="Conversion" value="68%" detail="Last 30 days" />
        <StatCard label="Expiring this week" value="9" detail="Need follow-up" />
      </section>
      <WorkspaceToolbar
        search={search}
        onSearchChange={setSearch}
        statuses={['All', 'Draft', 'Awaiting approval', 'Sent', 'Accepted', 'High-value review']}
        activeStatus={status}
        onStatusChange={setStatus}
        primaryAction={<NavLink className="soft-button primary" to="/approvals">Open approvals</NavLink>}
        metrics={[
          { label: 'Visible quotes', value: String(filteredRows.length) },
          { label: 'Won value', value: 'R 82k' }
        ]}
      />
      <div className="content-split">
        <div className="page-stack">
          <TableShell
            title="Quote pipeline"
            description="Quote control with owner, validity, and conversion stage visible in one workspace."
            columns={[
              { key: 'quote', label: 'Quote' },
              { key: 'customer', label: 'Customer' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Stage' },
              { key: 'valid', label: 'Valid until' },
              { key: 'owner', label: 'Owner' }
            ]}
            rows={filteredRows as Array<Record<string, ReactNode> & { id: string }>}
          />
          <FlowStrip title="Quote lifecycle" steps={['Draft', 'Review', 'Approval', 'Sent', 'Accepted', 'Invoice ready']} />
        </div>
        <div className="page-stack">
          <ChecklistCard
            title="Approval triggers in scope"
            items={[
              'High-value or low-margin quotes route into approvals',
              'Internal notes and conversion history stay attached to the quote',
              'Accepted quotes are positioned to hand off into invoice issuing',
              'Status chips let you work the pipeline instead of just viewing it'
            ]}
          />
          <MiniGrid
            items={[
              { label: 'Sent today', value: '7', detail: 'Customer communication lane' },
              { label: 'Pending follow-up', value: '11', detail: 'Sales action board' },
              { label: 'Expiring soon', value: '9', detail: 'Need conversion push' }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export function InvoicesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const rows: RecordItem[] = [
    { id: '1', invoice: 'INV-1042', customer: 'Aether Group', due: '12 Mar 2026', status: 'Paid', amount: 'R 18,200', next: 'Receipt filed', search: 'INV-1042 Aether Group 12 Mar 2026 paid R18200 receipt filed' },
    { id: '2', invoice: 'INV-1049', customer: 'Northline Stores', due: '15 Mar 2026', status: 'Overdue', amount: 'R 8,200', next: 'Reminder today', search: 'INV-1049 Northline Stores 15 Mar 2026 overdue R8200 reminder today' },
    { id: '3', invoice: 'INV-1052', customer: 'BluePeak Foods', due: '18 Mar 2026', status: 'Open', amount: 'R 12,540', next: 'Await receipt', search: 'INV-1052 BluePeak Foods 18 Mar 2026 open R12540 await receipt' },
    { id: '4', invoice: 'INV-1058', customer: 'Crest Office Park', due: '22 Mar 2026', status: 'Issued', amount: 'R 28,500', next: 'Monitor approval release', search: 'INV-1058 Crest Office Park 22 Mar 2026 issued R28500 monitor approval release' }
  ];
  const filteredRows = useMemo(() => getFilteredRows(rows, search, status), [rows, search, status]);

  return (
    <div className="page-stack">
      <PageHeader title="Invoices" description="Billing, collections, reminder readiness, receipts, and statement visibility for finance and sales." actions={<button className="soft-button primary">Issue invoice</button>} />
      <section className="stats-grid compact">
        <StatCard label="Open invoices" value="R 241,880" detail="Debtors book in focus" />
        <StatCard label="Overdue" value="R 48,120" detail="Needs follow-up" />
        <StatCard label="Issued today" value="6" detail="Billing throughput" />
        <StatCard label="Receipts pending" value="9" detail="Allocation required" />
      </section>
      <WorkspaceToolbar
        search={search}
        onSearchChange={setSearch}
        statuses={['All', 'Issued', 'Open', 'Paid', 'Overdue']}
        activeStatus={status}
        onStatusChange={setStatus}
        primaryAction={<NavLink className="soft-button primary" to="/payments">Open payments</NavLink>}
        metrics={[
          { label: 'Visible invoices', value: String(filteredRows.length) },
          { label: 'Reminders today', value: '4' }
        ]}
      />
      <div className="content-split">
        <div className="page-stack">
          <TableShell
            title="Invoice control"
            description="Invoice issue, due date, amount, and next collections action on one screen."
            columns={[
              { key: 'invoice', label: 'Invoice' },
              { key: 'customer', label: 'Customer' },
              { key: 'due', label: 'Due date' },
              { key: 'status', label: 'Status' },
              { key: 'amount', label: 'Amount' },
              { key: 'next', label: 'Next action' }
            ]}
            rows={filteredRows as Array<Record<string, ReactNode> & { id: string }>}
          />
          <FlowStrip title="Collection rhythm" steps={['Issued', 'Due', 'Reminder', '+7 days', '+14 escalation', 'Statement impact']} />
        </div>
        <div className="page-stack">
          <ChecklistCard
            title="Finance hooks now visible"
            items={[
              'Reminder cadence and statement impact clearly represented',
              'Receipts and reversals are separated into the payments workspace',
              'Open and overdue filters let finance work the debtor book quickly',
              'Invoice status stays aligned with customer statements and reporting'
            ]}
          />
          <MiniGrid
            items={[
              { label: 'Statements', value: 'Scheduled', detail: 'Month-end and ad hoc runs' },
              { label: 'Credits', value: '4', detail: 'Linked to returns workflow' },
              { label: 'Tax posture', value: 'Tracked', detail: 'Source document preserved' }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const rows: RecordItem[] = [
    { id: '1', payment: 'RCPT-2204', party: 'Northline Stores', type: 'Customer receipt', amount: 'R 8,200', allocation: 'INV-1049', status: 'Unallocated', search: 'RCPT-2204 Northline Stores customer receipt R8200 INV-1049 unallocated' },
    { id: '2', payment: 'PAY-918', party: 'Vertex Trade', type: 'Supplier payment', amount: 'R 18,900', allocation: 'PO-2034 / SB-412', status: 'Scheduled', search: 'PAY-918 Vertex Trade supplier payment R18900 PO-2034 SB-412 scheduled' },
    { id: '3', payment: 'RCPT-2205', party: 'Aether Group', type: 'Customer receipt', amount: 'R 18,200', allocation: 'INV-1042', status: 'Matched', search: 'RCPT-2205 Aether Group customer receipt R18200 INV-1042 matched' },
    { id: '4', payment: 'PAY-919', party: 'Nexa Supply', type: 'Supplier payment', amount: 'R 11,450', allocation: 'SB-399', status: 'Awaiting proof', search: 'PAY-919 Nexa Supply supplier payment R11450 SB-399 awaiting proof' }
  ];
  const filteredRows = useMemo(() => getFilteredRows(rows, search, status), [rows, search, status]);

  return (
    <div className="page-stack">
      <PageHeader title="Payments" description="Customer receipts, supplier payments, allocation against open documents, and proof attachments." eyebrow="Finance" actions={<button className="soft-button primary">Record payment</button>} />
      <section className="stats-grid compact">
        <StatCard label="Receipts today" value="R 32,600" detail="8 allocations posted" />
        <StatCard label="Supplier due this week" value="R 117,420" detail="Payables under review" />
        <StatCard label="Unallocated cash" value="R 8,200" detail="Needs matching" />
        <StatCard label="Proof pending" value="3" detail="Attachment or approval outstanding" />
      </section>
      <WorkspaceToolbar
        search={search}
        onSearchChange={setSearch}
        statuses={['All', 'Matched', 'Unallocated', 'Scheduled', 'Awaiting proof']}
        activeStatus={status}
        onStatusChange={setStatus}
        primaryAction={<NavLink className="soft-button primary" to="/accounting">Open finance board</NavLink>}
        metrics={[
          { label: 'Visible payments', value: String(filteredRows.length) },
          { label: 'Allocations pending', value: '5' }
        ]}
      />
      <div className="content-split">
        <div className="page-stack">
          <TableShell
            title="Payments workspace"
            description="Allocation visibility across customer receipts and supplier settlements."
            columns={[
              { key: 'payment', label: 'Payment' },
              { key: 'party', label: 'Counterparty' },
              { key: 'type', label: 'Type' },
              { key: 'amount', label: 'Amount' },
              { key: 'allocation', label: 'Allocation' },
              { key: 'status', label: 'Status' }
            ]}
            rows={filteredRows as Array<Record<string, ReactNode> & { id: string }>}
          />
          <FlowStrip title="Payment handling" steps={['Capture', 'Attach proof', 'Allocate', 'Reverse if needed', 'Statement update', 'Reporting']} />
        </div>
        <div className="page-stack">
          <ChecklistCard
            title="Accounting scope reflected here"
            items={[
              'Customer receipts and supplier payments live in one finance workspace',
              'Allocation against open documents is visible rather than implied',
              'Proof attachments and reversal readiness are represented for later depth',
              'Status chips split banked, pending, and unallocated work fast'
            ]}
          />
          <MiniGrid
            items={[
              { label: 'Bank import', value: 'Phase 2', detail: 'Reconciliation foundations later' },
              { label: 'Cash up', value: '2 variances', detail: 'Supervisor sign-off queue' },
              { label: 'Statements', value: 'Linked', detail: 'Customer and supplier balance updates' }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export function PurchaseOrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const rows: RecordItem[] = [
    { id: '1', po: 'PO-2031', supplier: 'Nexa Supply', received: 'Partial', bill: 'Awaiting match', branch: 'Main Branch', next: 'Resolve quantity diff', status: 'Partial', search: 'PO-2031 Nexa Supply partial awaiting match Main Branch resolve quantity diff' },
    { id: '2', po: <NavLink className="text-link" to="/purchase-orders/1">PO-2034</NavLink>, supplier: 'Vertex Trade', received: 'Not received', bill: 'Not billed', branch: 'Cape Town', next: 'Approval before release', status: 'Awaiting approval', search: 'PO-2034 Vertex Trade not received not billed Cape Town approval before release awaiting approval' },
    { id: '3', po: 'PO-2037', supplier: 'Alpha Industrial', received: 'Received', bill: 'Matched', branch: 'Johannesburg', next: 'Close PO', status: 'Matched', search: 'PO-2037 Alpha Industrial received matched Johannesburg close PO' },
    { id: '4', po: 'PO-2040', supplier: 'Signal Source', received: 'Overdue', bill: 'Not billed', branch: 'Main Branch', next: 'Supplier follow-up', status: 'Overdue', search: 'PO-2040 Signal Source overdue not billed Main Branch supplier follow-up overdue' }
  ];
  const filteredRows = useMemo(() => getFilteredRows(rows, search, status), [rows, search, status]);

  return (
    <div className="page-stack">
      <PageHeader title="Purchase Orders" description="Supplier purchasing, expected receipts, matching status, and next supply-chain actions." actions={<button className="soft-button primary">New PO</button>} />
      <section className="stats-grid compact">
        <StatCard label="Open POs" value="14" detail="4 awaiting approval" />
        <StatCard label="Late suppliers" value="3" detail="Past expected date" />
        <StatCard label="Unmatched bills" value="5" detail="PO and GRN review needed" />
        <StatCard label="Reorders" value="12" detail="Generated from stock rules" />
      </section>
      <WorkspaceToolbar
        search={search}
        onSearchChange={setSearch}
        statuses={['All', 'Awaiting approval', 'Partial', 'Matched', 'Overdue']}
        activeStatus={status}
        onStatusChange={setStatus}
        primaryAction={<NavLink className="soft-button primary" to="/purchase-orders/1">Open sample PO</NavLink>}
        metrics={[
          { label: 'Visible POs', value: String(filteredRows.length) },
          { label: 'Late suppliers', value: '3' }
        ]}
      />
      <div className="content-split">
        <div className="page-stack">
          <TableShell
            title="Purchase order queue"
            description="Supplier execution, branch receipt posture, and bill matching progress."
            columns={[
              { key: 'po', label: 'PO' },
              { key: 'status', label: 'Status' },
              { key: 'supplier', label: 'Supplier' },
              { key: 'received', label: 'Receiving' },
              { key: 'bill', label: 'Billing' },
              { key: 'branch', label: 'Branch' },
              { key: 'next', label: 'Next action' }
            ]}
            rows={filteredRows as Array<Record<string, ReactNode> & { id: string }>}
          />
          <FlowStrip title="Replenishment loop" steps={['Low stock', 'Reorder', 'PO', 'Goods received', 'Bill match', 'Supplier payment']} />
        </div>
        <div className="page-stack">
          <ChecklistCard
            title="Procurement depth now visible"
            items={[
              'Expected receipt, receiving state, and supplier-bill posture are all present',
              'Detail page covers ordered vs received lines and approval history',
              'This sets up phase 2 without leaving the PO module empty',
              'Overdue and approval filters expose urgent procurement work'
            ]}
          />
          <MiniGrid
            items={[
              { label: 'Lead time', value: '9.4 days', detail: 'Average for active suppliers' },
              { label: 'Overdue', value: '3 suppliers', detail: 'Escalation list visible' },
              { label: 'GRN links', value: 'Prepared', detail: 'Receipt history in next pass' }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export function ApprovalsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [rows, setRows] = useState<RecordItem[]>([
    { id: '1', request: 'Discount override', owner: 'Sales', impact: 'R 1,240', due: 'Today', branch: 'Main', status: 'Needs manager', search: 'Discount override Sales R1240 today Main needs manager' },
    { id: '2', request: 'Purchase order PO-2034', owner: 'Procurement', impact: 'R 18,900', due: 'Today', branch: 'Cape Town', status: 'High-value route', search: 'Purchase order PO-2034 Procurement R18900 today Cape Town high-value route' },
    { id: '3', request: 'Customer return CN-221', owner: 'Operations', impact: 'R 3,600', due: 'Tomorrow', branch: 'Main', status: 'Inspection complete', search: 'Customer return CN-221 Operations R3600 tomorrow Main inspection complete' },
    { id: '4', request: 'Cash-up variance', owner: 'Finance', impact: 'R 420', due: 'Tomorrow', branch: 'JHB', status: 'Supervisor sign-off', search: 'Cash-up variance Finance R420 tomorrow JHB supervisor sign-off' }
  ]);

  const filteredRows = useMemo(() => getFilteredRows(rows, search, status), [rows, search, status]);

  const handleDecision = (id: string, decision: 'Approved' | 'Rejected') => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status: decision, search: `${row.search} ${decision}` } : row)));
    setStatus('All');
  };

  const actionRows = filteredRows.map((row) => ({
    ...row,
    request: (
      <div className="inline-action-cell">
        <div>
          <strong>{String(row.request)}</strong>
          <p>{String(row.owner)} · {String(row.branch)}</p>
        </div>
        <div className="inline-action-buttons">
          <button className="soft-button" onClick={() => handleDecision(row.id, 'Approved')}>Approve</button>
          <button className="soft-button" onClick={() => handleDecision(row.id, 'Rejected')}>Reject</button>
        </div>
      </div>
    )
  }));

  return (
    <div className="page-stack">
      <PageHeader title="Approvals" description="Cross-module approval inbox for commercial, procurement, operations, and finance decisions." actions={<button className="soft-button">Approval policy</button>} />
      <section className="stats-grid compact">
        <StatCard label="Pending" value="5" detail="Need decision now" />
        <StatCard label="High value" value="2" detail="Escalated routing" />
        <StatCard label="Operational" value="2" detail="Returns and deliveries" />
        <StatCard label="Finance" value="1" detail="Cash-up and payment controls" />
      </section>
      <WorkspaceToolbar
        search={search}
        onSearchChange={setSearch}
        statuses={['All', 'Needs manager', 'High-value route', 'Inspection complete', 'Supervisor sign-off', 'Approved', 'Rejected']}
        activeStatus={status}
        onStatusChange={setStatus}
        secondaryAction={<button className="soft-button" onClick={() => setRows((current) => current.filter((row) => row.status !== 'Approved'))}>Clear approved</button>}
        metrics={[
          { label: 'Visible approvals', value: String(filteredRows.length) },
          { label: 'Due today', value: '2' }
        ]}
      />
      <div className="content-split">
        <TableShell
          title="Approval inbox"
          description="One queue for owners, value impact, branch scope, and due pressure. Approve or reject directly in-session."
          columns={[
            { key: 'request', label: 'Request' },
            { key: 'impact', label: 'Impact' },
            { key: 'due', label: 'Due' },
            { key: 'status', label: 'Status' }
          ]}
          rows={actionRows as Array<Record<string, ReactNode> & { id: string }>}
          actions={<button className="soft-button primary">Review queue</button>}
        />
        <ChecklistCard
          title="Approval model"
          items={[
            'Action-level security and approver chains stay visible from the beginning',
            'Branch scope is represented directly in the approval queue',
            'Direct approve and reject actions make this tab actually interactive',
            'Later automation can notify approvers when thresholds are hit'
          ]}
        />
      </div>
    </div>
  );
}
