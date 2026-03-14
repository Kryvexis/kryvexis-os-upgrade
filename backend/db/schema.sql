create extension if not exists pgcrypto;

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  manager_name text,
  manager_email text,
  created_at timestamptz not null default now()
);

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  role_key text not null,
  branch_id uuid references branches(id),
  created_at timestamptz not null default now()
);

create table if not exists automation_settings (
  id boolean primary key default true,
  trigger_mode text not null default 'manual-close',
  close_time text not null default '18:00',
  send_to_managers boolean not null default true,
  send_to_executives boolean not null default true,
  default_manager_branch_id uuid references branches(id),
  manager_recipients text[] not null default '{}',
  executive_recipients text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint automation_settings_singleton check (id = true)
);

create table if not exists customers (
  id text primary key,
  name text not null,
  owner_name text,
  branch_id uuid references branches(id),
  status text,
  balance numeric(14,2) not null default 0,
  risk text,
  credit_terms text,
  price_list text,
  contact_email text,
  phone text,
  notes text,
  next_action text,
  created_at timestamptz not null default now()
);

create table if not exists suppliers (
  id text primary key,
  name text not null,
  category text,
  lead_time text,
  status text,
  contact_email text,
  next_action text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  sku text not null unique,
  name text not null,
  branch_id uuid references branches(id),
  status text,
  stock integer not null default 0,
  reorder_at integer not null default 0,
  price numeric(14,2) not null default 0,
  cost numeric(14,2) not null default 0,
  supplier_name text,
  barcode text,
  variants text,
  movement_summary text,
  next_action text,
  created_at timestamptz not null default now()
);

create table if not exists sales_transactions (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id),
  source_type text not null check (source_type in ('pos', 'invoice')),
  source_id text,
  payment_method text,
  amount numeric(14,2) not null,
  transaction_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists day_close_records (
  id uuid primary key default gen_random_uuid(),
  close_date date not null unique,
  trigger text not null,
  total_sales numeric(14,2) not null,
  variance_to_target numeric(14,2) not null,
  sent_status text not null default 'pending',
  sent_at timestamptz,
  closed_by text,
  closed_at timestamptz not null default now(),
  email_dispatch_id uuid
);

create table if not exists branch_daily_sales (
  id uuid primary key default gen_random_uuid(),
  day_close_record_id uuid not null references day_close_records(id) on delete cascade,
  branch_id uuid not null references branches(id),
  target numeric(14,2) not null default 0,
  total_sales numeric(14,2) not null default 0,
  variance_to_target numeric(14,2) not null default 0,
  pos_sales numeric(14,2) not null default 0,
  invoice_sales numeric(14,2) not null default 0,
  cash_sales numeric(14,2) not null default 0,
  card_sales numeric(14,2) not null default 0,
  eft_sales numeric(14,2) not null default 0,
  transactions integer not null default 0,
  average_basket numeric(14,2) not null default 0
);

create table if not exists email_dispatches (
  id uuid primary key default gen_random_uuid(),
  close_date date not null,
  sent_at timestamptz not null default now(),
  recipients text[] not null default '{}',
  provider text not null,
  subject text not null,
  status text not null,
  company_total numeric(14,2) not null default 0,
  branch_count integer not null default 0,
  resend boolean not null default false,
  closed_record_id uuid references day_close_records(id)
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor text not null,
  action text not null,
  status text not null,
  detail text not null,
  branch_name text,
  event_date date not null default current_date
);
