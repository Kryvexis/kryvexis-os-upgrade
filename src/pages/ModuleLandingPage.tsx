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
};

const moduleConfigs: Record<string, ModuleConfig> = {
  Sales: {
    stats: [
      { label: 'Quotes awaiting action', value: '18', detail: '3 need approval today' },
      { label: 'Invoices due this week', value: 'R 84,220', detail: 'Collections focus' },
      { label: 'Quote conversion', value: '68%', detail: 'Last 30 days' },
      { label: 'Returns pending', value: '4', detail: 'Need inspection' }
    ],
    focus: ['Quotes and orders', 'Invoice issue flow', 'Customer pricing', 'Returns and credits'],
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
    sideItems: ['Customer statements', 'Discount approval policy', 'Quote to invoice conversion log', 'Rep targets and branch leaderboard']
  },
  Accounting: {
    stats: [
      { label: 'Debtors book', value: 'R 241,880', detail: 'Open invoices' },
      { label: 'Creditors due', value: 'R 117,420', detail: 'Next 7 days' },
      { label: 'Receipts today', value: 'R 32,600', detail: '8 allocations posted' },
      { label: 'Cash-up variances', value: '2', detail: 'Need sign-off' }
    ],
    focus: ['Debtors aging', 'Creditors control', 'Payments allocation', 'Statements and expenses'],
    queueTitle: 'Finance control',
    queueDescription: 'Core accounting actions tied to commercial and procurement events.',
    columns: [
      { key: 'record', label: 'Record' },
      { key: 'counterparty', label: 'Counterparty' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: '1', record: 'INV-1049', counterparty: 'Northline Stores', owner: 'Credit control', status: 'Overdue' },
      { id: '2', record: 'SB-412', counterparty: 'Nexa Supply', owner: 'AP queue', status: 'Mismatch review' },
      { id: '3', record: 'CU-008', counterparty: 'Main Branch', owner: 'Supervisor', status: 'Variance pending' }
    ],
    sideTitle: 'Accounting next build',
    sideItems: ['Supplier statements', 'Expense approvals', 'Reconciliation foundations', 'Audit extracts and exports']
  },
  Inventory: {
    stats: [
      { label: 'Tracked SKUs', value: '1,284', detail: 'Across all branches' },
      { label: 'Low stock items', value: '12', detail: 'Need reorder review' },
      { label: 'Transfers pending', value: '7', detail: 'Cross-branch movement' },
      { label: 'Incoming units', value: '87', detail: 'Expected this week' }
    ],
    focus: ['Stock on hand', 'Transfers and movements', 'Low-stock control', 'Goods received'],
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
      { id: '2', record: 'TRF-184', counterparty: 'Main → Cape Town', owner: 'Operations', status: 'In transit' },
      { id: '3', record: 'GRN-093', counterparty: 'Johannesburg', owner: 'Receiving', status: 'Awaiting count confirmation' }
    ],
    sideTitle: 'Inventory next build',
    sideItems: ['Reserved stock logic', 'Available vs incoming stock', 'Dead stock analysis', 'Barcode and scan-ready workflows']
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
    sideItems: ['Supplier scorecards', 'Lead time reporting', 'PO acknowledgement flow', 'Reorder sweeps and alerts']
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
    sideItems: ['Dispatch board', 'Proof capture', 'Return disposition states', 'Task templates by branch']
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
    sideItems: ['Trend charts', 'Forecast assumptions', 'Role-specific export packs', 'Scheduled report delivery']
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
    sideItems: ['Approver chains', 'Branch-specific numbering', 'Data import mappings', 'Automation audit viewer']
  }
};

export function ModuleLandingPage({ title, description }: { title: string; description: string }) {
  const config = moduleConfigs[title] ?? moduleConfigs.Admin;

  return (
    <div className="page-stack">
      <PageHeader title={title} description={description} actions={<button className="soft-button primary">Open workspace</button>} />

      <section className="stats-grid compact">
        {config.stats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} detail={item.detail} />
        ))}
      </section>

      <div className="content-split">
        <div className="page-stack">
          <TableShell
            title={config.queueTitle}
            description={config.queueDescription}
            columns={config.columns}
            rows={config.rows}
            actions={<button className="soft-button">Saved views</button>}
          />
          <PanelCard title={`${title} focus areas`}>
            <ul className="clean-list">
              {config.focus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </PanelCard>
        </div>

        <PanelCard title={config.sideTitle}>
          <ul className="clean-list">
            {config.sideItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PanelCard>
      </div>
    </div>
  );
}
