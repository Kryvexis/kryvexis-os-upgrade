
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { RecordTimeline } from '../components/RecordTimeline';
import { api } from '../lib/api';
import type { Product } from '../types';
export function ProductDetailPage() {
  const { id = '' } = useParams();
  const [item, setItem] = useState<Product | null>(null);
  useEffect(() => { api.product(id).then(setItem); }, [id]);
  if (!item) return <div className="loading-state">Loading record...</div>;
  return <div className="record-layout"><Card className="record-hero"><div className="record-head"><div><p className="eyebrow">Product master</p><h2>item.name</h2></div><Badge value={item.status} /></div><div className="record-meta"><div><span>SKU</span><strong>{item.sku}</strong></div><div><span>Branch</span><strong>{item.branch}</strong></div><div><span>On hand</span><strong>{String(item.stock)}</strong></div><div><span>Reorder at</span><strong>{String(item.reorderAt)}</strong></div><div><span>Price</span><strong>{item.price}</strong></div></div></Card><div className="split-grid"><Card title="Record context" subtitle="Status, owner, next action, and audit-friendly field visibility."><div className="detail-stack"><div><span>Cost</span><strong>{item.cost}</strong></div><div><span>Supplier</span><strong>{item.supplier}</strong></div><div><span>Barcode</span><strong>{item.barcode}</strong></div><div><span>Variants</span><strong>{item.variants}</strong></div><div><span>Next action</span><strong>{item.nextAction}</strong></div></div></Card><Card title="Activity and collaboration" subtitle="Timeline, notes, and the foundation for in-context threads."><RecordTimeline items=[item.movementSummary, `Supplier: ${item.supplier}`, `Next action: ${item.nextAction}`] /></Card></div></div>;
}
