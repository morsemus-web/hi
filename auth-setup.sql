-- ═══════════════════════════════════════════════
-- ScoreDeck Auth & Subscriptions — Supabase schema
-- Run in the Supabase SQL Editor after supabase-setup.sql
-- ═══════════════════════════════════════════════

create table if not exists profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  ads_free_until        timestamptz,
  dodo_customer_id      text,
  dodo_subscription_id  text,
  tier                  text default 'free',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_profiles_email on profiles (email);

alter table profiles enable row level security;

create policy "Users read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, ads_free_until, tier)
  values (
    new.id,
    new.email,
    now() + interval '30 days',
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profiles_updated on profiles;
create trigger on_profiles_updated
  before update on profiles
  for each row execute procedure public.touch_profile_updated_at();
