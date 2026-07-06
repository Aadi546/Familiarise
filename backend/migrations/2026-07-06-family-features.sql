alter table users add column if not exists pin_hash text;
alter table users add column if not exists birthday date;
alter table users alter column pin drop not null;

alter table notices add column if not exists is_pinned boolean not null default false;

create table if not exists message_reactions (
  message_id uuid not null references messages(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  emoji text not null check (emoji in ('heart', 'thumbs_up', 'laugh', 'pray')),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  title text not null,
  details text,
  remind_on date not null,
  created_at timestamptz not null default now()
);

create index if not exists reminders_family_date_idx
  on reminders (family_id, remind_on asc);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

alter table message_reactions enable row level security;
alter table reminders enable row level security;
alter table push_subscriptions enable row level security;

grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
