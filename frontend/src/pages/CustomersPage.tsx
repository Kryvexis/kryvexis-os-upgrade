import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { DataGrid, renderStatus } from '../components/DataGrid';
import { api } from '../lib/api';
import type { Customer } from '../types';

const fallback: Customer[] = [
  { id: 'CUS-001', name: 'Acme Retail Group', owner: 'Alex Morgan', branch: 'Johannesburg', status: 'Needs follow-up', balance: 'R27,400', risk: 'Medium', creditTerms: '30 days', priceList: 'Retail', contact: 'accounts@acme.com', phone: '+27 11 555 0100', notes: '', nextAction: 'Statement due', activity: [] },
  { id: 'CUS-002', name: 'Northline Foods', owner: 'Rina Patel', branch: 'Cape Town', status: 'Healthy', balance: 'R8,920', risk: 'Low', creditTerms: '30 days', priceList: 'Retail', contact: 'finance@northline.com', phone: '+27 21 555 0110', notes: '', nextAction: 'Follow-up Friday', activity: [] }
];

export function CustomersPage() {
  const [items, setItems] = useState<Customer[]>(fallback);
  useEffect(() => { api.customers().then(setItems).catch(() => setItems(fallback)); }, []);
  return (
    <Card title="Customers" subtitle="Master accounts, credit terms, communication signals, and next actions.">
      <DataGrid
        items={items}
        getHref={(item) => `/customers/${item.id}`}
        columns={[
          { key: 'name', header: 'Customer', render: (item) => item.name },
          { key: 'branch', header: 'Branch', render: (item) => item.branch },
          { key: 'balance', header: 'Balance', render: (item) => item.balance },
          { key: 'status', header: 'Status', render: (item) => renderStatus(item.status) },
          { key: 'nextAction', header: 'Next action', render: (item) => item.nextAction }
        ]}
      />
    </Card>
  );
}
