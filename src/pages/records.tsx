import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { StatCard } from '../components/StatCard';
import { TableShell } from '../components/TableShell';

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

export function CustomersPage() {
  const rows = [
    {
      id: '1',
      customer: <NavLink className="text-link" to="/customers/1">Aether Group</NavLink>,
      status: 'Active · 30 day terms',
      balance: 'R 24,500',
      rep: 'Antonie',
      next: 'Statement run today'
    },
    {
      id: '2',
      customer: 'Northline Stores',
      status: 'Credit review',
      balance: 'R 8,200',
      rep: 'Maya',
      next: 'Call debtor tomorrow'
    },
    {
      id: '3',
      customer: 'BluePeak Foods',
      status: 'Good standing',
      balance: 'R 0',
      rep: 'Chris',
      next: 'Renew price list'
    },
    {
      id: '4',
      customer: 'Crest Office Park',
      status: 'Onboarding',
      balance: 'R 13,870',
      rep: 'Sales desk',
      next: 'Approve credit limit'
    }
  ];

  return (
    <div className="page-stack">
      <PageHeader title="Customers" description="Master customer accounts with contacts, credit posture, statements, communications, and next actions." actions={<button className="soft-button primary">New customer</button>} />

      <section className="stats-grid compact">
        <StatCard label="Customers" value="248" detail="188 active, 17 onboarding" />
        <StatCard label="Outstanding" value="R 91,240" detail="Open balances under follow-up" />
        <StatCard label="Statements due" value="22" detail="Ready for scheduled send" />
        <StatCard label="Risk flags" value="14" detail="Credit or dispute review" />
      </section>

      <FlowStrip title="Sales-to-cash lane" steps={['Customer', 'Quote', 'Approval', 'Invoice', 'Payment', 'Statement']} />

      <div className="content-split">
        <div className="page-stack">
          <TableShell
            title="Customer operating list"
            description="Commercial health, account balance, and next workflow action per customer."
            columns={[
              { key: 'customer', label: 'Customer' },
              { key: 'status', label: 'Status' },
              { key: 'balance', label: 'Balance' },
              { key: 'rep', label: 'Owner' },
              { key: 'next', label: 'Next action' }
            ]}
            rows={rows}
            actions={<NavLink className="soft-button" to="/customers/1">Open sample profile</NavLink>}
          />
          <MiniGrid
            items={[
              { label: 'Statements', value: 'Ready', detail: 'PDF and email hooks prepared' },
              { label: 'Collections', value: '8 overdue', detail: 'Finance follow-up list' },
              { label: 'Pricing', value: '12 lists', detail: 'Customer-specific pricing loaded' }
            ]}
          />
        </div>

        <div className="page-stack">
          <ChecklistCard
            title="Customer record coverage"
            items={[
              'Contacts, payment terms, and risk flags visible at account level',
              'Quote, invoice, and payment history grouped around the customer',
              'Statement and reminder workflow ready for finance depth',
              'Profile detail page wired for notes, timeline, and approvals'
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
  const rows = [
    { id: '1', product: <NavLink className="text-link" to="/products/1">KX-100 Router</NavLink>, stock: '84', available: '72', location: 'Main / Cape Town', reorder: '40' },
    { id: '2', product: <NavLink className="text-link" to="/products/1">KX-200 Access Point</NavLink>, stock: '19', available: '12', location: 'Main', reorder: '25' },
    { id: '3', product: 'KX-500 Switch', stock: '42', available: '39', location: 'Main / JHB', reorder: '18' },
    { id: '4', product: 'KX-900 CCTV Kit', stock: '8', available: '5', location: 'Cape Town', reorder: '10' }
  ];

  return (
    <div className="page-stack">
      <PageHeader title="Products" description="Catalog, stock posture, branch availability, pricing signals, and supplier linkage in one control room." actions={<button className="soft-button primary">Add product</button>} />
      <section className="stats-grid compact">
        <StatCard label="Products" value="1,284" detail="Tracked SKUs" />
        <StatCard label="Low stock" value="12" detail="Require reorder review" />
        <StatCard label="Incoming" value="87" detail="Expected across branches" />
        <StatCard label="At risk" value="31" detail="Available stock under pressure" />
      </section>
      <div className="content-split">
        <div className="page-stack">
          <TableShell
            title="Product control"
            description="Visibility into stock on hand, available stock, location spread, and reorder thresholds."
            columns={[
              { key: 'product', label: 'Product' },
              { key: 'stock', label: 'On hand' },
              { key: 'available', label: 'Available' },
              { key: 'location', label: 'Location' },
              { key: 'reorder', label: 'Reorder point' }
            ]}
            rows={rows}
            actions={<NavLink className="soft-button" to="/products/1">Open sample product</NavLink>}
          />
          <FlowStrip title="Inventory record shape" steps={['SKU', 'Branch stock', 'Supplier links', 'Movements', 'Reorder', 'Valuation later']} />
        </div>
        <div className="page-stack">
          <ChecklistCard
            title="What this product module now covers"
            items={[
              'SKU and branch visibility instead of blank placeholders',
              'Available vs on-hand posture for replenishment decisions',
              'Detail pages for movement history, pricing, and supplier links',
              'Low-stock review lane aligned to procurement phase'
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
  const rows = [
    { id: '1', quote: 'QT-1008', customer: 'Aether Group', amount: 'R 18,200', stage: 'Awaiting approval', valid: '14 Mar', owner: 'Antonie' },
    { id: '2', quote: 'QT-1009', customer: 'BluePeak Foods', amount: 'R 6,480', stage: 'Sent', valid: '16 Mar', owner: 'Maya' },
    { id: '3', quote: 'QT-1010', customer: 'Northline Stores', amount: 'R 11,240', stage: 'Draft', valid: '18 Mar', owner: 'Chris' },
    { id: '4', quote: 'QT-1011', customer: 'Crest Office Park', amount: 'R 28,500', stage: 'High-value review', valid: '19 Mar', owner: 'Sales desk' }
  ];

  return (
    <div className="page-stack">
      <PageHeader title="Quotes" description="Commercial pipeline with validity control, approvals, conversion readiness, and follow-up pressure." actions={<button className="soft-button primary">Create quote</button>} />
      <section className="stats-grid compact">
        <StatCard label="Open quotes" value="34" detail="Across all reps" />
        <StatCard label="Awaiting approval" value="6" detail="Discount or margin override" />
        <StatCard label="Conversion" value="68%" detail="Last 30 days" />
        <StatCard label="Expiring this week" value="9" detail="Need follow-up" />
      </section>
      <div className="content-split">
        <div className="page-stack">
          <TableShell
            title="Quote pipeline"
            description="Quote control with owner, validity, and conversion stage visible in one workspace."
            columns={[
              { key: 'quote', label: 'Quote' },
              { key: 'customer', label: 'Customer' },
              { key: 'amount', label: 'Amount' },
              { key: 'stage', label: 'Stage' },
              { key: 'valid', label: 'Valid until' },
              { key: 'owner', label: 'Owner' }
            ]}
            rows={rows}
          />
          <FlowStrip title="Quote lifecycle" steps={['Draft', 'Review', 'Approval', 'Sent', 'Accepted', 'Invoice ready']} />
        </div>
        <div className="page-stack">
          <ChecklistCard
            title="Approval triggers in scope"
            items={[
              'High-value or low-margin quotes route into approvals',
              'Internal notes and conversion history stay attached to the quote',
              'Accepted quotes are positioned to hand off into invoice issuing'
            ]}
          />
          <MiniGrid
            items={[
              { label: 'Sent today', value: '7', detail: 'Customer communication lane' },
              { label: 'Won value', value: 'R 82k', detail: 'Current month so far' },
              { label: 'Pending follow-up', value: '11', detail: 'Sales action board' }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export function InvoicesPage() {
  const rows = [
    { id: '1', invoice: 'INV-1042', customer: 'Aether Group', due: '12 Mar 2026', status: 'Paid', amount: 'R 18,200', next: 'Receipt filed' },
    { id: '2', invoice: 'INV-1049', customer: 'Northline Stores', due: '15 Mar 2026', status: 'Overdue', amount: 'R 8,200', next: 'Reminder today' },
    { id: '3', invoice: 'INV-1052', customer: 'BluePeak Foods', due: '18 Mar 2026', status: 'Open', amount: 'R 12,540', next: 'Await receipt' },
    { id: '4', invoice: 'INV-1058', customer: 'Crest Office Park', due: '22 Mar 2026', status: 'Issued', amount: 'R 28,500', next: 'Monitor approval release' }
  ];

  return (
    <div className="page-stack">
      <PageHeader title="Invoices" description="Billing, collections, reminder readiness, receipts, and statement visibility for finance and sales." actions={<button className="soft-button primary">Issue invoice</button>} />
      <section className="stats-grid compact">
        <StatCard label="Open invoices" value="R 241,880" detail="Debtors book in focus" />
        <StatCard label="Overdue" value="R 48,120" detail="Needs follow-up" />
        <StatCard label="Issued today" value="6" detail="Billing throughput" />
        <StatCard label="Receipts pending" value="9" detail="Allocation required" />
      </section>
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
            rows={rows}
          />
          <FlowStrip title="Collection rhythm" steps={['Issued', 'Due', 'Reminder', '+7 days', '+14 escalation', 'Statement impact']} />
        </div>
        <div className="page-stack">
          <ChecklistCard
            title="Finance hooks now visible"
            items={[
              'Reminder cadence and statement impact clearly represented',
              'Receipts and reversals are separated into the payments workspace',
              'Invoice detail can feed customer history and reporting later'
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
  const rows = [
    { id: '1', payment: 'RCPT-2204', party: 'Northline Stores', type: 'Customer receipt', amount: 'R 8,200', allocation: 'INV-1049', status: 'Unallocated' },
    { id: '2', payment: 'PAY-918', party: 'Vertex Trade', type: 'Supplier payment', amount: 'R 18,900', allocation: 'PO-2034 / SB-412', status: 'Scheduled' },
    { id: '3', payment: 'RCPT-2205', party: 'Aether Group', type: 'Customer receipt', amount: 'R 18,200', allocation: 'INV-1042', status: 'Matched' },
    { id: '4', payment: 'PAY-919', party: 'Nexa Supply', type: 'Supplier payment', amount: 'R 11,450', allocation: 'SB-399', status: 'Awaiting proof' }
  ];

  return (
    <div className="page-stack">
      <PageHeader title="Payments" description="Customer receipts, supplier payments, allocation against open documents, and proof attachments." eyebrow="Finance" actions={<button className="soft-button primary">Record payment</button>} />
      <section className="stats-grid compact">
        <StatCard label="Receipts today" value="R 32,600" detail="8 allocations posted" />
        <StatCard label="Supplier due this week" value="R 117,420" detail="Payables under review" />
        <StatCard label="Unallocated cash" value="R 8,200" detail="Needs matching" />
        <StatCard label="Proof pending" value="3" detail="Attachment or approval outstanding" />
      </section>
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
            rows={rows}
          />
          <FlowStrip title="Payment handling" steps={['Capture', 'Attach proof', 'Allocate', 'Reverse if needed', 'Statement update', 'Reporting']} />
        </div>
        <div className="page-stack">
          <ChecklistCard
            title="Accounting scope reflected here"
            items={[
              'Customer receipts and supplier payments live in one finance workspace',
              'Allocation against open documents is visible rather than implied',
              'Proof attachments and reversal readiness are represented for later depth'
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
  const rows = [
    { id: '1', po: 'PO-2031', supplier: 'Nexa Supply', received: 'Partial', bill: 'Awaiting match', branch: 'Main Branch', next: 'Resolve quantity diff' },
    { id: '2', po: <NavLink className="text-link" to="/purchase-orders/1">PO-2034</NavLink>, supplier: 'Vertex Trade', received: 'Not received', bill: 'Not billed', branch: 'Cape Town', next: 'Approval before release' },
    { id: '3', po: 'PO-2037', supplier: 'Alpha Industrial', received: 'Received', bill: 'Matched', branch: 'Johannesburg', next: 'Close PO' },
    { id: '4', po: 'PO-2040', supplier: 'Signal Source', received: 'Overdue', bill: 'Not billed', branch: 'Main Branch', next: 'Supplier follow-up' }
  ];
  return (
    <div className="page-stack">
      <PageHeader title="Purchase Orders" description="Supplier purchasing, expected receipts, matching status, and next supply-chain actions." actions={<button className="soft-button primary">New PO</button>} />
      <section className="stats-grid compact">
        <StatCard label="Open POs" value="14" detail="4 awaiting approval" />
        <StatCard label="Late suppliers" value="3" detail="Past expected date" />
        <StatCard label="Unmatched bills" value="5" detail="PO and GRN review needed" />
        <StatCard label="Reorders" value="12" detail="Generated from stock rules" />
      </section>
      <div className="content-split">
        <div className="page-stack">
          <TableShell
            title="Purchase order queue"
            description="Supplier execution, branch receipt posture, and bill matching progress."
            columns={[
              { key: 'po', label: 'PO' },
              { key: 'supplier', label: 'Supplier' },
              { key: 'received', label: 'Receiving' },
              { key: 'bill', label: 'Billing' },
              { key: 'branch', label: 'Branch' },
              { key: 'next', label: 'Next action' }
            ]}
            rows={rows}
            actions={<NavLink className="soft-button" to="/purchase-orders/1">Open sample PO</NavLink>}
          />
          <FlowStrip title="Replenishment loop" steps={['Low stock', 'Reorder', 'PO', 'Goods received', 'Bill match', 'Supplier payment']} />
        </div>
        <div className="page-stack">
          <ChecklistCard
            title="Procurement depth now visible"
            items={[
              'Expected receipt, receiving state, and supplier-bill posture are all present',
              'Detail page covers ordered vs received lines and approval history',
              'This sets up phase 2 without leaving the PO module empty'
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
  const rows = [
    { id: '1', request: 'Discount override', owner: 'Sales', impact: 'R 1,240', due: 'Today', branch: 'Main', status: 'Needs manager' },
    { id: '2', request: 'Purchase order PO-2034', owner: 'Procurement', impact: 'R 18,900', due: 'Today', branch: 'Cape Town', status: 'High-value route' },
    { id: '3', request: 'Customer return CN-221', owner: 'Operations', impact: 'R 3,600', due: 'Tomorrow', branch: 'Main', status: 'Inspection complete' },
    { id: '4', request: 'Cash-up variance', owner: 'Finance', impact: 'R 420', due: 'Tomorrow', branch: 'JHB', status: 'Supervisor sign-off' }
  ];
  return (
    <div className="page-stack">
      <PageHeader title="Approvals" description="Cross-module approval inbox for commercial, procurement, operations, and finance decisions." actions={<button className="soft-button">Approval policy</button>} />
      <section className="stats-grid compact">
        <StatCard label="Pending" value="5" detail="Need decision now" />
        <StatCard label="High value" value="2" detail="Escalated routing" />
        <StatCard label="Operational" value="2" detail="Returns and deliveries" />
        <StatCard label="Finance" value="1" detail="Cash-up and payment controls" />
      </section>
      <div className="content-split">
        <TableShell
          title="Approval inbox"
          description="One queue for owners, value impact, branch scope, and due pressure."
          columns={[
            { key: 'request', label: 'Request' },
            { key: 'owner', label: 'Owner' },
            { key: 'impact', label: 'Impact' },
            { key: 'due', label: 'Due' },
            { key: 'branch', label: 'Branch' },
            { key: 'status', label: 'Status' }
          ]}
          rows={rows}
          actions={<button className="soft-button primary">Review queue</button>}
        />
        <ChecklistCard
          title="Approval model"
          items={[
            'Action-level security and approver chains stay visible from the beginning',
            'Branch scope is represented directly in the approval queue',
            'Later automation can notify approvers when thresholds are hit'
          ]}
        />
      </div>
    </div>
  );
}
