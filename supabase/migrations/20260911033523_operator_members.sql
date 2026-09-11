-- ============================================================
-- operator_members: vincula auth.users con operators
-- ============================================================

-- --------------------------------------------------------
-- Tabla pivot operator_members
-- --------------------------------------------------------
create table public.operator_members (
  id           uuid        primary key default gen_random_uuid(),
  operator_id  uuid        not null references public.operators(id) on delete cascade,
  auth_user_id uuid        not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (operator_id, auth_user_id)
);

alter table public.operator_members enable row level security;

create index operator_members_operator_idx on public.operator_members (operator_id);
create index operator_members_user_idx     on public.operator_members (auth_user_id);

-- Cada miembro puede leer su propia fila
create policy "Members can read own membership"
  on public.operator_members for select
  to authenticated
  using (auth_user_id = (select auth.uid()));


-- --------------------------------------------------------
-- Trigger: auto-crea operator + operator_member al signup
-- --------------------------------------------------------
create or replace function public.on_operator_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_operator_id uuid;
begin
  -- Solo actuar sobre cuentas de tipo 'operator'
  if (new.raw_user_meta_data->>'account_type') <> 'operator' then
    return new;
  end if;

  -- Crear el registro del operador (inactivo por defecto, requiere aprobacion)
  insert into public.operators (name, rif, email, phone, is_active)
  values (
    new.raw_user_meta_data->>'operator_name',
    new.raw_user_meta_data->>'operator_rif',
    new.email,
    new.raw_user_meta_data->>'operator_phone',
    false
  )
  returning id into v_operator_id;

  -- Vincular el usuario como admin del operador
  insert into public.operator_members (operator_id, auth_user_id)
  values (v_operator_id, new.id);

  return new;
end;
$$;

-- Revocar acceso publico (es un trigger interno, no una RPC publica)
revoke execute on function public.on_operator_signup() from public, anon, authenticated;

create trigger on_operator_signup
  after insert on auth.users
  for each row execute function public.on_operator_signup();


-- --------------------------------------------------------
-- RLS: public.operators
-- --------------------------------------------------------
drop policy "Authenticated can read operators" on public.operators;

-- Publico ve operadores activos
create policy "Public can read active operators"
  on public.operators for select
  using (is_active = true);

-- Miembro ve su propio operador aunque este pendiente
create policy "Operator members can read own operator"
  on public.operators for select
  to authenticated
  using (
    exists (
      select 1 from public.operator_members
      where operator_id = operators.id
        and auth_user_id = (select auth.uid())
    )
  );

-- Admin puede actualizar su operador (solo si esta activo)
create policy "Operator admins can update their operator"
  on public.operators for update
  to authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.operator_members
      where operator_id = operators.id
        and auth_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.operator_members
      where operator_id = operators.id
        and auth_user_id = (select auth.uid())
    )
  );


-- --------------------------------------------------------
-- RLS: public.parking_lots
-- --------------------------------------------------------
create policy "Operator members can insert parking lots"
  on public.parking_lots for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.operator_members om
      join public.operators o on o.id = om.operator_id
      where om.operator_id = parking_lots.operator_id
        and om.auth_user_id = (select auth.uid())
        and o.is_active = true
    )
  );

create policy "Operator members can update own parking lots"
  on public.parking_lots for update
  to authenticated
  using (
    exists (
      select 1
      from public.operator_members om
      join public.operators o on o.id = om.operator_id
      where om.operator_id = parking_lots.operator_id
        and om.auth_user_id = (select auth.uid())
        and o.is_active = true
    )
  )
  with check (
    exists (
      select 1
      from public.operator_members om
      join public.operators o on o.id = om.operator_id
      where om.operator_id = parking_lots.operator_id
        and om.auth_user_id = (select auth.uid())
        and o.is_active = true
    )
  );

create policy "Operator members can delete own parking lots"
  on public.parking_lots for delete
  to authenticated
  using (
    exists (
      select 1
      from public.operator_members om
      join public.operators o on o.id = om.operator_id
      where om.operator_id = parking_lots.operator_id
        and om.auth_user_id = (select auth.uid())
        and o.is_active = true
    )
  );


-- --------------------------------------------------------
-- RLS: public.parking_sessions
-- --------------------------------------------------------
create policy "Operator members can read sessions in their lots"
  on public.parking_sessions for select
  to authenticated
  using (
    exists (
      select 1
      from public.parking_lots pl
      join public.operator_members om on om.operator_id = pl.operator_id
      where pl.id = parking_sessions.parking_lot_id
        and om.auth_user_id = (select auth.uid())
    )
  );
