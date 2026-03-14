DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'organizations'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'name'
    ) THEN
      ALTER TABLE organizations ADD COLUMN name text;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'trading_name'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'legal_name'
    ) THEN
      EXECUTE $sql$
        UPDATE organizations
        SET name = COALESCE(NULLIF(name, ''), NULLIF(trading_name, ''), NULLIF(legal_name, ''), 'Kryvexis')
      $sql$;
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'trading_name'
    ) THEN
      EXECUTE $sql$
        UPDATE organizations
        SET name = COALESCE(NULLIF(name, ''), NULLIF(trading_name, ''), 'Kryvexis')
      $sql$;
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'legal_name'
    ) THEN
      EXECUTE $sql$
        UPDATE organizations
        SET name = COALESCE(NULLIF(name, ''), NULLIF(legal_name, ''), 'Kryvexis')
      $sql$;
    ELSE
      UPDATE organizations
      SET name = COALESCE(NULLIF(name, ''), 'Kryvexis');
    END IF;
  END IF;
END
$do$;

DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'branches'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'branches' AND column_name = 'manager_name'
    ) THEN
      ALTER TABLE branches ADD COLUMN manager_name text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'branches' AND column_name = 'manager_email'
    ) THEN
      ALTER TABLE branches ADD COLUMN manager_email text;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'branches' AND column_name = 'code'
    ) THEN
      UPDATE branches
      SET code = COALESCE(NULLIF(code, ''), id)
      WHERE code IS NULL OR code = '';
    END IF;
  END IF;
END
$do$;
