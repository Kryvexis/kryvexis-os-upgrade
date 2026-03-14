create extension if not exists pgcrypto;

create table if not exists automation_settings (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists day_close_records (
  id text primary key,
  close_date date not null,
  closed_at timestamptz not null,
  payload jsonb not null
);
create index if not exists idx_day_close_records_close_date on day_close_records (close_date desc);

create table if not exists email_dispatches (
  id text primary key,
  dispatch_date date not null,
  sent_at timestamptz not null,
  payload jsonb not null
);
create index if not exists idx_email_dispatches_dispatch_date on email_dispatches (dispatch_date desc);

create table if not exists audit_events (
  id text primary key,
  occurred_at timestamptz not null,
  action text not null,
  payload jsonb not null
);
create index if not exists idx_audit_events_occurred_at on audit_events (occurred_at desc);

-- broader OS foundation
create table if not exists branches (
  id text primary key,
  name text not null unique,
  manager_name text,
  manager_email text
);

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  role_key text not null,
  full_name text not null,
  email text unique not null,
  branch_id text references branches(id),
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id text primary key,
  name text not null,
  owner text,
  branch_id text references branches(id),
  status text,
  balance numeric(14,2) default 0,
  contact_email text,
  phone text,
  notes text
);

create table if not exists suppliers (
  id text primary key,
  name text not null,
  category text,
  lead_time text,
  status text,
  contact_email text
);

create table if not exists products (
  id text primary key,
  sku text not null unique,
  name text not null,
  branch_id text references branches(id),
  status text,
  stock integer default 0,
  reorder_at integer default 0,
  price numeric(14,2) default 0,
  cost numeric(14,2) default 0,
  supplier_id text references suppliers(id)
);

create table if not exists sales_transactions (
  id uuid primary key default gen_random_uuid(),
  branch_id text references branches(id),
  sale_date date not null,
  sale_type text not null,
  payment_method text not null,
  total_sales numeric(14,2) not null,
  transaction_count integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists branch_daily_sales (
  id uuid primary key default gen_random_uuid(),
  branch_id text references branches(id),
  sale_date date not null,
  target numeric(14,2) not null default 0,
  total_sales numeric(14,2) not null default 0,
  pos_sales numeric(14,2) not null default 0,
  invoice_sales numeric(14,2) not null default 0,
  cash_sales numeric(14,2) not null default 0,
  card_sales numeric(14,2) not null default 0,
  eft_sales numeric(14,2) not null default 0,
  transactions integer not null default 0,
  unique(branch_id, sale_date)
);
