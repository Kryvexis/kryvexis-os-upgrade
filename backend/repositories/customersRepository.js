import { makeCoreRepository } from './coreRepository.js';
import { numberToMoney } from '../lib/format.js';

export function createCustomersRepository(pool) {
  const core = makeCoreRepository({ pool, table: 'customers' });

  function mapCustomer(row) {
    return {
      id: row.id,
      name: row.name,
      owner: row.owner,
      branch: row.branch_name || row.branch_id,
      status: row.status,
      balance: numberToMoney(row.balance),
      risk: row.risk,
      creditTerms: row.credit_terms,
      priceList: row.price_list,
      contact: row.contact_email,
      phone: row.phone,
      notes: row.notes,
      nextAction: row.next_action,
      activity: row.activity || []
    };
  }

  return {
    ...core,
    async listView() {
      const result = await pool.query(`
        select c.*, b.name as branch_name,
          coalesce(json_agg(ca.activity_text order by ca.created_at desc)
            filter (where ca.id is not null), '[]'::json) as activity
        from customers c
        left join branches b on b.id = c.branch_id
        left join customer_activity ca on ca.customer_id = c.id
        group by c.id, b.name
        order by c.id
      `);
      return result.rows.map(mapCustomer);
    },
    async detail(id) {
      const result = await pool.query(`
        select c.*, b.name as branch_name,
          coalesce(json_agg(ca.activity_text order by ca.created_at desc)
            filter (where ca.id is not null), '[]'::json) as activity
        from customers c
        left join branches b on b.id = c.branch_id
        left join customer_activity ca on ca.customer_id = c.id
        where c.id = $1
        group by c.id, b.name
      `, [id]);
      return result.rows[0] ? mapCustomer(result.rows[0]) : null;
    }
  };
}
