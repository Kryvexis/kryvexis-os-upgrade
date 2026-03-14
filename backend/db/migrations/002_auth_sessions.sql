create table if not exists roles (
  key text primary key,
  label text not null,
  description text,
  dashboards jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'roles'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'key'
    ) THEN
      ALTER TABLE roles ADD COLUMN key text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'label'
    ) THEN
      ALTER TABLE roles ADD COLUMN label text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'description'
    ) THEN
      ALTER TABLE roles ADD COLUMN description text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'dashboards'
    ) THEN
      ALTER TABLE roles ADD COLUMN dashboards jsonb NOT NULL DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'created_at'
    ) THEN
      ALTER TABLE roles ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'id'
    ) THEN
      EXECUTE 'UPDATE roles SET key = COALESCE(NULLIF(key, ''''), id::text) WHERE key IS NULL OR key = ''''';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'role_key'
    ) THEN
      EXECUTE 'UPDATE roles SET key = COALESCE(NULLIF(key, ''''), role_key::text) WHERE key IS NULL OR key = ''''';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'label'
    ) THEN
      EXECUTE $sql$
        UPDATE roles
        SET key = lower(regexp_replace(label, '[^a-zA-Z0-9]+', '_', 'g'))
        WHERE (key IS NULL OR key = '') AND label IS NOT NULL AND label <> ''
      $sql$;
      EXECUTE $sql$
        UPDATE roles
        SET label = initcap(replace(key, '_', ' '))
        WHERE (label IS NULL OR label = '') AND key IS NOT NULL AND key <> ''
      $sql$;
    END IF;

    IF EXISTS (SELECT 1 FROM roles WHERE key IS NULL OR key = '') THEN
      RAISE EXCEPTION 'roles table exists but some rows still have no key value';
    END IF;

    IF EXISTS (SELECT 1 FROM roles GROUP BY key HAVING COUNT(*) > 1) THEN
      RAISE EXCEPTION 'roles table contains duplicate key values and cannot be auto-repaired';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'key'
    ) THEN
      ALTER TABLE roles ALTER COLUMN key SET NOT NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conrelid = 'roles'::regclass
        AND contype = 'p'
    ) THEN
      ALTER TABLE roles ADD CONSTRAINT roles_pkey PRIMARY KEY (key);
    END IF;
  END IF;
END $$;

create table if not exists permissions (
  key text primary key,
  label text not null,
  created_at timestamptz not null default now()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'permissions'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'key'
    ) THEN
      ALTER TABLE permissions ADD COLUMN key text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'label'
    ) THEN
      ALTER TABLE permissions ADD COLUMN label text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'created_at'
    ) THEN
      ALTER TABLE permissions ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'permission_key'
    ) THEN
      EXECUTE 'UPDATE permissions SET key = COALESCE(NULLIF(key, ''''), permission_key::text) WHERE key IS NULL OR key = ''''';
      EXECUTE $sql$
        UPDATE permissions
        SET label = initcap(replace(permission_key, '.', ' '))
        WHERE (label IS NULL OR label = '') AND permission_key IS NOT NULL AND permission_key <> ''
      $sql$;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'id'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'role_key'
    ) THEN
      EXECUTE $sql$
        UPDATE permissions
        SET key = COALESCE(NULLIF(key, ''), role_key || '.' || coalesce(id::text, 'legacy'))
        WHERE key IS NULL OR key = ''
      $sql$;
    END IF;

    IF EXISTS (SELECT 1 FROM permissions WHERE key IS NULL OR key = '') THEN
      RAISE EXCEPTION 'permissions table exists but some rows still have no key value';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'role_key'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'permission_key'
    ) THEN
      EXECUTE $sql$
        DELETE FROM permissions a
        USING permissions b
        WHERE a.ctid < b.ctid
          AND COALESCE(NULLIF(a.key, ''), a.permission_key) = COALESCE(NULLIF(b.key, ''), b.permission_key)
      $sql$;
    END IF;

    IF EXISTS (SELECT 1 FROM permissions GROUP BY key HAVING COUNT(*) > 1) THEN
      RAISE EXCEPTION 'permissions table contains duplicate key values and cannot be auto-repaired';
    END IF;

    ALTER TABLE permissions ALTER COLUMN key SET NOT NULL;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conrelid = 'permissions'::regclass
        AND contype = 'p'
    ) THEN
      ALTER TABLE permissions ADD CONSTRAINT permissions_pkey PRIMARY KEY (key);
    END IF;
  END IF;
END $$;

create table if not exists role_permissions (
  role_key text not null references roles(key) on delete cascade,
  permission_key text not null references permissions(key) on delete cascade,
  primary key (role_key, permission_key)
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'role_key'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'permission_key'
  ) THEN
    INSERT INTO role_permissions (role_key, permission_key)
    SELECT DISTINCT role_key, COALESCE(NULLIF(key, ''), permission_key)
    FROM permissions
    WHERE role_key IS NOT NULL
      AND permission_key IS NOT NULL
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

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
