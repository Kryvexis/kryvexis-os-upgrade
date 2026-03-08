import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { StatCard } from '../components/StatCard';
import { TableShell } from '../components/TableShell';

export function CustomersPage() {
  const rows = [
    { id: '1', customer: 'Aether Group', status: 'Active', balance: 'R 24,500', rep: 'Antonie' },
    { id: '2', customer: 'Northline Stores', status: 'Review', balance: 'R 8,200', rep: 'Maya' },
    { id: '3', customer: 'BluePeak Foods', status: 'Good', balance: 'R 0', rep: 'Chris' }
  ];

  return (
    <div className="page-stack">
      <PageHeader title="Customers" description="Customer profiles, balances, recent activity, and commercial health." actions={<button className="soft-button primary">New customer</button>} />
      <section className="stats-grid compact">
        <StatCard label="Customers" value="248" detail="Active accounts" />
        <StatCard label="At Risk" value="14" detail="Need follow-up" />
        <StatCard label="Outstanding" value="R 91,240" detail="Open balances" />
      </section>
      <div className="content-split">
        <TableShell
          title="Customer directory"
          description="Starter list view for customer account management."
          columns={[
            { key: 'customer', label: 'Customer' },
            { key: 'status', label: 'Status' },
            { key: 'balance', label: 'Balance' },
            { key: 'rep', label: 'Owner' }
          ]}
          rows={rows}
        />
        <PanelCard title="Profile page next">
          <ul className="clean-list">
            <li>Summary hero with balance and payment behaviour</li>
            <li>Quotes, invoices, and statement tabs</li>
            <li>Activity timeline and internal notes</li>
            <li>Credit control and approval hooks</li>
          </ul>
        </PanelCard>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const rows = [
    { id: '1', product: 'KX-100 Router', stock: '84', location: 'Main / Cape Town', reorder: '40' },
    { id: '2', product: 'KX-200 Access Point', stock: '19', location: 'Main', reorder: '25' },
    { id: '3', product: 'KX-500 Switch', stock: '42', location: 'Main / JHB', reorder: '18' }
  ];
  return (
    <div className="page-stack">
      <PageHeader title="Products" description="Catalog, stock posture, pricing signals, and supplier linkage." actions={<button className="soft-button primary">Add product</button>} />
      <section className="stats-grid compact">
        <StatCard label="Products" value="1,284" detail="Tracked SKUs" />
        <StatCard label="Low stock" value="12" detail="Need action" />
        <StatCard label="Incoming" value="87" detail="Units expected" />
      </section>
      <TableShell
        title="Product control"
        description="Starter inventory table shell for search, filters, and future saved views."
        columns={[
          { key: 'product', label: 'Product' },
          { key: 'stock', label: 'On hand' },
          { key: 'location', label: 'Location' },
          { key: 'reorder', label: 'Reorder point' }
        ]}
        rows={rows}
        actions={<button className="soft-button">Export view</button>}
      />
    </div>
  );
}

export function QuotesPage() {
  const rows = [
    { id: '1', quote: 'QT-1008', customer: 'Aether Group', amount: 'R 18,200', stage: 'Awaiting approval' },
    { id: '2', quote: 'QT-1009', customer: 'BluePeak Foods', amount: 'R 6,480', stage: 'Sent' },
    { id: '3', quote: 'QT-1010', customer: 'Northline Stores', amount: 'R 11,240', stage: 'Draft' }
  ];
  return (
    <div className="page-stack">
      <PageHeader title="Quotes" description="Commercial pipeline and discount approvals in one place." actions={<button className="soft-button primary">Create quote</button>} />
      <TableShell
        title="Quote pipeline"
        description="Ready for conversion flow into orders and invoices."
        columns={[
          { key: 'quote', label: 'Quote' },
          { key: 'customer', label: 'Customer' },
          { key: 'amount', label: 'Amount' },
          { key: 'stage', label: 'Stage' }
        ]}
        rows={rows}
      />
    </div>
  );
}

export function InvoicesPage() {
  const rows = [
    { id: '1', invoice: 'INV-1042', customer: 'Aether Group', due: '2026-03-12', status: 'Paid' },
    { id: '2', invoice: 'INV-1049', customer: 'Northline Stores', due: '2026-03-15', status: 'Overdue' },
    { id: '3', invoice: 'INV-1052', customer: 'BluePeak Foods', due: '2026-03-18', status: 'Open' }
  ];
  return (
    <div className="page-stack">
      <PageHeader title="Invoices" description="Billing, collections, statements, and payment readiness." actions={<button className="soft-button primary">Issue invoice</button>} />
      <TableShell
        title="Invoice control"
        description="Starter debtors view with room for filters, statements, and payment actions."
        columns={[
          { key: 'invoice', label: 'Invoice' },
          { key: 'customer', label: 'Customer' },
          { key: 'due', label: 'Due date' },
          { key: 'status', label: 'Status' }
        ]}
        rows={rows}
      />
    </div>
  );
}

export function PurchaseOrdersPage() {
  const rows = [
    { id: '1', po: 'PO-2031', supplier: 'Nexa Supply', received: 'Partial', bill: 'Awaiting match' },
    { id: '2', po: 'PO-2034', supplier: 'Vertex Trade', received: 'Not received', bill: 'Not billed' },
    { id: '3', po: 'PO-2037', supplier: 'Alpha Industrial', received: 'Received', bill: 'Matched' }
  ];
  return (
    <div className="page-stack">
      <PageHeader title="Purchase Orders" description="Supplier purchasing, goods received, and bill matching control." actions={<button className="soft-button primary">New PO</button>} />
      <div className="content-split">
        <TableShell
          title="Purchase order queue"
          description="Starter procurement list with receiving and matching states."
          columns={[
            { key: 'po', label: 'PO' },
            { key: 'supplier', label: 'Supplier' },
            { key: 'received', label: 'Receiving' },
            { key: 'bill', label: 'Billing' }
          ]}
          rows={rows}
        />
        <PanelCard title="PO detail page next">
          <ul className="clean-list">
            <li>Supplier summary and approval history</li>
            <li>Line items with ordered vs received values</li>
            <li>GRN links and supplier bill matching</li>
            <li>Attachments, notes, and internal timeline</li>
          </ul>
        </PanelCard>
      </div>
    </div>
  );
}

export function ApprovalsPage() {
  const rows = [
    { id: '1', request: 'Discount override', owner: 'Sales', impact: 'R 1,240', due: 'Today' },
    { id: '2', request: 'Purchase order PO-2034', owner: 'Procurement', impact: 'R 18,900', due: 'Today' },
    { id: '3', request: 'Customer return CN-221', owner: 'Operations', impact: 'R 3,600', due: 'Tomorrow' }
  ];
  return (
    <div className="page-stack">
      <PageHeader title="Approvals" description="One queue for decisions across sales, procurement, finance, and operations." actions={<button className="soft-button">Approval policy</button>} />
      <TableShell
        title="Approval inbox"
        description="Ready for approve, reject, and request changes actions in a later pass."
        columns={[
          { key: 'request', label: 'Request' },
          { key: 'owner', label: 'Owner' },
          { key: 'impact', label: 'Impact' },
          { key: 'due', label: 'Due' }
        ]}
        rows={rows}
        actions={<button className="soft-button primary">Review queue</button>}
      />
    </div>
  );
}
