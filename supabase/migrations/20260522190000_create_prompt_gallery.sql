create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  prompt_text text not null,
  image_url text not null,
  image_path text,
  copy_count integer not null default 0 check (copy_count >= 0),
  favorite_count integer not null default 0 check (favorite_count >= 0),
  is_featured boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompt_tags (
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (prompt_id, tag_id)
);

create index if not exists prompts_category_id_idx on public.prompts(category_id);
create index if not exists prompts_created_at_idx on public.prompts(created_at desc);
create index if not exists prompts_copy_count_idx on public.prompts(copy_count desc);
create index if not exists prompt_tags_tag_id_idx on public.prompt_tags(tag_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prompts_set_updated_at on public.prompts;
create trigger prompts_set_updated_at
before update on public.prompts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do update set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_tags enable row level security;

drop policy if exists "Profiles are readable by owner or admin" on public.profiles;
create policy "Profiles are readable by owner or admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "Admins update profiles" on public.profiles;
create policy "Admins update profiles"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Categories are public" on public.categories;
create policy "Categories are public"
on public.categories for select
using (true);

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Tags are public" on public.tags;
create policy "Tags are public"
on public.tags for select
using (true);

drop policy if exists "Admins manage tags" on public.tags;
create policy "Admins manage tags"
on public.tags for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Prompts are public" on public.prompts;
create policy "Prompts are public"
on public.prompts for select
using (true);

drop policy if exists "Admins manage prompts" on public.prompts;
create policy "Admins manage prompts"
on public.prompts for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Prompt tags are public" on public.prompt_tags;
create policy "Prompt tags are public"
on public.prompt_tags for select
using (true);

drop policy if exists "Admins manage prompt tags" on public.prompt_tags;
create policy "Admins manage prompt tags"
on public.prompt_tags for all
using (public.is_admin())
with check (public.is_admin());

insert into public.categories (name, sort_order)
values
  ('Midjourney', 1),
  ('ChatGPT', 2),
  ('Leonardo AI', 3),
  ('Flux', 4),
  ('Видео', 5),
  ('Фото', 6),
  ('Реклама', 7),
  ('Кино', 8),
  ('Реализм', 9),
  ('Аниме', 10),
  ('TikTok', 11),
  ('YouTube', 12),
  ('Маркетинг', 13),
  ('Бизнес', 14),
  ('Синематик', 15)
on conflict (name) do update set sort_order = excluded.sort_order;

insert into public.tags (slug, label)
values
  ('cinematic', 'кино'),
  ('realistic', 'реализм'),
  ('dark', 'тёмный'),
  ('neon', 'неон'),
  ('luxury', 'люкс'),
  ('anime', 'аниме'),
  ('iphone', 'айфон'),
  ('fashion', 'мода'),
  ('cyberpunk', 'киберпанк'),
  ('viral', 'вирусное')
on conflict (slug) do update set label = excluded.label;

create or replace view public.prompt_cards
with (security_invoker = true)
as
select
  p.id,
  p.title,
  coalesce(c.name, 'Без категории') as category,
  coalesce(array_agg(t.label order by t.label) filter (where t.id is not null), '{}') as tags,
  coalesce(array_agg(t.slug order by t.label) filter (where t.id is not null), '{}') as tag_slugs,
  p.prompt_text,
  p.image_url,
  p.copy_count,
  p.favorite_count,
  p.created_at,
  p.is_featured
from public.prompts p
left join public.categories c on c.id = p.category_id
left join public.prompt_tags pt on pt.prompt_id = p.id
left join public.tags t on t.id = pt.tag_id
group by p.id, c.name;

create or replace function public.increment_prompt_copies(prompt_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.prompts
  set copy_count = copy_count + 1
  where id = prompt_id;
end;
$$;

create or replace function public.upsert_prompt_with_tags(
  p_prompt_id uuid,
  p_title text,
  p_prompt_text text,
  p_category_name text,
  p_tags text[],
  p_image_url text,
  p_is_featured boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category_id uuid;
  v_prompt_id uuid;
  v_raw_tag text;
  v_tag_label text;
  v_tag_slug text;
  v_tag_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can save prompts';
  end if;

  insert into public.categories (name)
  values (trim(p_category_name))
  on conflict (name) do update set name = excluded.name
  returning id into v_category_id;

  if p_prompt_id is null then
    insert into public.prompts (
      category_id,
      title,
      prompt_text,
      image_url,
      is_featured,
      created_by
    )
    values (
      v_category_id,
      trim(p_title),
      trim(p_prompt_text),
      trim(p_image_url),
      coalesce(p_is_featured, false),
      auth.uid()
    )
    returning id into v_prompt_id;
  else
    update public.prompts
    set
      category_id = v_category_id,
      title = trim(p_title),
      prompt_text = trim(p_prompt_text),
      image_url = trim(p_image_url),
      is_featured = coalesce(p_is_featured, false)
    where id = p_prompt_id
    returning id into v_prompt_id;

    if v_prompt_id is null then
      raise exception 'Prompt not found';
    end if;

    delete from public.prompt_tags where prompt_id = v_prompt_id;
  end if;

  foreach v_raw_tag in array coalesce(p_tags, array[]::text[]) loop
    v_tag_label = trim(v_raw_tag);

    if v_tag_label = '' then
      continue;
    end if;

    v_tag_slug = btrim(regexp_replace(lower(v_tag_label), '[^a-zа-яё0-9]+', '-', 'g'), '-');

    if v_tag_slug = '' then
      continue;
    end if;

    insert into public.tags (slug, label)
    values (v_tag_slug, v_tag_label)
    on conflict (slug) do update set label = excluded.label
    returning id into v_tag_id;

    insert into public.prompt_tags (prompt_id, tag_id)
    values (v_prompt_id, v_tag_id)
    on conflict do nothing;
  end loop;

  return v_prompt_id;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'prompt-images',
  'prompt-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Prompt images are public" on storage.objects;
create policy "Prompt images are public"
on storage.objects for select
using (bucket_id = 'prompt-images');

drop policy if exists "Admins upload prompt images" on storage.objects;
create policy "Admins upload prompt images"
on storage.objects for insert
with check (bucket_id = 'prompt-images' and public.is_admin());

drop policy if exists "Admins update prompt images" on storage.objects;
create policy "Admins update prompt images"
on storage.objects for update
using (bucket_id = 'prompt-images' and public.is_admin())
with check (bucket_id = 'prompt-images' and public.is_admin());

drop policy if exists "Admins delete prompt images" on storage.objects;
create policy "Admins delete prompt images"
on storage.objects for delete
using (bucket_id = 'prompt-images' and public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.prompt_cards to anon, authenticated;
grant execute on function public.increment_prompt_copies(uuid) to anon, authenticated;
grant execute on function public.upsert_prompt_with_tags(uuid, text, text, text, text[], text, boolean) to authenticated;
