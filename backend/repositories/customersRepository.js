import { makeCoreRepository } from './coreRepository.js';
import { numberToMoney } from '../lib/format.js';

export function createCustomersRepository(pool) {
  const core = makeCoreRepository({ pool, table: 'customers' });

  function mapCustomer(row) {
    return {
      id: row.id || row.customer_code || row.code || row.name,
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
        left join customer_activity ca on ca.customer_id = coalesce(c.id, c.customer_code, c.code)
        group by coalesce(c.id, c.customer_code, c.code), c.name, c.owner, c.branch_id, c.status, c.balance, c.risk, c.credit_terms, c.price_list, c.contact_email, c.phone, c.notes, c.next_action, b.name
        order by coalesce(c.id, c.customer_code, c.code)
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
        left join customer_activity ca on ca.customer_id = coalesce(c.id, c.customer_code, c.code)
        where coalesce(c.id, c.customer_code, c.code) = $1
        group by coalesce(c.id, c.customer_code, c.code), c.name, c.owner, c.branch_id, c.status, c.balance, c.risk, c.credit_terms, c.price_list, c.contact_email, c.phone, c.notes, c.next_action, b.name
      `, [id]);
      return result.rows[0] ? mapCustomer(result.rows[0]) : null;
    }
  };
}
