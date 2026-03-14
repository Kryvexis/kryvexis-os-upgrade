create table if not exists auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  token_hash text not null unique,
  branch_id text references branches(id),
  user_agent text,
  created_by text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index if not exists idx_auth_sessions_user_id on auth_sessions (user_id);
create index if not exists idx_auth_sessions_expires_at on auth_sessions (expires_at);

create table if not exists user_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role_key text not null references roles(key),
  branch_id text references branches(id),
  invite_token text not null unique,
  created_by text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz
);
create index if not exists idx_user_invitations_email on user_invitations (lower(email));
