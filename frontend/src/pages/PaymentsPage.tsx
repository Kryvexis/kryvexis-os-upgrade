
import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { DataGrid, renderStatus } from '../components/DataGrid';
import { api } from '../lib/api';
import type { Payment } from '../types';
export function PaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  useEffect(() => { api.payments().then(setItems); }, []);
  return <Card title="Payments" subtitle="Receipts, proofs, allocation state, and payment handling foundations."><DataGrid items={items} getHref={(item) => `/payments/${item.id}`} columns={[{ key: 'ref', header: 'Payment', render: (item) => item.ref },
          { key: 'party', header: 'Party', render: (item) => item.party },
          { key: 'amount', header: 'Amount', render: (item) => item.amount },
          { key: 'status', header: 'Status', render: (item) => renderStatus(item.status) },
          { key: 'nextAction', header: 'Next action', render: (item) => item.nextAction }]} /></Card>;
}
