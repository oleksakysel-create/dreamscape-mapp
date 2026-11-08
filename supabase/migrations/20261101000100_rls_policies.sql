-- ════════════════════════════════════════════════════════════════════
-- DREAMSCAPE · 0002 · Row Level Security
-- Reference tables: world-readable, never writable by clients.
-- User tables: a row is visible/writable only by its owner.
-- ════════════════════════════════════════════════════════════════════

alter table public.life_spheres      enable row level security;
alter table public.months            enable row level security;
alter table public.reflection_tasks  enable row level security;
alter table public.coloring_images   enable row level security;
alter table public.achievements      enable row level security;

create policy "reference: read" on public.life_spheres     for select to anon, authenticated using (true);
create policy "reference: read" on public.months           for select to anon, authenticated using (true);
create policy "reference: read" on public.reflection_tasks for select to anon, authenticated using (true);
create policy "reference: read" on public.coloring_images  for select to anon, authenticated using (true);
create policy "reference: read" on public.achievements     for select to anon, authenticated using (true);

alter table public.users enable row level security;
create policy "users: own row" on public.users
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

do $$
declare t text;
begin
  foreach t in array array[
    'life_assessments', 'user_priorities', 'user_goals', 'user_reflections',
    'planned_actions', 'monthly_colorings', 'user_achievements', 'notifications'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "owner: all" on public.%I for all to authenticated
         using ((select auth.uid()) = user_id)
         with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- Achievements may only reference existing achievements (FK) and cannot be
-- back-dated into the future.
alter table public.user_achievements
  add constraint user_achievements_not_future check (unlocked_at <= now() + interval '1 day');

-- ── Storage: public, read-only bucket for coloring SVGs ───────────────
insert into storage.buckets (id, name, public)
values ('coloring', 'coloring', true)
on conflict (id) do nothing;

create policy "coloring: public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'coloring');
