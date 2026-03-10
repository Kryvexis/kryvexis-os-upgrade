
import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { DataGrid, renderStatus } from '../components/DataGrid';
import { api } from '../lib/api';
import type { Quote } from '../types';
export function QuotesPage() {
  const [items, setItems] = useState<Quote[]>([]);
  useEffect(() => { api.quotes().then(setItems); }, []);
  return <Card title="Quotes" subtitle="Validity, approval triggers, owners, and conversion-oriented follow-up."><DataGrid items={items} getHref={(item) => `/quotes/${item.id}`} columns={[{ key: 'id', header: 'Quote', render: (item) => item.id },
          { key: 'customer', header: 'Customer', render: (item) => item.customer },
          { key: 'value', header: 'Value', render: (item) => item.value },
          { key: 'status', header: 'Status', render: (item) => renderStatus(item.status) },
          { key: 'nextAction', header: 'Next action', render: (item) => item.nextAction }]} /></Card>;
}
