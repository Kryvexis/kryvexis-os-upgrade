import { makeCoreRepository } from './coreRepository.js';

export function createSuppliersRepository(pool) {
  const core = makeCoreRepository({ pool, table: 'suppliers' });
  const mapSupplier = (row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    leadTime: row.lead_time,
    status: row.status,
    contact: row.contact_email,
    nextAction: row.next_action
  });

  return {
    ...core,
    async listView() {
      const result = await pool.query('select * from suppliers order by id');
      return result.rows.map(mapSupplier);
    },
    async detail(id) {
      const result = await pool.query('select * from suppliers where id = $1 limit 1', [id]);
      return result.rows[0] ? mapSupplier(result.rows[0]) : null;
    }
  };
}
