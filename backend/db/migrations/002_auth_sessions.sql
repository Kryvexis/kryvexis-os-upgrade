create table if not exists roles (
  key text primary key,
  label text not null,
  description text,
  dashboards jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists permissions (
  key text primary key,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists role_permissions (
  role_key text not null references roles(key) on delete cascade,
  permission_key text not null references permissions(key) on delete cascade,
  primary key (role_key, permission_key)
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

create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role_key text not null references roles(key),
  branch_id text references branches(id),
  token text unique not null,
  status text not null default 'pending',
  invited_by text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists auth_sessions (
  token text primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_auth_sessions_user_id on auth_sessions (user_id);
