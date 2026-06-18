-- Drop legacy table if exists to start clean
drop table if exists public.direct_messages cascade;

-- 1. Create the direct_messages table
create table if not exists public.direct_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id text not null,
  receiver_id text not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create index on sender_id and receiver_id for fast conversation queries
create index if not exists idx_direct_messages_participants 
on public.direct_messages (sender_id, receiver_id);

-- 3. Create index on created_at for history ordering
create index if not exists idx_direct_messages_created_at
on public.direct_messages (created_at desc);

-- 4. Enable Realtime replication for direct_messages
alter publication supabase_realtime add table public.direct_messages;
