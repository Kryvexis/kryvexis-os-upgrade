import { DataTable } from '../components/DataTable';
import { Panel } from '../components/Panel';
import { RecordHero } from '../components/RecordHero';
import { StatusPill } from '../components/StatusPill';
import { invoices } from '../data/mock';

export function InvoicesPage() {
  return (
    <div className="page-stack">
      <RecordHero title="Invoices" description="Issued, overdue, and paid invoice records with branch and due-state visibility." actions={['Issue invoice', 'Send statements']} />
      <Panel title="Receivables register" action="Collections pack">
        <DataTable
          columns={['Invoice', 'Customer', 'Amount', 'Due', 'Status', 'Branch']}
          rows={invoices.map((invoice) => [invoice.id, invoice.customer, invoice.amount, invoice.due, <StatusPill value={invoice.status} />, invoice.branch])}
        />
      </Panel>
    </div>
  );
}
