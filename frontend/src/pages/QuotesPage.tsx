import { DataTable } from '../components/DataTable';
import { Panel } from '../components/Panel';
import { RecordHero } from '../components/RecordHero';
import { StatusPill } from '../components/StatusPill';
import { quotes } from '../data/mock';

export function QuotesPage() {
  return (
    <div className="page-stack">
      <RecordHero title="Quotes" description="Draft, approval, send, and conversion visibility with owner and timeline context." actions={['New quote', 'Approval rules']} />
      <Panel title="Sales pipeline" action="Board view">
        <DataTable
          columns={['Quote', 'Customer', 'Value', 'Owner', 'Status', 'Updated']}
          rows={quotes.map((quote) => [quote.id, quote.customer, quote.value, quote.owner, <StatusPill value={quote.status} />, quote.updated])}
        />
      </Panel>
    </div>
  );
}
