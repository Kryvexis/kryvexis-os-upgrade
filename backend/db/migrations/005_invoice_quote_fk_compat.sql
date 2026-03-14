do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'invoices'
  ) then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'invoices' and column_name = 'quote_id'
    ) then
      update invoices i
      set quote_id = null
      where quote_id is not null
        and not exists (
          select 1 from quotes q where q.id = i.quote_id
        );

      begin
        alter table invoices alter column quote_id drop not null;
      exception when others then
        null;
      end;
    end if;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'invoices' and column_name = 'source_quote_id'
    ) then
      update invoices i
      set source_quote_id = null
      where source_quote_id is not null
        and not exists (
          select 1 from quotes q where q.id = i.source_quote_id
        );

      begin
        alter table invoices alter column source_quote_id drop not null;
      exception when others then
        null;
      end;
    end if;
  end if;
end $$;
