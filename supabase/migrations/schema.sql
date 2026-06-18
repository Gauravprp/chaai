-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables to start clean
drop table if exists 
  public.profiles, 
  public.workspaces,
  public.workspace_members,
  public.projects,
  public.teams,
  public.team_members,
  public.channels,
  public.messages,
  public.reactions,
  public.tasks,
  public.leave_requests,
  public.activity_logs,
  public.notifications cascade;

-- 1. Profiles Table
create table public.profiles (
  id uuid primary key,
  name text not null,
  email text,
  avatar_url text,
  role text,
  department text,
  timezone text default 'UTC',
  language text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- 2. Workspaces Table
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workspaces enable row level security;

-- Workspace Members
create table public.workspace_members (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (workspace_id, user_id)
);

alter table public.workspace_members enable row level security;

-- 3. Projects Table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.projects enable row level security;

-- 4. Teams Table
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.teams enable row level security;

-- Team Members
create table public.team_members (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (team_id, user_id)
);

alter table public.team_members enable row level security;

-- 5. Channels Table
create table public.channels (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  name text not null,
  is_private boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.channels enable row level security;

-- 6. Messages Table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  channel_id uuid references public.channels(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  message_type text default 'text' check (message_type in ('text', 'image', 'file', 'voice', 'system', 'ai')),
  media_url text,
  parent_id uuid references public.messages(id) on delete cascade, -- Slack-style threading
  original_content text, -- for AI rewrite trail
  ai_modified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

-- 7. Reactions Table
create table public.reactions (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references public.messages(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (message_id, user_id, emoji)
);

alter table public.reactions enable row level security;

-- 8. Tasks Table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'Todo' check (status in ('Todo', 'In Progress', 'Review', 'Done')),
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks enable row level security;

-- 9. Leave Requests Table
create table public.leave_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  leave_type text check (leave_type in ('Sick', 'Casual', 'Earned', 'Unpaid')) not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.leave_requests enable row level security;

-- 10. Activity Logs Table
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.activity_logs enable row level security;

-- 11. Notifications Table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  title text not null,
  content text not null,
  type text not null, -- 'mention', 'task', 'leave', 'message', 'project'
  read boolean default false,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;


-- =========================================================================
-- Helper Functions & Row-Level Security (RLS) Policies
-- =========================================================================

-- Workspace Membership check helper
create or replace function public.is_workspace_member(workspace_id uuid, user_id uuid)
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.workspace_members
    where workspace_members.workspace_id = is_workspace_member.workspace_id
      and workspace_members.user_id = is_workspace_member.user_id
  );
end;
$$ language plpgsql;

-- Team Membership check helper
create or replace function public.is_team_member(team_id uuid, user_id uuid)
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.team_members
    where team_members.team_id = is_team_member.team_id
      and team_members.user_id = is_team_member.user_id
  );
end;
$$ language plpgsql;

-- Channel Access helper
create or replace function public.has_channel_access(channel_id uuid, user_id uuid)
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.channels c
    join public.teams t on c.team_id = t.id
    join public.team_members tm on t.id = tm.team_id
    where c.id = has_channel_access.channel_id
      and tm.user_id = has_channel_access.user_id
  );
end;
$$ language plpgsql;

-- Profile Policies
create policy "Allow profile read for workspace co-members" on public.profiles
  for select using (true);

create policy "Allow user to update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Workspace Policies
create policy "Allow select workspaces if member" on public.workspaces
  for select using (public.is_workspace_member(id, auth.uid()));

create policy "Allow insert workspace by authenticated user" on public.workspaces
  for insert with check (auth.uid() = owner_id);

-- Workspace Member Policies
create policy "Allow select workspace members" on public.workspace_members
  for select using (public.is_workspace_member(workspace_id, auth.uid()));

-- Projects Policies
create policy "Allow select projects if member of workspace" on public.projects
  for select using (public.is_workspace_member(workspace_id, auth.uid()));

create policy "Allow insert projects if member of workspace" on public.projects
  for insert with check (public.is_workspace_member(workspace_id, auth.uid()));

-- Teams Policies
create policy "Allow select teams if member of workspace" on public.teams
  for select using (exists (
    select 1 from public.projects p
    where p.id = project_id and public.is_workspace_member(p.workspace_id, auth.uid())
  ));

-- Channels Policies
create policy "Allow select channels if member of team" on public.channels
  for select using (public.is_team_member(team_id, auth.uid()));

-- Messages Policies
create policy "Allow select messages if has channel access" on public.messages
  for select using (public.has_channel_access(channel_id, auth.uid()));

create policy "Allow insert messages if has channel access" on public.messages
  for insert with check (
    public.has_channel_access(channel_id, auth.uid())
    and auth.uid() = user_id
  );


-- =========================================================================
-- Smart Project Creation Trigger Function
-- =========================================================================

create or replace function public.after_project_insert()
returns trigger security definer as $$
declare
  new_team_id uuid;
  new_channel_id uuid;
  member_record record;
begin
  -- 1. Create a Default Team
  insert into public.teams (project_id, name)
  values (new.id, new.name || ' Core')
  returning id into new_team_id;

  -- Add all workspace members to the new team automatically
  for member_record in
    select user_id from public.workspace_members where workspace_id = new.workspace_id
  loop
    insert into public.team_members (team_id, user_id)
    values (new_team_id, member_record.user_id)
    on conflict do nothing;
  end loop;

  -- 2. Create the General Channel
  insert into public.channels (team_id, name, is_private)
  values (new_team_id, 'general', false)
  returning id into new_channel_id;

  -- 3. Create Welcome System Message
  insert into public.messages (channel_id, user_id, content, message_type)
  values (
    new_channel_id,
    new.workspace_id, 
    'Welcome to the general channel of project: ' || new.name || '! 🚀 Feel free to start collaborating here.',
    'system'
  );

  -- 4. Create Activity Feed Log
  insert into public.activity_logs (workspace_id, user_id, action, details)
  values (
    new.workspace_id,
    new.workspace_id, 
    'project_created',
    jsonb_build_object('project_id', new.id, 'project_name', new.name)
  );

  return new;
end;
$$ language plpgsql;

create trigger tr_after_project_insert
  after insert on public.projects
  for each row execute function public.after_project_insert();
