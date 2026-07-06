# Family Hub

Private, invite-only family communication PWA with realtime chat, a noticeboard, Supabase Postgres, and Cloudflare R2 media uploads.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Supabase Realtime, vite-plugin-pwa
- Backend: Node.js, Express, Supabase service client, Cloudflare R2 signed uploads
- Database: Supabase Postgres
- Storage: Cloudflare R2

## Setup

1. Create a Supabase project.
2. Run `backend/supabase_schema.sql` in the Supabase SQL editor.
3. Create a Cloudflare R2 bucket and API token with object write/read access.
4. Copy environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

5. Fill in the environment values.
6. Start the backend:

```bash
cd backend
npm install
npm run dev
```

7. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Demo Data

After running the schema, add users manually in Supabase. PINs are stored as 4-digit strings for this MVP.

```sql
insert into families (name) values ('The Smiths');

insert into users (full_name, pin, avatar_url)
values
  ('Jane Smith', '1234', null),
  ('Robert Smith', '2468', null);

insert into family_members (user_id, family_id, role)
select u.id, f.id, 'admin'
from users u, families f
where u.full_name = 'Jane Smith' and f.name = 'The Smiths';

insert into family_members (user_id, family_id, role)
select u.id, f.id, 'member'
from users u, families f
where u.full_name = 'Robert Smith' and f.name = 'The Smiths';
```

## Notes

- There is no public sign-up.
- Login is intentionally simple: full name + 4-digit PIN.
- The backend uses the Supabase service role key, so keep it server-side only.
- R2 uploads use short-lived signed URLs. The browser uploads files directly to R2.
- Cloudflare R2 setup instructions are in `backend/R2_SETUP.md`.

## Current App Features

- Mobile-first PWA with installable app shell.
- Private PIN login for pre-added family members.
- Home dashboard with quick actions.
- Realtime family chat with online presence, typing indicators, timestamps, and date separators.
- Noticeboard with admin-only posting and priority labels.
- Photo/video upload UI, disabled until Cloudflare R2 is configured.
- Reliable family calls through a Jitsi call launcher.
- Optional custom WebRTC/TURN support remains in backend hooks, but Jitsi is recommended for first family testing.
- Optional web push notification hooks with VAPID keys.
- Profile photos, birthdays, and family reminders.

## Calls Note

The Calls page opens a shared Jitsi room. This avoids TURN setup and usually gives a better first experience for family members.

For push notifications, configure:

```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
```

Run `backend/migrations/2026-07-06-family-features.sql` in Supabase, then run `npm run hash:pins` from `backend` to migrate existing plain PINs to hashed PINs.
