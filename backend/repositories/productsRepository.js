import { makeCoreRepository } from './coreRepository.js';
import { numberToMoney } from '../lib/format.js';

export function createProductsRepository(pool) {
  const core = makeCoreRepository({ pool, table: 'products' });
  const mapProduct = (row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    branch: row.branch_name || row.branch_id,
    status: row.status,
    stock: row.stock,
    reorderAt: row.reorder_at,
    price: numberToMoney(row.price),
    cost: numberToMoney(row.cost),
    supplier: row.supplier_name || row.supplier_id,
    barcode: row.barcode,
    variants: row.variants,
    movementSummary: row.movement_summary,
    nextAction: row.next_action
  });

  return {
    ...core,
    async listView() {
      const result = await pool.query(`
        select p.*, b.name as branch_name, s.name as supplier_name
        from products p
        left join branches b on b.id = p.branch_id
        left join suppliers s on s.id = p.supplier_id
        order by p.id
      `);
      return result.rows.map(mapProduct);
    },
    async detail(id) {
      const result = await pool.query(`
        select p.*, b.name as branch_name, s.name as supplier_name
        from products p
        left join branches b on b.id = p.branch_id
        left join suppliers s on s.id = p.supplier_id
        where p.id = $1
      `, [id]);
      return result.rows[0] ? mapProduct(result.rows[0]) : null;
    }
  };
}
