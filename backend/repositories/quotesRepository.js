import { numberToMoney } from '../lib/format.js';

export function createQuotesRepository(pool) {
  function mapQuote(row) {
    return {
      id: row.id,
      customerId: row.customer_id,
      customer: row.customer_name,
      owner: row.owner,
      value: numberToMoney(row.value_total),
      status: row.status,
      validity: row.validity_date,
      branch: row.branch_name || row.branch_id,
      trigger: row.trigger_reason,
      updated: row.updated_label,
      notes: row.notes,
      nextAction: row.next_action,
      subtotal: numberToMoney(row.subtotal),
      tax: numberToMoney(row.tax),
      total: numberToMoney(row.value_total),
      marginBand: row.margin_band,
      approvalOwner: row.approval_owner,
      lines: row.lines || [],
      workflow: row.workflow || []
    };
  }

  async function listView() {
    const result = await pool.query(`
      select q.*, b.name as branch_name
      from quotes q
      left join branches b on b.id = q.branch_id
      order by q.id desc
    `);
    return result.rows.map(mapQuote);
  }

  async function detail(id) {
    const quoteResult = await pool.query(`
      select q.*, b.name as branch_name
      from quotes q
      left join branches b on b.id = q.branch_id
      where q.id = $1
      limit 1
    `, [id]);
    const quote = quoteResult.rows[0];
    if (!quote) return null;
    const [lines, workflow] = await Promise.all([
      pool.query('select id, sku, description, qty, unit_price, total from quote_lines where quote_id = $1 order by id', [id]),
      pool.query('select label, detail from quote_workflow_events where quote_id = $1 order by created_at', [id])
    ]);
    quote.lines = lines.rows.map((row) => ({ ...row, unitPrice: numberToMoney(row.unit_price), total: numberToMoney(row.total) }));
    quote.workflow = workflow.rows;
    return mapQuote(quote);
  }

  async function updateStatus(id, status, nextAction, updatedLabel) {
    const result = await pool.query(`
      update quotes
      set status = $2, next_action = $3, updated_label = $4, updated_at = now()
      where id = $1
      returning *
    `, [id, status, nextAction, updatedLabel]);
    return result.rows[0] || null;
  }

  async function addWorkflowEvent(id, label, detail) {
    await pool.query('insert into quote_workflow_events (quote_id, label, detail) values ($1, $2, $3)', [id, label, detail]);
  }

  return { listView, detail, updateStatus, addWorkflowEvent };
}
