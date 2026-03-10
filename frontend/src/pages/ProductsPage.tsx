
import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { DataGrid, renderStatus } from '../components/DataGrid';
import { api } from '../lib/api';
import type { Product } from '../types';
export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => { api.products().then(setItems); }, []);
  return <Card title="Products" subtitle="SKU, branch stock, reorder thresholds, supplier links, and movement context."><DataGrid items={items} getHref={(item) => `/products/${item.id}`} columns={[{ key: 'name', header: 'Product', render: (item) => item.name },
          { key: 'sku', header: 'SKU', render: (item) => item.sku },
          { key: 'stock', header: 'On hand', render: (item) => item.stock },
          { key: 'status', header: 'Status', render: (item) => renderStatus(item.status) },
          { key: 'nextAction', header: 'Next action', render: (item) => item.nextAction }]} /></Card>;
}
