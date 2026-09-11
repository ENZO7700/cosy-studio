-- COSY Studio M3–M8 tables. Auth stays off: unowned workspace rows.

create table if not exists organization_members (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  display_name text not null,
  role text not null,
  created_at timestamptz not null default now()
);

create index if not exists organization_members_org_idx on organization_members (organization_id);

create table if not exists canvas_messages (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  role text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists canvas_messages_project_idx on canvas_messages (project_id, created_at);

create table if not exists billing_events (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  provider text not null,
  plan text not null,
  note text,
  created_at timestamptz not null default now()
);

insert into organization_members (id, organization_id, display_name, role)
values
  ('mem-demo-owner', 'org-cosy-demo', 'Workspace operator', 'owner'),
  ('mem-demo-reviewer', 'org-cosy-demo', 'Agency reviewer', 'reviewer')
on conflict (id) do nothing;
