create extension if not exists pgcrypto;

create table if not exists organizations (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists branches (
  id text primary key,
  organization_id text references organizations(id) on delete cascade,
  name text not null unique,
  manager_name text,
  manager_email text,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id text primary key,
  name text not null,
  owner text,
  branch_id text references branches(id),
  status text,
  balance numeric(14,2) not null default 0,
  risk text,
  credit_terms text,
  price_list text,
  contact_email text,
  phone text,
  notes text,
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_activity (
  id uuid primary key default gen_random_uuid(),
  customer_id text not null references customers(id) on delete cascade,
  activity_text text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_customer_activity_customer_created on customer_activity (customer_id, created_at desc);

create table if not exists suppliers (
  id text primary key,
  name text not null,
  category text,
  lead_time text,
  status text,
  contact_email text,
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  sku text not null unique,
  name text not null,
  branch_id text references branches(id),
  status text,
  stock integer not null default 0,
  reorder_at integer not null default 0,
  price numeric(14,2) not null default 0,
  cost numeric(14,2) not null default 0,
  supplier_id text references suppliers(id),
  barcode text,
  variants text,
  movement_summary text,
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quotes (
  id text primary key,
  customer_id text not null references customers(id),
  customer_name text not null,
  owner text,
  branch_id text references branches(id),
  value_total numeric(14,2) not null default 0,
  status text not null,
  validity_date date,
  trigger_reason text,
  updated_label text,
  notes text,
  next_action text,
  subtotal numeric(14,2) not null default 0,
  tax numeric(14,2) not null default 0,
  margin_band text,
  approval_owner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_quotes_customer_id on quotes (customer_id);
create index if not exists idx_quotes_status on quotes (status);

create table if not exists quote_lines (
  id text primary key,
  quote_id text not null references quotes(id) on delete cascade,
  sku text,
  description text not null,
  qty numeric(14,2) not null default 0,
  unit_price numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0
);

create table if not exists quote_workflow_events (
  id uuid primary key default gen_random_uuid(),
  quote_id text not null references quotes(id) on delete cascade,
  label text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id text primary key,
  customer_id text not null references customers(id),
  customer_name text not null,
  amount numeric(14,2) not null default 0,
  branch_id text references branches(id),
  status text not null,
  due_label text,
  source_quote_id text,
  payment_status text,
  tax_label text,
  reminders text,
  next_action text,
  due_in_days integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_invoices_customer_id on invoices (customer_id);
create index if not exists idx_invoices_status on invoices (status);

create table if not exists payments (
  id text primary key,
  customer_id text references customers(id),
  party text not null,
  amount numeric(14,2) not null default 0,
  branch_id text references branches(id),
  status text not null,
  method text,
  ref text,
  proof text,
  applied_to text,
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_payments_customer_id on payments (customer_id);
create index if not exists idx_payments_status on payments (status);
