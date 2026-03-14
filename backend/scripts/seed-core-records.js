import { pool, SQL_ENABLED, runMigrations } from '../lib/db.js';
import { moneyToNumber, parseRelativeDue } from '../lib/format.js';

const roles = [
  { key: 'admin', label: 'Admin', description: 'Full platform visibility, settings, templates, automation rules, user management, audit access.', dashboards: ['system activity', 'approvals', 'branch health', 'audit highlights'] },
  { key: 'sales', label: 'Sales', description: 'Customers, quotes, invoices, statements, selected reports.', dashboards: ['quotes awaiting action', 'invoices due', 'customer balances', 'personal targets'] },
  { key: 'finance', label: 'Finance', description: 'Payments, debtors, creditors, statements, expenses, cash up.', dashboards: ['debtor aging', 'receipts today', 'overdue accounts', 'cash-up alerts'] },
  { key: 'warehouse', label: 'Warehouse', description: 'Stock, movements, transfers, low stock, goods received.', dashboards: ['low stock', 'pending transfers', 'awaiting receipt', 'delivery queue'] },
  { key: 'procurement', label: 'Procurement', description: 'Suppliers, purchase orders, reorders, supplier bills.', dashboards: ['reorder candidates', 'pending POs', 'late suppliers', 'unmatched supplier bills'] },
  { key: 'operations', label: 'Operations', description: 'Deliveries, returns, tasks, approvals, operational dashboards.', dashboards: ['open deliveries', 'returns pending', 'tasks due', 'dispatch exceptions'] },
  { key: 'manager', label: 'Manager', description: 'Branch leadership with reports, day close, staffing oversight, and branch performance.', dashboards: ['branch sales', 'cash-up status', 'daily target', 'exceptions'] },
  { key: 'executive', label: 'Executive', description: 'Cross-module dashboards, approvals, reports, branch-specific controls.', dashboards: ['branch performance', 'exceptions', 'approvals', 'growth indicators'] }
];

const branches = [
  { id: 'JHB', name: 'Johannesburg', manager_name: 'Antonie Meyer', manager_email: 'kryvexissolutions@gmail.com' },
  { id: 'CPT', name: 'Cape Town', manager_name: 'Alex Morgan', manager_email: 'capetown@kryvexis.local' },
  { id: 'DBN', name: 'Durban', manager_name: 'Tariq Naidoo', manager_email: 'durban@kryvexis.local' }
];

const customers = [
  { id: 'CUS-001', name: 'Acme Retail Group', owner: 'Rina Patel', branch: 'Johannesburg', status: 'Needs follow-up', balance: 'R27,400', risk: 'Medium', creditTerms: '30 days', priceList: 'Wholesale A', contact: 'accounts@acmeretail.co.za', phone: '+27 11 555 0144', notes: 'Payment discipline improved after the February reminder cycle.', nextAction: 'Call finance contact tomorrow', activity: ['Statement sent 2h ago', 'Invoice INV-2201 marked overdue', 'Sales follow-up scheduled for tomorrow'] },
  { id: 'CUS-002', name: 'Northline Foods', owner: 'Alex Morgan', branch: 'Cape Town', status: 'Healthy', balance: 'R8,920', risk: 'Low', creditTerms: '14 days', priceList: 'Hospitality', contact: 'payables@northlinefoods.co.za', phone: '+27 21 555 0198', notes: 'High repeat order volume and fast payment turnaround.', nextAction: 'Review March target expansion', activity: ['Invoice paid today', 'New quote requested for refrigerated stock labels'] },
  { id: 'CUS-003', name: 'Urban Build Supply', owner: 'Tariq Naidoo', branch: 'Durban', status: 'Approval watch', balance: 'R61,800', risk: 'Medium', creditTerms: '45 days', priceList: 'Construction', contact: 'ops@urbanbuild.co.za', phone: '+27 31 555 0112', notes: 'High-value quote pending approval threshold.', nextAction: 'Escalate quote approval', activity: ['Quote Q-1045 pending approval', 'Commercial terms updated yesterday'] }
];

const suppliers = [
  { id: 'SUP-001', name: 'Prime Devices', category: 'Hardware', leadTime: '5 days', status: 'On track', contact: 'orders@primedevices.co.za', nextAction: 'Release next scanner dock PO' },
  { id: 'SUP-002', name: 'Cape Paper Supply', category: 'Consumables', leadTime: '3 days', status: 'Attention', contact: 'dispatch@capepaper.co.za', nextAction: 'Confirm thermal roll replenishment' },
  { id: 'SUP-003', name: 'Metro Warehouse Goods', category: 'Warehouse', leadTime: '7 days', status: 'On track', contact: 'supply@metrowarehouse.co.za', nextAction: 'Review dock accessory pricing' }
];

const products = [
  { id: 'PRD-1001', sku: 'SKU-1001', name: 'Kryvexis Label Printer', branch: 'Johannesburg', status: 'Healthy', stock: 14, reorderAt: 10, price: 'R2,499', cost: 'R1,620', supplier: 'SUP-001', barcode: '6001001001001', variants: 'Standard / Black', movementSummary: '2 units sold today', nextAction: 'Review reorder coverage next week' },
  { id: 'PRD-1021', sku: 'SKU-1021', name: 'Thermal Roll Box', branch: 'Cape Town', status: 'Low stock', stock: 8, reorderAt: 12, price: 'R380', cost: 'R210', supplier: 'SUP-002', barcode: '6001001001021', variants: '80mm / 24 pack', movementSummary: 'Threshold breached this morning', nextAction: 'Create reorder candidate in Phase 2' },
  { id: 'PRD-1033', sku: 'SKU-1033', name: 'Warehouse Scanner Dock', branch: 'Johannesburg', status: 'Healthy', stock: 21, reorderAt: 6, price: 'R1,290', cost: 'R790', supplier: 'SUP-001', barcode: '6001001001033', variants: 'USB-C', movementSummary: 'No movement today', nextAction: 'Monitor top mover trend' }
];

const quotes = [
  { id: 'Q-1045', customerId: 'CUS-003', customer: 'Urban Build Supply', owner: 'Alex Morgan', value: 'R62,500', status: 'Pending approval', validity: '2026-03-17', branch: 'Durban', trigger: 'High-value threshold', updated: '22 min ago', notes: 'Requires sales manager approval before sending.', nextAction: 'Finance review at 09:00 tomorrow', subtotal: 'R54,347.83', tax: 'R8,152.17', total: 'R62,500', marginBand: 'Protected margin', approvalOwner: 'Sales Manager', lines: [ { id: 'QL-1', sku: 'SKU-1001', description: 'Kryvexis Label Printer', qty: 12, unitPrice: 'R2,499', total: 'R29,988' }, { id: 'QL-2', sku: 'SKU-1021', description: 'Thermal Roll Box', qty: 45, unitPrice: 'R380', total: 'R17,100' }, { id: 'QL-3', sku: 'SKU-1033', description: 'Warehouse Scanner Dock', qty: 12, unitPrice: 'R1,290', total: 'R15,480' } ], workflow: [ { label: 'Drafted', detail: 'Quote created by Alex Morgan at 08:12 today' }, { label: 'Margin review', detail: 'Protected margin confirmed on scanner dock bundle' }, { label: 'Approval hold', detail: 'High-value threshold requires manager approval before sending' }, { label: 'Next step', detail: 'Convert to invoice draft after approval and customer acceptance' } ] },
  { id: 'Q-1042', customerId: 'CUS-001', customer: 'Acme Retail Group', owner: 'Rina Patel', value: 'R18,960', status: 'Sent to customer', validity: '2026-03-15', branch: 'Johannesburg', trigger: 'None', updated: '1 hour ago', notes: 'Bundle pricing applied.', nextAction: 'Await customer response', subtotal: 'R16,486.96', tax: 'R2,473.04', total: 'R18,960', marginBand: 'Standard margin', approvalOwner: 'Not required', lines: [ { id: 'QL-4', sku: 'SKU-1001', description: 'Kryvexis Label Printer', qty: 4, unitPrice: 'R2,499', total: 'R9,996' }, { id: 'QL-5', sku: 'SKU-1021', description: 'Thermal Roll Box', qty: 12, unitPrice: 'R380', total: 'R4,560' }, { id: 'QL-6', sku: 'SKU-1033', description: 'Warehouse Scanner Dock', qty: 3, unitPrice: 'R1,290', total: 'R3,870' } ], workflow: [ { label: 'Drafted', detail: 'Sales owner prepared the quote this morning' }, { label: 'Sent', detail: 'Customer received the quote and email audit logged delivery' }, { label: 'Next step', detail: 'Watch for acceptance and convert to invoice if approved' } ] },
  { id: 'Q-1039', customerId: 'CUS-002', customer: 'Northline Foods', owner: 'Alex Morgan', value: 'R9,880', status: 'Draft', validity: '2026-03-20', branch: 'Cape Town', trigger: 'Margin review', updated: 'Today 08:42', notes: 'Need final confirmation on line quantities.', nextAction: 'Finish internal note check', subtotal: 'R8,591.30', tax: 'R1,288.70', total: 'R9,880', marginBand: 'Review required', approvalOwner: 'Sales Lead', lines: [ { id: 'QL-7', sku: 'SKU-1021', description: 'Thermal Roll Box', qty: 20, unitPrice: 'R380', total: 'R7,600' }, { id: 'QL-8', sku: 'SKU-1033', description: 'Warehouse Scanner Dock', qty: 2, unitPrice: 'R1,140', total: 'R2,280' } ], workflow: [ { label: 'Drafted', detail: 'Line quantities captured for Northline Foods expansion' }, { label: 'Review', detail: 'Waiting for internal check before customer send' } ] }
];

const invoices = [
  { id: 'INV-2201', customerId: 'CUS-001', customer: 'Acme Retail Group', amount: 'R12,440', branch: 'Johannesburg', status: 'Overdue', due: 'Due today', source: 'Q-1042', paymentStatus: 'Partially paid', tax: 'VAT standard', reminders: 'First reminder sent', nextAction: 'Finance follow-up call' },
  { id: 'INV-2196', customerId: 'CUS-002', customer: 'Northline Foods', amount: 'R4,980', branch: 'Cape Town', status: 'Issued', due: 'Due in 2 days', source: 'Direct invoice', paymentStatus: 'Unpaid', tax: 'VAT standard', reminders: 'Not started', nextAction: 'Await due date' },
  { id: 'INV-2188', customerId: 'CUS-003', customer: 'Urban Build Supply', amount: 'R33,240', branch: 'Durban', status: 'Collections in progress', due: 'Overdue by 6 days', source: 'Q-1032', paymentStatus: 'Awaiting proof', tax: 'VAT standard', reminders: 'Escalated', nextAction: 'Follow up with buyer and finance team' }
];

const payments = [
  { id: 'PAY-7001', customerId: 'CUS-001', party: 'Acme Retail Group', amount: 'R7,000', branch: 'Johannesburg', status: 'Ready to allocate', method: 'EFT', ref: 'ACME-7001', proof: 'Attached and verified', appliedTo: 'INV-2201', nextAction: 'Allocate to invoice' },
  { id: 'PAY-6998', customerId: 'CUS-003', party: 'Urban Build Supply', amount: 'R12,000', branch: 'Durban', status: 'Unallocated', method: 'Cash deposit', ref: 'UBS-6998', proof: 'Missing proof', appliedTo: 'To be assigned', nextAction: 'Request payment proof' },
  { id: 'PAY-6992', customerId: 'CUS-002', party: 'Northline Foods', amount: 'R4,980', branch: 'Cape Town', status: 'Allocated', method: 'Card', ref: 'NFL-6992', proof: 'Attached and verified', appliedTo: 'INV-2196', nextAction: 'Allocation complete' }
];

function branchIdByName(name) {
  return branches.find((entry) => entry.name === name)?.id || null;
}

async function getTableColumns(tableName) {
  const result = await pool.query(
    `select column_name from information_schema.columns where table_schema = 'public' and table_name = $1`,
    [tableName]
  );
  return new Set(result.rows.map((row) => row.column_name));
}

async function upsertSeedOrganization() {
  const columns = await getTableColumns('organizations');
  const values = { id: 'ORG-1' };
  if (columns.has('name')) values.name = 'Kryvexis';
  if (columns.has('legal_name')) values.legal_name = 'Kryvexis';
  if (columns.has('trading_name')) values.trading_name = 'Kryvexis';
  if (columns.has('country_code')) values.country_code = 'ZA';
  if (columns.has('currency_code')) values.currency_code = 'ZAR';

  const keys = Object.keys(values);
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
  const updates = keys.filter((key) => key !== 'id').map((key) => `${key} = excluded.${key}`).join(', ');

  await pool.query(
    `insert into organizations (${keys.join(', ')}) values (${placeholders}) on conflict (id) do update set ${updates || 'id = excluded.id'}`,
    keys.map((key) => values[key])
  );
}

async function upsertSeedBranches() {
  const columns = await getTableColumns('branches');
  for (const branch of branches) {
    const seed = {
      id: branch.id,
      organization_id: 'ORG-1',
      code: branch.id,
      name: branch.name,
      manager_name: branch.manager_name,
      manager_email: branch.manager_email,
      city: branch.name,
      is_active: true
    };
    const values = Object.fromEntries(Object.entries(seed).filter(([key]) => columns.has(key)));
    const keys = Object.keys(values);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const updates = keys.filter((key) => key !== 'id').map((key) => `${key} = excluded.${key}`).join(', ');

    await pool.query(
      `insert into branches (${keys.join(', ')}) values (${placeholders}) on conflict (id) do update set ${updates || 'id = excluded.id'}`,
      keys.map((key) => values[key])
    );
  }
}

async function seed() {
  if (!SQL_ENABLED || !pool) throw new Error('SQL mode is not enabled');
  await runMigrations();

  await upsertSeedOrganization();
  await upsertSeedBranches();

  for (const role of roles) {
    await pool.query(`insert into roles (key, label, description, dashboards)
      values ($1, $2, $3, $4::jsonb)
      on conflict (key) do update set label = excluded.label, description = excluded.description, dashboards = excluded.dashboards`,
      [role.key, role.label, role.description, JSON.stringify(role.dashboards)]);
  }

  for (const customer of customers) {
    await pool.query(`insert into customers
      (id, name, owner, branch_id, status, balance, risk, credit_terms, price_list, contact_email, phone, notes, next_action)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      on conflict (id) do update set
        name = excluded.name, owner = excluded.owner, branch_id = excluded.branch_id, status = excluded.status,
        balance = excluded.balance, risk = excluded.risk, credit_terms = excluded.credit_terms, price_list = excluded.price_list,
        contact_email = excluded.contact_email, phone = excluded.phone, notes = excluded.notes, next_action = excluded.next_action,
        updated_at = now()`,
      [customer.id, customer.name, customer.owner, branchIdByName(customer.branch), customer.status, moneyToNumber(customer.balance), customer.risk, customer.creditTerms, customer.priceList, customer.contact, customer.phone, customer.notes, customer.nextAction]);
    await pool.query('delete from customer_activity where customer_id = $1', [customer.id]);
    for (const activity of customer.activity) {
      await pool.query('insert into customer_activity (customer_id, activity_text) values ($1, $2)', [customer.id, activity]);
    }
  }

  for (const supplier of suppliers) {
    await pool.query(`insert into suppliers (id, name, category, lead_time, status, contact_email, next_action)
      values ($1,$2,$3,$4,$5,$6,$7)
      on conflict (id) do update set name = excluded.name, category = excluded.category, lead_time = excluded.lead_time,
        status = excluded.status, contact_email = excluded.contact_email, next_action = excluded.next_action, updated_at = now()`,
      [supplier.id, supplier.name, supplier.category, supplier.leadTime, supplier.status, supplier.contact, supplier.nextAction]);
  }

  for (const product of products) {
    await pool.query(`insert into products
      (id, sku, name, branch_id, status, stock, reorder_at, price, cost, supplier_id, barcode, variants, movement_summary, next_action)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      on conflict (id) do update set sku = excluded.sku, name = excluded.name, branch_id = excluded.branch_id,
        status = excluded.status, stock = excluded.stock, reorder_at = excluded.reorder_at, price = excluded.price,
        cost = excluded.cost, supplier_id = excluded.supplier_id, barcode = excluded.barcode, variants = excluded.variants,
        movement_summary = excluded.movement_summary, next_action = excluded.next_action, updated_at = now()`,
      [product.id, product.sku, product.name, branchIdByName(product.branch), product.status, product.stock, product.reorderAt, moneyToNumber(product.price), moneyToNumber(product.cost), product.supplier, product.barcode, product.variants, product.movementSummary, product.nextAction]);
  }

  for (const quote of quotes) {
    await pool.query(`insert into quotes
      (id, customer_id, customer_name, owner, branch_id, value_total, status, validity_date, trigger_reason, updated_label, notes, next_action, subtotal, tax, margin_band, approval_owner)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      on conflict (id) do update set customer_id = excluded.customer_id, customer_name = excluded.customer_name, owner = excluded.owner,
        branch_id = excluded.branch_id, value_total = excluded.value_total, status = excluded.status, validity_date = excluded.validity_date,
        trigger_reason = excluded.trigger_reason, updated_label = excluded.updated_label, notes = excluded.notes,
        next_action = excluded.next_action, subtotal = excluded.subtotal, tax = excluded.tax, margin_band = excluded.margin_band,
        approval_owner = excluded.approval_owner, updated_at = now()`,
      [quote.id, quote.customerId, quote.customer, quote.owner, branchIdByName(quote.branch), moneyToNumber(quote.total), quote.status, quote.validity, quote.trigger, quote.updated, quote.notes, quote.nextAction, moneyToNumber(quote.subtotal), moneyToNumber(quote.tax), quote.marginBand, quote.approvalOwner]);
    await pool.query('delete from quote_lines where quote_id = $1', [quote.id]);
    await pool.query('delete from quote_workflow_events where quote_id = $1', [quote.id]);
    for (const line of quote.lines) {
      await pool.query('insert into quote_lines (id, quote_id, sku, description, qty, unit_price, total) values ($1,$2,$3,$4,$5,$6,$7)', [line.id, quote.id, line.sku, line.description, line.qty, moneyToNumber(line.unitPrice), moneyToNumber(line.total)]);
    }
    for (const event of quote.workflow) {
      await pool.query('insert into quote_workflow_events (quote_id, label, detail) values ($1,$2,$3)', [quote.id, event.label, event.detail]);
    }
  }

  for (const invoice of invoices) {
    await pool.query(`insert into invoices
      (id, customer_id, customer_name, amount, branch_id, status, due_label, source_quote_id, payment_status, tax_label, reminders, next_action, due_in_days)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      on conflict (id) do update set customer_id = excluded.customer_id, customer_name = excluded.customer_name,
        amount = excluded.amount, branch_id = excluded.branch_id, status = excluded.status, due_label = excluded.due_label,
        source_quote_id = excluded.source_quote_id, payment_status = excluded.payment_status, tax_label = excluded.tax_label,
        reminders = excluded.reminders, next_action = excluded.next_action, due_in_days = excluded.due_in_days, updated_at = now()`,
      [invoice.id, invoice.customerId, invoice.customer, moneyToNumber(invoice.amount), branchIdByName(invoice.branch), invoice.status, invoice.due, invoice.source, invoice.paymentStatus, invoice.tax, invoice.reminders, invoice.nextAction, parseRelativeDue(invoice.due)]);
  }

  for (const payment of payments) {
    await pool.query(`insert into payments
      (id, customer_id, party, amount, branch_id, status, method, ref, proof, applied_to, next_action)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      on conflict (id) do update set customer_id = excluded.customer_id, party = excluded.party, amount = excluded.amount,
        branch_id = excluded.branch_id, status = excluded.status, method = excluded.method, ref = excluded.ref,
        proof = excluded.proof, applied_to = excluded.applied_to, next_action = excluded.next_action, updated_at = now()`,
      [payment.id, payment.customerId, payment.party, moneyToNumber(payment.amount), branchIdByName(payment.branch), payment.status, payment.method, payment.ref, payment.proof, payment.appliedTo, payment.nextAction]);
  }

  console.log('Core records seeded successfully');
  await pool.end();
}

seed().catch(async (error) => {
  console.error('Seed failed', error);
  if (pool) await pool.end().catch(() => {});
  process.exit(1);
});
