do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'customers'
  ) then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'customers' and column_name = 'id'
    ) then
      alter table customers add column id text;
    end if;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'customers' and column_name = 'customer_code'
    ) then
      update customers
      set id = customer_code
      where (id is null or btrim(id) = '')
        and customer_code is not null
        and btrim(customer_code) <> '';
    end if;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'customers' and column_name = 'code'
    ) then
      update customers
      set id = code
      where (id is null or btrim(id) = '')
        and code is not null
        and btrim(code) <> '';
    end if;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'customers' and column_name = 'name'
    ) then
      with numbered as (
        select ctid, row_number() over (order by coalesce(name, ''), ctid) as rn
        from customers
        where id is null or btrim(id) = ''
      )
      update customers c
      set id = 'CUS-' || lpad(numbered.rn::text, 3, '0')
      from numbered
      where c.ctid = numbered.ctid;
    end if;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'customers' and column_name = 'id'
    ) then
      with duplicates as (
        select ctid,
               id,
               row_number() over (partition by id order by ctid) as rn
        from customers
        where id is not null and btrim(id) <> ''
      )
      update customers c
      set id = c.id || '-' || duplicates.rn::text
      from duplicates
      where c.ctid = duplicates.ctid
        and duplicates.rn > 1;
    end if;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'customer_activity' and column_name = 'customer_id'
    ) and exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'customer_activity' and column_name = 'customer_name'
    ) then
      update customer_activity ca
      set customer_id = c.id
      from customers c
      where (ca.customer_id is null or btrim(ca.customer_id) = '')
        and ca.customer_name = c.name;
    end if;

    create unique index if not exists idx_customers_id_unique on customers (id);
  end if;
end $$;
