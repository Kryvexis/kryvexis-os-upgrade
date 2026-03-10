
import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { DataGrid, renderStatus } from '../components/DataGrid';
import { api } from '../lib/api';
import type { Invoice } from '../types';
export function InvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  useEffect(() => { api.invoices().then(setItems); }, []);
  return <Card title="Invoices" subtitle="Tax treatment, reminder state, and collections visibility."><DataGrid items={items} getHref={(item) => `/invoices/${item.id}`} columns={[{ key: 'id', header: 'Invoice', render: (item) => item.id },
          { key: 'customer', header: 'Customer', render: (item) => item.customer },
          { key: 'amount', header: 'Amount', render: (item) => item.amount },
          { key: 'status', header: 'Status', render: (item) => renderStatus(item.status) },
          { key: 'paymentStatus', header: 'Payment state', render: (item) => item.paymentStatus }]} /></Card>;
}
