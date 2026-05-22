create or replace function public.claim_first_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if public.is_admin() then
    return true;
  end if;

  if exists (select 1 from public.profiles where role = 'admin') then
    return false;
  end if;

  insert into public.profiles (id, email, role)
  select auth.uid(), au.email, 'admin'
  from auth.users au
  where au.id = auth.uid()
  on conflict (id) do update
  set role = 'admin', email = excluded.email;

  return true;
end;
$$;

grant execute on function public.claim_first_admin() to authenticated;
