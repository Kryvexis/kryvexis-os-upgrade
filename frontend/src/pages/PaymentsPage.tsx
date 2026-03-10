import { DataTable } from '../components/DataTable';
import { Panel } from '../components/Panel';
import { RecordHero } from '../components/RecordHero';
import { StatusPill } from '../components/StatusPill';
import { payments } from '../data/mock';

export function PaymentsPage() {
  return (
    <div className="page-stack">
      <RecordHero title="Payments" description="Receipts, proof handling, allocation state, and manual payment support for EFT and cash." actions={['Capture payment']} />
      <Panel title="Payment register" action="Unallocated only">
        <DataTable
          columns={['Reference', 'Party', 'Amount', 'Method', 'Status', 'Date']}
          rows={payments.map((payment) => [payment.ref, payment.party, payment.amount, payment.method, <StatusPill value={payment.status} />, payment.date])}
        />
      </Panel>
    </div>
  );
}
