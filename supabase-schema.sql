-- Fly Fishing App — Supabase schema
-- Run this once: Supabase Dashboard > SQL Editor > New query > paste all of this > Run.
-- Safe to re-run; uses "if not exists" / "drop policy if exists".

-- ───────────────────────── RIVERS ─────────────────────────
create table if not exists rivers (
  id                text,
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text,
  state             text,
  section           text,
  site_code         text,
  source            text,
  lat               double precision,
  lon               double precision,
  favorite          boolean default false,
  custom            boolean default false,
  water_type        text,
  last_cfs          double precision,
  prev_cfs          double precision,
  last_elevation_ft double precision,
  last_water_temp_f double precision,
  last_reading_at   text,
  last_flow_pctl    double precision,
  ideal_flow_min    double precision,
  ideal_flow_max    double precision,
  notes             text,
  updated_at        timestamptz default now(),
  deleted           boolean default false,
  primary key (user_id, id)
);

-- If the rivers table already exists from an earlier run, add the new columns:
alter table rivers add column if not exists water_type        text;
alter table rivers add column if not exists last_elevation_ft double precision;
alter table rivers add column if not exists last_flow_pctl    double precision;
alter table rivers add column if not exists ideal_flow_min    double precision;
alter table rivers add column if not exists ideal_flow_max    double precision;

-- ───────────────────────── TRIPS ──────────────────────────
create table if not exists trips (
  id              text,
  user_id         uuid not null references auth.users(id) on delete cascade,
  date            bigint,
  river_id        text,
  river_name      text,
  location_label  text,
  lat             double precision,
  lon             double precision,
  flow_cfs        double precision,
  water_temp_f    double precision,
  gauge_height_ft double precision,
  air_temp_f      double precision,
  wind_mph        double precision,
  wind_dir        double precision,
  pressure_hpa    double precision,
  precip_in       double precision,
  cloud_pct       double precision,
  humidity        double precision,
  flies_used      text,
  leader_setup    text,
  fish_landed     integer,
  biggest         double precision,
  notes           text,
  memo_count      integer,
  data_source     text,
  elevation_ft    double precision,
  water_type      text,
  gear_uids       text,
  fly_uids        text,
  photos          text,
  updated_at      timestamptz default now(),
  deleted         boolean default false,
  primary key (user_id, id)
);

-- If the trips table already exists from an earlier run, add the new columns:
alter table trips add column if not exists gear_uids    text;
alter table trips add column if not exists fly_uids     text;
alter table trips add column if not exists elevation_ft double precision;
alter table trips add column if not exists water_type   text;
alter table trips add column if not exists photos       text;

-- ───────────────────────── CATCHES ─────────────────────────
create table if not exists catches (
  id             text,
  user_id        uuid not null references auth.users(id) on delete cascade,
  trip_uid       text,
  river_uid      text,
  fly_uid        text,
  caught_at      bigint,
  species        text,
  length_in      double precision,
  weight_lb      double precision,
  photo_data_url text,
  notes          text,
  updated_at     timestamptz default now(),
  deleted        boolean default false,
  primary key (user_id, id)
);

-- ───────────────────────── FLIES ──────────────────────────
create table if not exists flies (
  id             text,
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text,
  type           text,
  sizes          text,
  color_variant  text,
  imitates       text,
  conditions     text,
  notes          text,
  favorite       boolean default false,
  retired        boolean default false,
  image_data_url text,
  updated_at     timestamptz default now(),
  deleted        boolean default false,
  primary key (user_id, id)
);

-- If the flies table already exists from an earlier run, add the new columns:
alter table flies add column if not exists color_variant text;
alter table flies add column if not exists retired       boolean default false;

-- ──────────────────────── LEADERS ─────────────────────────
create table if not exists leaders (
  id         text,
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text,
  situation  text,
  rod        text,
  length     text,
  taper      text,
  tippet     text,
  diagram    text,
  tips       text,
  updated_at timestamptz default now(),
  deleted    boolean default false,
  primary key (user_id, id)
);

-- ─────────────────────── USER PREFS ───────────────────────
-- Per-user app preferences (theme, etc.) synced across devices.
create table if not exists user_prefs (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  theme      text default 'earthStone',
  updated_at timestamptz default now()
);
alter table user_prefs enable row level security;
drop policy if exists "own prefs" on user_prefs;
create policy "own prefs" on user_prefs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ───────────────────────── GEAR ───────────────────────────
create table if not exists gear (
  id         text,
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text,
  type       text,
  brand      text,
  model      text,
  weight     text,
  length     text,
  notes      text,
  retired    boolean default false,
  updated_at timestamptz default now(),
  deleted    boolean default false,
  primary key (user_id, id)
);

-- If the gear table already exists from an earlier run, add the new columns:
alter table gear add column if not exists model  text;
alter table gear add column if not exists weight text;
alter table gear add column if not exists length text;

-- Migrate older installations from a global id primary key to a tenant-scoped
-- key. Deterministic seed ids can then safely exist for more than one user.
do $$
declare
  table_name text;
  pk_name text;
  pk_definition text;
begin
  foreach table_name in array array['rivers', 'trips', 'catches', 'flies', 'leaders', 'gear']
  loop
    pk_name := null;
    pk_definition := null;
    select conname, pg_get_constraintdef(oid)
      into pk_name, pk_definition
      from pg_constraint
     where conrelid = table_name::regclass and contype = 'p';

    if pk_definition = 'PRIMARY KEY (id)' then
      execute format('alter table %I drop constraint %I', table_name, pk_name);
      pk_name := null;
      pk_definition := null;
    end if;

    if pk_definition is null then
      execute format(
        'alter table %I add constraint %I primary key (user_id, id)',
        table_name,
        table_name || '_pkey'
      );
    end if;
  end loop;
end $$;

-- ───────────── Row Level Security: you only ever see your own data ─────────────
alter table rivers  enable row level security;
alter table trips   enable row level security;
alter table catches enable row level security;
alter table flies   enable row level security;
alter table leaders enable row level security;
alter table gear    enable row level security;

drop policy if exists "own rivers"  on rivers;
drop policy if exists "own trips"   on trips;
drop policy if exists "own catches" on catches;
drop policy if exists "own flies"   on flies;
drop policy if exists "own leaders" on leaders;
drop policy if exists "own gear"    on gear;

create policy "own rivers"  on rivers  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own trips"   on trips   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own catches" on catches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own flies"   on flies   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own leaders" on leaders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own gear"    on gear    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
