import { numberToMoney } from '../lib/format.js';

export function createPaymentsRepository(pool) {
  const mapPayment = (row) => ({
    id: row.id,
    customerId: row.customer_id,
    party: row.party,
    amount: numberToMoney(row.amount),
    branch: row.branch_name || row.branch_id,
    status: row.status,
    method: row.method,
    ref: row.ref,
    proof: row.proof,
    appliedTo: row.applied_to,
    nextAction: row.next_action
  });

  return {
    async listView() {
      const result = await pool.query(`
        select p.*, b.name as branch_name
        from payments p
        left join branches b on b.id = p.branch_id
        order by p.id desc
      `);
      return result.rows.map(mapPayment);
    },
    async detail(id) {
      const result = await pool.query(`
        select p.*, b.name as branch_name
        from payments p
        left join branches b on b.id = p.branch_id
        where p.id = $1
        limit 1
      `, [id]);
      return result.rows[0] ? mapPayment(result.rows[0]) : null;
    },
    async updateProof(id, status, nextAction, proof) {
      const result = await pool.query(`
        update payments
        set proof = $2, status = $3, next_action = $4, updated_at = now()
        where id = $1
        returning *
      `, [id, proof, status, nextAction]);
      return result.rows[0] || null;
    },
    async allocate(id, invoiceId) {
      const result = await pool.query(`
        update payments
        set applied_to = $2, status = 'Allocated', next_action = 'Allocation complete', updated_at = now()
        where id = $1
        returning *
      `, [id, invoiceId]);
      return result.rows[0] || null;
    },
    mapPayment
  };
}
