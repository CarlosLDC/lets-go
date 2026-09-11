-- ============================================================
-- lets-go — user_signup_trigger
-- ============================================================
-- Trigger: auto-crea public.profiles para usuarios normales al signup
-- (los operadores son manejados por on_operator_signup)
-- ============================================================

create or replace function public.on_user_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Solo actuar sobre cuentas que NO son de tipo 'operator'
  if (new.raw_user_meta_data->>'account_type') = 'operator' then
    return new; -- lo maneja on_operator_signup
  end if;

  insert into public.profiles (auth_user_id, full_name, phone, cedula)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'cedula', '')
  );

  return new;
end;
$$;

-- Revocar acceso público (función interna, no expuesta como RPC)
revoke execute on function public.on_user_signup() from public, anon, authenticated;

create trigger on_user_signup
  after insert on auth.users
  for each row execute function public.on_user_signup();
