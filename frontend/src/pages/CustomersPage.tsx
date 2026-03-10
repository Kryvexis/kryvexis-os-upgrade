
import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { DataGrid, renderStatus } from '../components/DataGrid';
import { api } from '../lib/api';
import type { Customer } from '../types';
export function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  useEffect(() => { api.customers().then(setItems); }, []);
  return <Card title="Customers" subtitle="Master accounts, credit terms, communication signals, and next actions."><DataGrid items={items} getHref={(item) => `/customers/${item.id}`} columns={[{ key: 'name', header: 'Customer', render: (item) => item.name },
          { key: 'branch', header: 'Branch', render: (item) => item.branch },
          { key: 'balance', header: 'Balance', render: (item) => item.balance },
          { key: 'status', header: 'Status', render: (item) => renderStatus(item.status) },
          { key: 'nextAction', header: 'Next action', render: (item) => item.nextAction }]} /></Card>;
}
