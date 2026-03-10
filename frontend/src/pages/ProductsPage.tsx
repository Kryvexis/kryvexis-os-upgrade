import { DataTable } from '../components/DataTable';
import { Panel } from '../components/Panel';
import { RecordHero } from '../components/RecordHero';
import { StatusPill } from '../components/StatusPill';
import { products } from '../data/mock';

export function ProductsPage() {
  return (
    <div className="page-stack">
      <RecordHero title="Products" description="SKU, branch stock, reorder thresholds, and pricing foundations for Phase 1." actions={['Add product']} />
      <Panel title="Stock and pricing snapshot" action="Reorder candidates">
        <DataTable
          columns={['SKU', 'Name', 'Stock', 'Reorder at', 'Price', 'Health']}
          rows={products.map((product) => [
            product.sku,
            product.name,
            product.stock,
            product.reorderAt,
            product.price,
            <StatusPill value={product.stock <= product.reorderAt ? 'Low stock' : 'Healthy'} />
          ])}
        />
      </Panel>
    </div>
  );
}
