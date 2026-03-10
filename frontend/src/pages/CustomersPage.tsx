import { DataTable } from '../components/DataTable';
import { Panel } from '../components/Panel';
import { RecordHero } from '../components/RecordHero';
import { StatusPill } from '../components/StatusPill';
import { customers } from '../data/mock';

export function CustomersPage() {
  return (
    <div className="page-stack">
      <RecordHero title="Customers" description="Master account health, branch context, balance exposure, and latest actions in one place." actions={['New customer']} />
      <Panel title="Customer ledger overview" action="Export">
        <DataTable
          columns={['Customer', 'Branch', 'Balance', 'Status', 'Risk', 'Latest action']}
          rows={customers.map((customer) => [
            <div><strong>{customer.name}</strong><div className="muted small">{customer.id}</div></div>,
            customer.branch,
            customer.balance,
            <StatusPill value={customer.status} />,
            customer.risk,
            customer.lastAction
          ])}
        />
      </Panel>
    </div>
  );
}
