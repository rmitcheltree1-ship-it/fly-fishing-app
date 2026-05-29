-- Fly Fishing App — Supabase schema
-- Run this once: Supabase Dashboard > SQL Editor > New query > paste all of this > Run.
-- Safe to re-run; uses "if not exists" / "drop policy if exists".

-- ───────────────────────── RIVERS ─────────────────────────
create table if not exists rivers (
  id                text primary key,
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
  last_cfs          double precision,
  prev_cfs          double precision,
  last_water_temp_f double precision,
  last_reading_at   text,
  notes             text,
  updated_at        timestamptz default now(),
  deleted           boolean default false
);

-- ───────────────────────── TRIPS ──────────────────────────
create table if not exists trips (
  id              text primary key,
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
  gear_uids       text,
  updated_at      timestamptz default now(),
  deleted         boolean default false
);

-- If the trips table already exists from an earlier run, add the new column:
alter table trips add column if not exists gear_uids text;

-- ───────────────────────── FLIES ──────────────────────────
create table if not exists flies (
  id             text primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text,
  type           text,
  sizes          text,
  imitates       text,
  conditions     text,
  notes          text,
  favorite       boolean default false,
  image_data_url text,
  updated_at     timestamptz default now(),
  deleted        boolean default false
);

-- ──────────────────────── LEADERS ─────────────────────────
create table if not exists leaders (
  id         text primary key,
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
  deleted    boolean default false
);

-- ───────────────────────── GEAR ───────────────────────────
create table if not exists gear (
  id         text primary key,
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
  deleted    boolean default false
);

-- If the gear table already exists from an earlier run, add the new columns:
alter table gear add column if not exists model  text;
alter table gear add column if not exists weight text;
alter table gear add column if not exists length text;

-- ───────────── Row Level Security: you only ever see your own data ─────────────
alter table rivers  enable row level security;
alter table trips   enable row level security;
alter table flies   enable row level security;
alter table leaders enable row level security;
alter table gear    enable row level security;

drop policy if exists "own rivers"  on rivers;
drop policy if exists "own trips"   on trips;
drop policy if exists "own flies"   on flies;
drop policy if exists "own leaders" on leaders;
drop policy if exists "own gear"    on gear;

create policy "own rivers"  on rivers  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own trips"   on trips   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own flies"   on flies   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own leaders" on leaders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own gear"    on gear    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
