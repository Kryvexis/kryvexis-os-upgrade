import { numberToMoney } from '../lib/format.js';

export function createInvoicesRepository(pool) {
  const mapInvoice = (row) => ({
    id: row.id,
    customerId: row.customer_id,
    customer: row.customer_name,
    amount: numberToMoney(row.amount),
    branch: row.branch_name || row.branch_id,
    status: row.status,
    due: row.due_label,
    source: row.source_quote_id,
    paymentStatus: row.payment_status,
    tax: row.tax_label,
    reminders: row.reminders,
    nextAction: row.next_action
  });

  return {
    async listView() {
      const result = await pool.query(`
        select i.*, b.name as branch_name
        from invoices i
        left join branches b on b.id = i.branch_id
        order by i.id desc
      `);
      return result.rows.map(mapInvoice);
    },
    async detail(id) {
      const result = await pool.query(`
        select i.*, b.name as branch_name
        from invoices i
        left join branches b on b.id = i.branch_id
        where i.id = $1
        limit 1
      `, [id]);
      return result.rows[0] ? mapInvoice(result.rows[0]) : null;
    },
    async findBySourceQuote(sourceQuoteId) {
      const result = await pool.query('select * from invoices where source_quote_id = $1 limit 1', [sourceQuoteId]);
      return result.rows[0] || null;
    },
    async createFromQuote(invoice) {
      const result = await pool.query(`
        insert into invoices (
          id, customer_id, customer_name, amount, branch_id, status, due_label, source_quote_id,
          payment_status, tax_label, reminders, next_action, due_in_days
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        returning *
      `, [
        invoice.id, invoice.customer_id, invoice.customer_name, invoice.amount, invoice.branch_id, invoice.status,
        invoice.due_label, invoice.source_quote_id, invoice.payment_status, invoice.tax_label,
        invoice.reminders, invoice.next_action, invoice.due_in_days
      ]);
      return result.rows[0];
    },
    async updateReminder(id, reminders, nextAction) {
      const result = await pool.query(`
        update invoices
        set reminders = $2, next_action = $3, updated_at = now()
        where id = $1
        returning *
      `, [id, reminders, nextAction]);
      return result.rows[0] || null;
    },
    async markPaymentAllocated(id, paymentRef) {
      const result = await pool.query(`
        update invoices
        set payment_status = 'Allocated receipt',
            status = case when status = 'Overdue' then 'Collections in progress' else status end,
            next_action = $2,
            updated_at = now()
        where id = $1
        returning *
      `, [id, `Payment ${paymentRef} allocated`]);
      return result.rows[0] || null;
    },
    mapInvoice
  };
}
