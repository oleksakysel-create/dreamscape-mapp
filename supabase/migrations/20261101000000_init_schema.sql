-- ════════════════════════════════════════════════════════════════════
-- DREAMSCAPE · 0001 · Core schema
-- Reference tables (seeded, read-only to clients) + per-user tables.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Helpers ───────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ── Reference data ────────────────────────────────────────────────────
create table public.life_spheres (
  id          text primary key,
  name        text not null,
  description text not null,
  color       text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon        text not null,
  sort_order  smallint not null unique
);

create table public.months (
  id                 smallint primary key check (id between 1 and 12),
  title              text not null,
  subtitle           text not null,
  description        text not null,
  action_prompt      text not null,
  gallery_categories text[] not null default '{}'
);

create table public.reflection_tasks (
  id         text primary key,
  month_id   smallint not null references public.months(id) on delete cascade,
  prompt     text not null,
  hint       text not null default '',
  kind       text not null check (kind in ('text', 'scale')),
  sort_order smallint not null,
  unique (month_id, sort_order)
);

create table public.coloring_images (
  id           text primary key,
  title        text not null,
  category     text not null check (category in ('mandala','nature','ocean','geometric','botanical','cosmos')),
  difficulty   text not null check (difficulty in ('gentle','flowing','intricate')),
  description  text not null,
  region_count integer not null check (region_count > 0),
  storage_path text not null
);

create table public.achievements (
  id          text primary key,
  title       text not null,
  description text not null,
  icon        text not null,
  category    text not null
);

-- ── Per-user data ─────────────────────────────────────────────────────
create table public.users (
  id                       uuid primary key references auth.users(id) on delete cascade,
  display_name             text check (char_length(display_name) <= 60),
  identity                 text,
  pronouns                 text,
  age_range                text,
  journey_start            date,
  onboarded_at             timestamptz,
  priorities_updated_count integer not null default 0,
  settings                 jsonb not null default '{"analytics": true, "reminders": true}'::jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create table public.life_assessments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  assessment_key text not null,
  sphere_id      text not null references public.life_spheres(id),
  score          smallint not null check (score between 1 and 10),
  taken_at       timestamptz not null default now(),
  unique (user_id, assessment_key, sphere_id)
);
create index life_assessments_user_idx on public.life_assessments (user_id, taken_at);

create table public.user_priorities (
  user_id    uuid not null references public.users(id) on delete cascade,
  sphere_id  text not null references public.life_spheres(id),
  tier       text not null check (tier in ('focus', 'maintain', 'backlog')),
  updated_at timestamptz not null default now(),
  primary key (user_id, sphere_id)
);

create table public.user_goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  sphere_id  text not null references public.life_spheres(id),
  title      text not null check (char_length(title) <= 200),
  why        text not null default '',
  first_step text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, sphere_id)
);

create table public.user_reflections (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  month_id     smallint not null references public.months(id),
  answers      jsonb not null default '{}'::jsonb,  -- { [reflection_task_id]: answer }
  summary      jsonb,                                -- output of the summarization layer
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  unique (user_id, month_id)
);

create table public.planned_actions (
  id                      text not null,              -- client-generated id (offline-first)
  user_id                 uuid not null references public.users(id) on delete cascade,
  month_id                smallint not null references public.months(id),
  title                   text not null check (char_length(title) between 1 and 200),
  sphere_id               text references public.life_spheres(id),
  due_date                date not null,
  due_time                time not null,
  reminder                boolean not null default true,
  reminder_minutes_before integer not null default 15 check (reminder_minutes_before >= 0),
  notified_at             timestamptz,
  done_at                 timestamptz,
  created_at              timestamptz not null default now(),
  primary key (user_id, id)
);
create index planned_actions_due_idx on public.planned_actions (user_id, due_date);

create table public.monthly_colorings (
  user_id      uuid not null references public.users(id) on delete cascade,
  month_id     smallint not null references public.months(id),
  image_id     text not null references public.coloring_images(id),
  fills        jsonb not null default '{}'::jsonb,  -- { [region_id]: "#rrggbb" }
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, month_id)
);

create table public.user_achievements (
  user_id        uuid not null references public.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id),
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  action_id     text,
  kind          text not null check (kind in ('action_reminder', 'achievement', 'chapter')),
  title         text not null,
  scheduled_for timestamptz not null,
  sent_at       timestamptz,
  read_at       timestamptz,
  created_at    timestamptz not null default now(),
  unique (user_id, action_id, kind)
);
create index notifications_pending_idx on public.notifications (scheduled_for) where sent_at is null;

-- ── Triggers ──────────────────────────────────────────────────────────
create trigger users_touch before update on public.users for each row execute function public.touch_updated_at();
create trigger priorities_touch before update on public.user_priorities for each row execute function public.touch_updated_at();

-- Create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
