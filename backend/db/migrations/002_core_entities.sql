create table if not exists customers (
  id text primary key,
  name text not null,
  owner text,
  branch_id text references branches(id),
  status text,
  balance numeric(14,2) not null default 0,
  credit_terms_days integer,
  price_list text,
  risk_level text,
  contact_email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_customers_branch_id on customers (branch_id);

create table if not exists suppliers (
  id text primary key,
  name text not null,
  category text,
  lead_time_days integer,
  status text,
  contact_email text,
  created_at timestamptz not null default now()
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
  created_at timestamptz not null default now()
);
create index if not exists idx_products_branch_id on products (branch_id);

create table if not exists quotes (
  id text primary key,
  customer_id text not null references customers(id),
  branch_id text references branches(id),
  owner_name text,
  status text not null,
  validity_date date,
  subtotal numeric(14,2) not null default 0,
  tax numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quote_lines (
  id text primary key,
  quote_id text not null references quotes(id) on delete cascade,
  product_id text references products(id),
  sku text,
  description text not null,
  qty numeric(14,2) not null default 0,
  unit_price numeric(14,2) not null default 0,
  line_total numeric(14,2) not null default 0
);

create table if not exists invoices (
  id text primary key,
  customer_id text not null references customers(id),
  quote_id text references quotes(id),
  branch_id text references branches(id),
  status text not null,
  due_date date,
  subtotal numeric(14,2) not null default 0,
  tax numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  payment_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invoice_lines (
  id text primary key,
  invoice_id text not null references invoices(id) on delete cascade,
  product_id text references products(id),
  sku text,
  description text not null,
  qty numeric(14,2) not null default 0,
  unit_price numeric(14,2) not null default 0,
  line_total numeric(14,2) not null default 0
);

create table if not exists payments (
  id text primary key,
  customer_id text references customers(id),
  invoice_id text references invoices(id),
  reference text not null,
  method text,
  amount numeric(14,2) not null default 0,
  status text not null,
  proof_status text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
