-- Healzo — screen-time app for families
-- Run once in Supabase → SQL Editor. Safe to re-run.
-- ALSO: Authentication → Sign In / Providers → enable "Allow anonymous sign-ins".

create extension if not exists pgcrypto;

-- ───────────────────────── tables ─────────────────────────
create table if not exists public.hz_families (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  parent_code text not null unique,            -- lets a 2nd parent join
  created_at  timestamptz not null default now()
);

create table if not exists public.hz_children (
  id              uuid primary key default gen_random_uuid(),
  family_id       uuid not null references public.hz_families(id) on delete cascade,
  name            text not null check (char_length(name) between 1 and 40),
  birth_year      int  not null check (birth_year between 2000 and 2100),
  avatar          text not null default '🦊',
  daily_limit_min int  not null default 60 check (daily_limit_min between 0 and 600),
  join_code       text not null unique,        -- links the child's device
  created_at      timestamptz not null default now()
);

create table if not exists public.hz_members (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  family_id  uuid not null references public.hz_families(id) on delete cascade,
  role       text not null check (role in ('parent','child')),
  child_id   uuid references public.hz_children(id) on delete cascade,
  name       text,
  created_at timestamptz not null default now(),
  check ((role = 'child') = (child_id is not null))
);

create table if not exists public.hz_sessions (          -- screen-time sessions
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references public.hz_families(id) on delete cascade,
  child_id   uuid not null references public.hz_children(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at   timestamptz,
  minutes    int check (minutes between 0 and 1440),     -- set when ended (or manual entry)
  source     text not null default 'timer' check (source in ('timer','manual')),
  created_by uuid default auth.uid()
);
create index if not exists hz_sessions_child_idx on public.hz_sessions(child_id, started_at desc);

create table if not exists public.hz_activity_logs (     -- screen-free activities done
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.hz_families(id) on delete cascade,
  child_id    uuid not null references public.hz_children(id) on delete cascade,
  activity_id text not null,
  title       text not null check (char_length(title) <= 120),
  minutes     int  not null default 0 check (minutes between 0 and 600),
  points      int  not null default 0 check (points between 0 and 500),
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now(),
  created_by  uuid default auth.uid()
);
create index if not exists hz_logs_child_idx on public.hz_activity_logs(child_id, created_at desc);

create table if not exists public.hz_rewards (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references public.hz_families(id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 80),
  emoji      text not null default '🎁',
  cost       int  not null check (cost between 1 and 10000),
  created_at timestamptz not null default now()
);

create table if not exists public.hz_redemptions (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references public.hz_families(id) on delete cascade,
  child_id   uuid not null references public.hz_children(id) on delete cascade,
  reward_id  uuid references public.hz_rewards(id) on delete set null,
  title      text not null,
  cost       int  not null check (cost between 1 and 10000),
  status     text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.hz_products (           -- shop catalogue (edit in Table Editor)
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  category    text not null default 'Gardening',
  emoji       text not null default '🌱',
  image_url   text,
  price_inr   int  not null check (price_inr >= 0),
  mrp_inr     int,
  age_label   text,
  active      boolean not null default true,
  sort        int not null default 100,
  created_at  timestamptz not null default now()
);

create table if not exists public.hz_orders (
  id          uuid primary key default gen_random_uuid(),
  order_code  text not null unique,
  user_id     uuid not null default auth.uid(),
  items       jsonb not null,
  total_inr   int not null check (total_inr >= 0),
  name        text not null check (char_length(name) between 2 and 120),
  phone       text not null check (char_length(phone) between 8 and 20),
  address     text not null check (char_length(address) between 5 and 500),
  pincode     text not null check (pincode ~ '^[0-9]{6}$'),
  note        text check (note is null or char_length(note) <= 300),
  status      text not null default 'placed' check (status in ('placed','confirmed','shipped','delivered','cancelled')),
  created_at  timestamptz not null default now()
);

-- ───────────────────────── helpers ─────────────────────────
create or replace function public.hz_code(len int default 6) returns text
language sql volatile as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + (get_byte(gen_random_bytes(1),0) % 32), 1), '')
  from generate_series(1, len);
$$;

create or replace function public.hz_my_family() returns uuid
language sql stable security definer set search_path = public as $$
  select family_id from public.hz_members where user_id = auth.uid();
$$;
create or replace function public.hz_is_parent() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.hz_members where user_id = auth.uid() and role = 'parent');
$$;
create or replace function public.hz_my_child() returns uuid
language sql stable security definer set search_path = public as $$
  select child_id from public.hz_members where user_id = auth.uid() and role = 'child';
$$;

-- child join codes default
alter table public.hz_children alter column join_code set default public.hz_code(6);
alter table public.hz_families alter column parent_code set default public.hz_code(6);

-- ───────────────────────── RPCs ─────────────────────────
create or replace function public.hz_create_family(p_family_name text, p_parent_name text)
returns public.hz_families language plpgsql security definer set search_path = public as $$
declare f public.hz_families;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if exists(select 1 from hz_members where user_id = auth.uid()) then raise exception 'already in a family'; end if;
  insert into hz_families(name) values (coalesce(nullif(trim(p_family_name),''),'My family')) returning * into f;
  insert into hz_members(user_id, family_id, role, name) values (auth.uid(), f.id, 'parent', left(trim(p_parent_name),60));
  return f;
end $$;

create or replace function public.hz_join_as_parent(p_code text, p_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select id into fid from hz_families where parent_code = upper(trim(p_code));
  if fid is null then raise exception 'invalid code'; end if;
  insert into hz_members(user_id, family_id, role, name) values (auth.uid(), fid, 'parent', left(trim(p_name),60))
  on conflict (user_id) do update set family_id = excluded.family_id, role = 'parent', child_id = null, name = excluded.name;
  return fid;
end $$;

create or replace function public.hz_join_as_child(p_code text)
returns public.hz_children language plpgsql security definer set search_path = public as $$
declare c public.hz_children;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into c from hz_children where join_code = upper(trim(p_code));
  if c.id is null then raise exception 'invalid code'; end if;
  insert into hz_members(user_id, family_id, role, child_id, name) values (auth.uid(), c.family_id, 'child', c.id, c.name)
  on conflict (user_id) do update set family_id = excluded.family_id, role = 'child', child_id = excluded.child_id, name = excluded.name;
  return c;
end $$;

create or replace function public.hz_new_child_code(p_child uuid)
returns text language plpgsql security definer set search_path = public as $$
declare code text;
begin
  if not hz_is_parent() then raise exception 'parents only'; end if;
  update hz_children set join_code = hz_code(6) where id = p_child and family_id = hz_my_family() returning join_code into code;
  return code;
end $$;

create or replace function public.hz_leave_family()
returns void language sql security definer set search_path = public as $$
  delete from hz_members where user_id = auth.uid();
$$;

revoke all on function public.hz_create_family(text,text), public.hz_join_as_parent(text,text),
  public.hz_join_as_child(text), public.hz_new_child_code(uuid), public.hz_leave_family() from public, anon;
grant execute on function public.hz_create_family(text,text), public.hz_join_as_parent(text,text),
  public.hz_join_as_child(text), public.hz_new_child_code(uuid), public.hz_leave_family() to authenticated;

-- ───────────────────────── row level security ─────────────────────────
alter table public.hz_families      enable row level security;
alter table public.hz_children      enable row level security;
alter table public.hz_members       enable row level security;
alter table public.hz_sessions      enable row level security;
alter table public.hz_activity_logs enable row level security;
alter table public.hz_rewards       enable row level security;
alter table public.hz_redemptions   enable row level security;
alter table public.hz_products      enable row level security;
alter table public.hz_orders        enable row level security;

do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies where schemaname='public' and tablename like 'hz\_%' loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- families: members read; parents rename
create policy fam_read on public.hz_families for select to authenticated using (id = hz_my_family());
create policy fam_upd  on public.hz_families for update to authenticated using (id = hz_my_family() and hz_is_parent());

-- members: see your own family
create policy mem_read on public.hz_members for select to authenticated using (family_id = hz_my_family());

-- children: family reads; parents manage
create policy ch_read on public.hz_children for select to authenticated using (family_id = hz_my_family());
create policy ch_ins  on public.hz_children for insert to authenticated with check (family_id = hz_my_family() and hz_is_parent());
create policy ch_upd  on public.hz_children for update to authenticated using (family_id = hz_my_family() and hz_is_parent());
create policy ch_del  on public.hz_children for delete to authenticated using (family_id = hz_my_family() and hz_is_parent());

-- sessions: parents any child in family; a child only their own
create policy se_read on public.hz_sessions for select to authenticated using (family_id = hz_my_family());
create policy se_ins  on public.hz_sessions for insert to authenticated with check (
  family_id = hz_my_family() and (hz_is_parent() or child_id = hz_my_child()));
create policy se_upd  on public.hz_sessions for update to authenticated using (
  family_id = hz_my_family() and (hz_is_parent() or child_id = hz_my_child()));
create policy se_del  on public.hz_sessions for delete to authenticated using (family_id = hz_my_family() and hz_is_parent());

-- activity logs: child adds own as pending; parents approve
create policy al_read on public.hz_activity_logs for select to authenticated using (family_id = hz_my_family());
create policy al_ins  on public.hz_activity_logs for insert to authenticated with check (
  family_id = hz_my_family() and (hz_is_parent() or (child_id = hz_my_child() and status = 'pending')));
create policy al_upd  on public.hz_activity_logs for update to authenticated using (family_id = hz_my_family() and hz_is_parent());
create policy al_del  on public.hz_activity_logs for delete to authenticated using (family_id = hz_my_family() and hz_is_parent());

-- rewards: parents manage
create policy rw_read on public.hz_rewards for select to authenticated using (family_id = hz_my_family());
create policy rw_ins  on public.hz_rewards for insert to authenticated with check (family_id = hz_my_family() and hz_is_parent());
create policy rw_upd  on public.hz_rewards for update to authenticated using (family_id = hz_my_family() and hz_is_parent());
create policy rw_del  on public.hz_rewards for delete to authenticated using (family_id = hz_my_family() and hz_is_parent());

-- redemptions: child requests; parents approve
create policy rd_read on public.hz_redemptions for select to authenticated using (family_id = hz_my_family());
create policy rd_ins  on public.hz_redemptions for insert to authenticated with check (
  family_id = hz_my_family() and status = 'pending' and (hz_is_parent() or child_id = hz_my_child()));
create policy rd_upd  on public.hz_redemptions for update to authenticated using (family_id = hz_my_family() and hz_is_parent());

-- products: everyone can browse active products
create policy pr_read on public.hz_products for select to anon, authenticated using (active);

-- orders: a signed-in user places and sees only their own orders
create policy or_ins  on public.hz_orders for insert to authenticated with check (user_id = auth.uid() and status = 'placed');
create policy or_read on public.hz_orders for select to authenticated using (user_id = auth.uid());

grant select on public.hz_products to anon, authenticated;
grant select, insert, update, delete on public.hz_families, public.hz_children, public.hz_members, public.hz_sessions,
  public.hz_activity_logs, public.hz_rewards, public.hz_redemptions to authenticated;
grant select, insert on public.hz_orders to authenticated;

-- ───────────────────────── sample shop products (only if empty) ─────────────────────────
insert into public.hz_products (name, description, category, emoji, price_inr, mrp_inr, age_label, sort)
select * from (values
  ('Grow-Your-Own Veggie Kit', 'Coco-peat discs, 4 seed packets (tomato, chilli, spinach, coriander), biodegradable pots and a picture guide.', 'Gardening', '🍅', 499, 649, '5+ yrs', 10),
  ('Kids Garden Tool Set', 'Child-sized trowel, rake, watering can and gloves.', 'Gardening', '🪴', 699, 899, '4+ yrs', 20),
  ('Microgreens Starter Kit', 'Grow mustard, methi and radish microgreens on a windowsill in 7 days.', 'Gardening', '🌱', 349, 449, '4+ yrs', 30),
  ('Butterfly Garden Seed Mix', 'Marigold, zinnia and cosmos seeds that attract butterflies and bees.', 'Gardening', '🌼', 199, 249, '3+ yrs', 40),
  ('Clay Modelling Kit', 'Air-dry clay in 8 colours with shaping tools.', 'Craft', '🎨', 399, 499, '4+ yrs', 50),
  ('Junior Science Lab', '20 safe experiments: volcano, crystals, magnets and more.', 'Science', '🔬', 899, 1199, '7+ yrs', 60),
  ('Family Board Game Pack', 'Three classic board games for screen-free family evenings.', 'Family', '🎲', 799, 999, '5+ yrs', 70),
  ('Story & Drawing Journal', 'Prompts to write stories and draw — one page a day.', 'Reading', '📓', 249, 299, '6+ yrs', 80)
) as v(name, description, category, emoji, price_inr, mrp_inr, age_label, sort)
where not exists (select 1 from public.hz_products);
