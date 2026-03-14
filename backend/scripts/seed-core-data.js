import { dbConfig, query } from '../src/lib/db.js';

const roles = [
  ['admin', 'Admin', 'Full platform visibility and control'],
  ['sales', 'Sales', 'Customers, quotes, invoices, statements'],
  ['finance', 'Finance', 'Payments, debtors, creditors, cash-up'],
  ['warehouse', 'Warehouse', 'Stock, transfers, goods received'],
  ['procurement', 'Procurement', 'Suppliers, purchase orders, reorders'],
  ['operations', 'Operations', 'Deliveries, returns, tasks, dispatch'],
  ['manager', 'Manager', 'Branch leadership and operational oversight'],
  ['executive', 'Executive', 'Cross-branch leadership and reporting']
];

const permissionCatalog = {
  admin: ['dashboard.view','customers.read','products.read','suppliers.read','quotes.read','quotes.write','quotes.approve','quotes.convert','invoices.read','invoices.write','payments.read','payments.allocate','payments.resolve','notifications.read','notifications.manage','reports.read','automation.manage','roles.read','settings.read','settings.write','users.read','users.manage'],
  executive: ['dashboard.view','customers.read','products.read','suppliers.read','quotes.read','invoices.read','payments.read','notifications.read','reports.read'],
  manager: ['dashboard.view','customers.read','products.read','suppliers.read','quotes.read','quotes.approve','quotes.convert','invoices.read','payments.read','payments.allocate','notifications.read','reports.read'],
  sales: ['dashboard.view','customers.read','quotes.read','quotes.write','quotes.convert','invoices.read','notifications.read'],
  finance: ['dashboard.view','customers.read','invoices.read','invoices.write','payments.read','payments.allocate','payments.resolve','notifications.read','reports.read'],
  warehouse: ['dashboard.view','products.read','notifications.read'],
  procurement: ['dashboard.view','products.read','suppliers.read','notifications.read'],
  operations: ['dashboard.view','notifications.read','reports.read']
};

async function main() {
  if (!dbConfig.enableSql) {
    throw new Error('USE_SQL_AUTOMATION=true and DATABASE_URL are required to seed data.');
  }

  await query(`insert into organizations (id, legal_name, trading_name)
    values ('ORG-KRYVEXIS', 'Kryvexis Solutions (Pty) Ltd', 'Kryvexis')
    on conflict (id) do update set trading_name = excluded.trading_name`);

  await query(`insert into branches (id, organization_id, code, name, city, manager_name, manager_email)
    values
      ('JHB', 'ORG-KRYVEXIS', 'JHB', 'Johannesburg', 'Johannesburg', 'Antonie Meyer', 'kryvexissolutions@gmail.com'),
      ('CPT', 'ORG-KRYVEXIS', 'CPT', 'Cape Town', 'Cape Town', 'Alex Morgan', 'alex@kryvexis.local'),
      ('DBN', 'ORG-KRYVEXIS', 'DBN', 'Durban', 'Durban', 'Tariq Naidoo', 'tariq@kryvexis.local')
    on conflict (id) do update set manager_name = excluded.manager_name, manager_email = excluded.manager_email`);

  for (const [key, label, description] of roles) {
    await query(`insert into roles (key, label, description) values ($1, $2, $3)
      on conflict (key) do update set label = excluded.label, description = excluded.description`, [key, label, description]);
  }

  for (const [roleKey, permissions] of Object.entries(permissionCatalog)) {
    for (const permission of permissions) {
      await query(`insert into permissions (role_key, permission_key) values ($1, $2) on conflict (role_key, permission_key) do nothing`, [roleKey, permission]);
    }
  }

  await query(`insert into app_users (role_key, full_name, email, branch_id)
    values
      ('admin', 'Antonie Meyer', 'kryvexissolutions@gmail.com', 'JHB'),
      ('manager', 'Nadine Smit', 'jhb.manager@kryvexis.local', 'JHB'),
      ('sales', 'Alex Morgan', 'alex@kryvexis.local', 'CPT'),
      ('finance', 'Rina Patel', 'rina@kryvexis.local', 'JHB'),
      ('operations', 'Tariq Naidoo', 'tariq@kryvexis.local', 'DBN')
    on conflict (email) do nothing`);

  await query(`insert into customers (id, name, owner, branch_id, status, balance, credit_terms_days, price_list, risk_level, contact_email, phone, notes)
    values
      ('CUS-001', 'Acme Retail Group', 'Rina Patel', 'JHB', 'Needs follow-up', 27400.00, 30, 'Wholesale A', 'Medium', 'accounts@acmeretail.co.za', '+27 11 555 0144', 'Payment discipline improved after the February reminder cycle.'),
      ('CUS-002', 'Northline Foods', 'Alex Morgan', 'CPT', 'Healthy', 8920.00, 14, 'Hospitality', 'Low', 'payables@northlinefoods.co.za', '+27 21 555 0198', 'High repeat order volume and fast payment turnaround.'),
      ('CUS-003', 'Urban Build Supply', 'Tariq Naidoo', 'DBN', 'Approval watch', 61800.00, 45, 'Construction', 'Medium', 'ops@urbanbuild.co.za', '+27 31 555 0112', 'High-value quote pending approval threshold.')
    on conflict (id) do nothing`);

  await query(`insert into suppliers (id, name, category, lead_time_days, status, contact_email)
    values
      ('SUP-001', 'Prime Devices', 'Hardware', 5, 'On track', 'orders@primedevices.co.za'),
      ('SUP-002', 'Cape Paper Supply', 'Consumables', 3, 'Attention', 'dispatch@capepaper.co.za'),
      ('SUP-003', 'Metro Warehouse Goods', 'Warehouse', 7, 'On track', 'supply@metrowarehouse.co.za')
    on conflict (id) do nothing`);

  await query(`insert into products (id, sku, name, branch_id, status, stock, reorder_at, price, cost, supplier_id, barcode, variants)
    values
      ('PRD-1001', 'SKU-1001', 'Kryvexis Label Printer', 'JHB', 'Healthy', 14, 10, 2499.00, 1620.00, 'SUP-001', '6001001001001', 'Standard / Black'),
      ('PRD-1021', 'SKU-1021', 'Thermal Roll Box', 'CPT', 'Low stock', 8, 12, 380.00, 210.00, 'SUP-002', '6001001001021', '80mm / 24 pack'),
      ('PRD-1033', 'SKU-1033', 'Warehouse Scanner Dock', 'JHB', 'Healthy', 21, 6, 1290.00, 790.00, 'SUP-001', '6001001001033', 'USB-C')
    on conflict (id) do nothing`);

  console.log(JSON.stringify({ ok: true, seeded: ['organizations', 'branches', 'roles', 'permissions', 'app_users', 'customers', 'suppliers', 'products'] }, null, 2));
}

main().catch((error) => {
  console.error('Seed run failed:', error.message);
  process.exit(1);
});
