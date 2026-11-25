-- Horários oficiais do Oxente. Nenhum produto, preço ou outra integração é alterado.
begin;
alter table public.opening_hours add column if not exists updated_at timestamptz not null default now();

-- Ponto de restauração privado da configuração anterior, criado uma única vez.
create table if not exists private.opening_hours_backup_20261125 as
select establishment_id, config, updated_at
from public.opening_hours
where establishment_id = '00000000-0000-4000-8000-000000000002'::uuid;
alter table private.opening_hours_backup_20261125 enable row level security;
revoke all on table private.opening_hours_backup_20261125 from public, anon, authenticated;

-- O salvamento legado do catálogo ainda envia uma cópia de hours. Impede que essa
-- cópia antiga reverta uma alteração feita pela central de horários.
create or replace function public.preserve_opening_hours_on_catalog_save() returns trigger
language plpgsql security invoker set search_path = ''
as $$
begin
  if new.updated_at is not distinct from old.updated_at then
    new.config := old.config;
  end if;
  return new;
end;
$$;
revoke all on function public.preserve_opening_hours_on_catalog_save() from public;
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_trigger
    where tgname = 'preserve_opening_hours_on_catalog_save'
      and tgrelid = 'public.opening_hours'::pg_catalog.regclass
      and not tgisinternal
  ) then
    create trigger preserve_opening_hours_on_catalog_save before update on public.opening_hours
    for each row execute function public.preserve_opening_hours_on_catalog_save();
  end if;
end;
$$;

create or replace function public.opening_hours_clock(eid uuid) returns jsonb
language sql volatile security invoker set search_path = ''
as $$
  select pg_catalog.jsonb_build_object('hours', h.config, 'serverNow', pg_catalog.clock_timestamp(), 'updatedAt', h.updated_at)
  from public.opening_hours h
  where h.establishment_id = eid
$$;
revoke all on function public.opening_hours_clock(uuid) from public;
grant execute on function public.opening_hours_clock(uuid) to anon, authenticated;

create or replace function public.save_opening_hours(eid uuid, payload jsonb) returns void
language plpgsql security invoker set search_path = ''
as $$
declare item jsonb; slot jsonb; seen_dates text[] := array[]::text[]; date_text text;
begin
  if not private.is_admin(eid) then
    raise exception 'Acesso administrativo não autorizado' using errcode = '42501';
  end if;
  if pg_catalog.jsonb_typeof(payload) <> 'object'
    or coalesce(payload->>'timezone', '') <> 'America/Bahia'
    or coalesce(payload->>'manual', '') not in ('auto', 'open', 'closed')
    or pg_catalog.jsonb_typeof(payload->'days') <> 'array'
    or pg_catalog.jsonb_array_length(payload->'days') <> 7
    or pg_catalog.jsonb_typeof(payload->'specials') <> 'array'
  then raise exception 'Configuração de horários inválida' using errcode = '22023'; end if;
  if payload->>'manual' <> 'auto' then
    if nullif(payload->>'manualUntil', '') is null or (payload->>'manualUntil')::timestamptz <= pg_catalog.clock_timestamp() then
      raise exception 'Ajuste manual requer validade futura' using errcode = '22023';
    end if;
  end if;
  for item in select value from pg_catalog.jsonb_array_elements(payload->'days') loop
    if pg_catalog.jsonb_typeof(item->'open') <> 'boolean' or pg_catalog.jsonb_typeof(item->'intervals') <> 'array'
    then raise exception 'Dia inválido' using errcode = '22023'; end if;
    if (item->>'open')::boolean and pg_catalog.jsonb_array_length(item->'intervals') = 0
    then raise exception 'Dia aberto sem intervalo' using errcode = '22023'; end if;
    for slot in select value from pg_catalog.jsonb_array_elements(item->'intervals') loop
      if coalesce(slot->>'start','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        or coalesce(slot->>'end','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        or slot->>'start' = slot->>'end'
      then raise exception 'Intervalo inválido' using errcode = '22023'; end if;
    end loop;
  end loop;
  for item in select value from pg_catalog.jsonb_array_elements(payload->'specials') loop
    date_text := item->>'date';
    if coalesce(date_text, '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or date_text = any(seen_dates)
      or pg_catalog.jsonb_typeof(item->'open') <> 'boolean'
      or pg_catalog.jsonb_typeof(item->'intervals') <> 'array'
    then raise exception 'Data especial inválida ou repetida' using errcode = '22023'; end if;
    perform date_text::date;
    seen_dates := pg_catalog.array_append(seen_dates, date_text);
    if (item->>'open')::boolean and pg_catalog.jsonb_array_length(item->'intervals') = 0
    then raise exception 'Data especial aberta sem intervalo' using errcode = '22023'; end if;
    for slot in select value from pg_catalog.jsonb_array_elements(item->'intervals') loop
      if coalesce(slot->>'start','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        or coalesce(slot->>'end','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        or slot->>'start' = slot->>'end'
      then raise exception 'Intervalo especial inválido' using errcode = '22023'; end if;
    end loop;
  end loop;
  update public.opening_hours
  set config = payload, updated_at = pg_catalog.clock_timestamp()
  where establishment_id = eid;
  if not found then raise exception 'Estabelecimento sem configuração de horário' using errcode = '22023'; end if;
end;
$$;
revoke all on function public.save_opening_hours(uuid, jsonb) from public, anon;
grant execute on function public.save_opening_hours(uuid, jsonb) to authenticated;

-- Realtime somente da tabela de horários, já protegida por RLS.
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'opening_hours'
  ) then
    alter publication supabase_realtime add table public.opening_hours;
  end if;
end;
$$;

update public.opening_hours
set config = config || pg_catalog.jsonb_build_object(
  'timezone', 'America/Bahia',
  'days', pg_catalog.jsonb_build_array(
    pg_catalog.jsonb_build_object('day','Domingo','open',true,'intervals',pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('start','12:00','end','22:00'))),
    pg_catalog.jsonb_build_object('day','Segunda','open',false,'intervals','[]'::jsonb),
    pg_catalog.jsonb_build_object('day','Terça','open',true,'intervals',pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('start','16:00','end','22:00'))),
    pg_catalog.jsonb_build_object('day','Quarta','open',true,'intervals',pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('start','16:00','end','22:00'))),
    pg_catalog.jsonb_build_object('day','Quinta','open',true,'intervals',pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('start','16:00','end','23:00'))),
    pg_catalog.jsonb_build_object('day','Sexta','open',true,'intervals',pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('start','15:00','end','00:00'))),
    pg_catalog.jsonb_build_object('day','Sábado','open',true,'intervals',pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('start','12:00','end','00:00')))
  )
), updated_at = pg_catalog.clock_timestamp()
where establishment_id = '00000000-0000-4000-8000-000000000002'::uuid;
commit;
