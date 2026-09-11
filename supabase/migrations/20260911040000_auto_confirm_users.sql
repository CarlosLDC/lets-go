-- ============================================================
-- lets-go — auto_confirm_users
-- ============================================================
-- Auto-confirma el email de los nuevos usuarios para permitir
-- el inicio de sesión inmediato sin requerir confirmación por correo.
-- ============================================================

create or replace function public.auto_confirm_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

-- Revocar acceso público (función interna de base de datos)
revoke execute on function public.auto_confirm_user() from public, anon, authenticated;

drop trigger if exists auto_confirm_user on auth.users;
create trigger auto_confirm_user
  before insert on auth.users
  for each row
  execute function public.auto_confirm_user();
