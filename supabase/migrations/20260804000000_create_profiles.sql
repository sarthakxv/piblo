-- Learner profiles: one row per auth user, created from the onboarding step
-- after Google sign-in. More learner-data tables will follow in later migrations.

create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    name text not null check (char_length(name) between 1 and 80),
    date_of_birth date not null,
    email text,
    avatar_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by their owner"
    on public.profiles for select
    using ((select auth.uid()) = id);

create policy "Profiles are insertable by their owner"
    on public.profiles for insert
    with check ((select auth.uid()) = id);

create policy "Profiles are updatable by their owner"
    on public.profiles for update
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);

create or replace function public.touch_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_touch_updated_at
    before update on public.profiles
    for each row execute function public.touch_profiles_updated_at();
