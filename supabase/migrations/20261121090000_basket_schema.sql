-- Basket database: households, their members, and the shopping items.
--
-- How access works:
--   * Every phone signs in anonymously (no email or password), so each phone is a Supabase user.
--   * A user can only see a household's items if they are a member of that household.
--   * New households and joining by invite code go through two functions below,
--     so nobody can add themselves to a household without its code.
--
-- Run this once in the Supabase SQL Editor (or with `supabase db push`).

-- Invite codes look like "X7K2-9QD" (no 0/O or 1/I/L, so they're easy to read out loud).
create or replace function public.make_invite_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text := '';
begin
  for i in 1..7 loop
    code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    if i = 4 then
      code := code || '-';
    end if;
  end loop;
  return code;
end;
$$;

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our Home' check (char_length(name) between 1 and 40),
  invite_code text not null unique default public.make_invite_code(),
  created_at timestamptz not null default now()
);

create table public.members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  quantity text not null default '' check (char_length(quantity) <= 30),
  added_by_name text not null default '',
  done boolean not null default false,
  done_by_name text,
  done_at timestamptz,
  created_at timestamptz not null default now()
);

create index items_household_created_idx on public.items (household_id, created_at);

-- Is the signed-in user a member of this household?
-- "security definer" lets it read the members table without tripping over its own policies.
create or replace function public.is_member(p_household uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.members m
    where m.household_id = p_household and m.user_id = auth.uid()
  );
$$;

-- Row level security: on every table, only members get access.
alter table public.households enable row level security;
alter table public.members enable row level security;
alter table public.items enable row level security;

create policy "Members can read their household"
  on public.households for select to authenticated
  using (public.is_member(id));

create policy "Members can rename their household"
  on public.households for update to authenticated
  using (public.is_member(id)) with check (public.is_member(id));

create policy "Members can see the other members"
  on public.members for select to authenticated
  using (public.is_member(household_id));

create policy "Members can leave"
  on public.members for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Members can read items"
  on public.items for select to authenticated
  using (public.is_member(household_id));

create policy "Members can add items"
  on public.items for insert to authenticated
  with check (public.is_member(household_id));

create policy "Members can update items"
  on public.items for update to authenticated
  using (public.is_member(household_id)) with check (public.is_member(household_id));

create policy "Members can delete items"
  on public.items for delete to authenticated
  using (public.is_member(household_id));

-- Create a household and become its first member.
create or replace function public.create_household(p_member_name text, p_household_name text default 'Our Home')
returns public.households
language plpgsql
security definer
set search_path = ''
as $$
declare
  h public.households;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  insert into public.households (name)
  values (coalesce(nullif(trim(p_household_name), ''), 'Our Home'))
  returning * into h;

  insert into public.members (household_id, user_id, name)
  values (h.id, auth.uid(), trim(p_member_name));

  return h;
end;
$$;

-- Join a household with its invite code (joining again just updates your name).
create or replace function public.join_household(p_code text, p_member_name text)
returns public.households
language plpgsql
security definer
set search_path = ''
as $$
declare
  h public.households;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  select * into h from public.households where invite_code = upper(trim(p_code));
  if not found then
    raise exception 'No list found for code %', upper(trim(p_code));
  end if;

  insert into public.members (household_id, user_id, name)
  values (h.id, auth.uid(), trim(p_member_name))
  on conflict (household_id, user_id) do update set name = excluded.name;

  return h;
end;
$$;

-- Who can call what. Functions are callable by everyone by default, so lock them down.
revoke execute on function public.create_household(text, text) from public, anon;
revoke execute on function public.join_household(text, text) from public, anon;
revoke execute on function public.is_member(uuid) from public, anon;
grant execute on function public.create_household(text, text) to authenticated;
grant execute on function public.join_household(text, text) to authenticated;
grant execute on function public.is_member(uuid) to authenticated;

grant select, update on public.households to authenticated;
grant select, delete on public.members to authenticated;
grant select, insert, update, delete on public.items to authenticated;

-- Live updates: send item changes to subscribed phones (Supabase Realtime).
-- "replica identity full" lets deletes be filtered by household too.
alter table public.items replica identity full;
alter publication supabase_realtime add table public.items;
