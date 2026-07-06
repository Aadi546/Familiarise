create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  pin char(4) check (pin ~ '^[0-9]{4}$'),
  pin_hash text,
  avatar_url text,
  birthday date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table users add column if not exists pin_hash text;
alter table users add column if not exists birthday date;
alter table users alter column pin drop not null;

create unique index if not exists users_full_name_unique_idx
  on users (lower(full_name));

create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists family_members (
  user_id uuid not null references users(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, family_id)
);

create table if not exists media_files (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  uploaded_by uuid not null references users(id) on delete cascade,
  r2_key text not null unique,
  public_url text not null,
  file_type text not null,
  file_size bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  content text not null default '',
  media_file_id uuid references media_files(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint messages_content_or_media_chk check (length(trim(content)) > 0 or media_file_id is not null)
);

create index if not exists messages_family_created_idx
  on messages (family_id, created_at desc);

create table if not exists message_reactions (
  message_id uuid not null references messages(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  emoji text not null check (emoji in ('heart', 'thumbs_up', 'laugh', 'pray')),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  content text not null,
  priority text not null default 'normal' check (priority in ('normal', 'important', 'urgent')),
  is_pinned boolean not null default false,
  media_file_id uuid references media_files(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table notices add column if not exists is_pinned boolean not null default false;

create index if not exists notices_family_created_idx
  on notices (family_id, created_at desc);

create table if not exists message_reads (
  message_id uuid not null references messages(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

create table if not exists notice_reads (
  notice_id uuid not null references notices(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notice_id, user_id)
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

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at
before update on users
for each row execute procedure set_updated_at();

alter table users enable row level security;
alter table families enable row level security;
alter table family_members enable row level security;
alter table media_files enable row level security;
alter table messages enable row level security;
alter table notices enable row level security;
alter table message_reads enable row level security;
alter table notice_reads enable row level security;
alter table message_reactions enable row level security;
alter table reminders enable row level security;
alter table push_subscriptions enable row level security;

grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
alter default privileges in schema public grant all privileges on tables to service_role;
alter default privileges in schema public grant all privileges on sequences to service_role;

-- The Express backend uses the service role key and bypasses RLS.
-- Public anon access should remain locked down for this MVP.
