create extension if not exists pgcrypto;

create table if not exists schema_migrations (
  id text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists organizations (
  id text primary key,
  legal_name text not null,
  trading_name text not null,
  country_code text not null default 'ZA',
  currency_code text not null default 'ZAR',
  created_at timestamptz not null default now()
);

create table if not exists branches (
  id text primary key,
  organization_id text references organizations(id) on delete cascade,
  code text not null unique,
  name text not null unique,
  city text,
  manager_name text,
  manager_email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists roles (
  key text primary key,
  label text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  role_key text not null references roles(key),
  full_name text not null,
  email text unique not null,
  branch_id text references branches(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  role_key text not null references roles(key) on delete cascade,
  permission_key text not null,
  created_at timestamptz not null default now(),
  unique (role_key, permission_key)
);

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
