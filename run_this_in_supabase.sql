-- Run this in your Supabase SQL Editor

-- 1. Create the `monthly_budgets` table
create table if not exists public.monthly_budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null, -- Format: 'YYYY-MM'
  total_budget numeric(12, 2) not null,
  created_at timestamptz default now(),
  unique(user_id, month) -- Prevent duplicate budget entries for the same month
);

-- Enable RLS for `monthly_budgets`
alter table public.monthly_budgets enable row level security;

create policy "Users can view own budgets"
  on public.monthly_budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert own budgets"
  on public.monthly_budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on public.monthly_budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete own budgets"
  on public.monthly_budgets for delete
  using (auth.uid() = user_id);

-- 2. Add `month` column to `transactions` table (if it doesn't already exist)
do $$
begin
  if not exists (select 1 from information_schema.columns 
                 where table_schema='public' and table_name='transactions' and column_name='month') then
    alter table public.transactions add column month text not null default to_char(current_date, 'YYYY-MM');
  end if;
end $$;

-- 3. Create the `telegram_users` table
create table if not exists public.telegram_users (
  id uuid default uuid_generate_v4() primary key,
  telegram_id bigint unique not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.telegram_users enable row level security;

create policy "Users can manage own telegram account"
  on public.telegram_users for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Create `telegram_link_codes` table
create table if not exists public.telegram_link_codes (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  expires_at timestamptz not null default now() + interval '10 minutes',
  used boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.telegram_link_codes enable row level security;

create policy "Users can insert own link codes"
  on public.telegram_link_codes for insert
  with check (auth.uid() = user_id);

create policy "Users can view own link codes"
  on public.telegram_link_codes for select
  using (auth.uid() = user_id);
