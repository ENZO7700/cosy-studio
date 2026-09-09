-- COSY Studio M1+M2 schema. Auth is off: rows are unowned (no user_id).
-- Later engines (risks, tasks, generated files, builds) get tables now, unused.

create table if not exists organizations (
  id text primary key,
  name text not null,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id text primary key,
  organization_id text not null references organizations(id),
  name text not null,
  source_type text not null,
  status text not null default 'draft',
  target_stack text,
  scope text,
  readiness_score integer,
  risk_level text,
  is_demo boolean not null default false,
  idea_brief text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_org_idx on projects (organization_id);
create index if not exists projects_updated_idx on projects (updated_at desc);

create table if not exists source_imports (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  filename text,
  source_url text,
  checksum text,
  imported_at timestamptz not null default now(),
  validation_status text not null,
  import_metadata jsonb not null default '{}'::jsonb,
  error_message text
);

create index if not exists source_imports_project_idx on source_imports (project_id);

create table if not exists blueprints (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  version integer not null default 1,
  data jsonb not null,
  content_hash text,
  created_at timestamptz not null default now()
);

create index if not exists blueprints_project_idx on blueprints (project_id);

create table if not exists evidence_items (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  category text not null,
  label text not null,
  value text,
  confidence numeric,
  source_reference text,
  state text not null default 'detected',
  notes text
);

create index if not exists evidence_items_project_idx on evidence_items (project_id);

create table if not exists architecture_nodes (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  parent_id text,
  category text not null,
  title text not null,
  data jsonb not null default '{}'::jsonb,
  state text not null default 'draft'
);

create table if not exists risks (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  severity text not null,
  score integer,
  confidence numeric,
  evidence text,
  mitigation text,
  status text not null default 'open'
);

create table if not exists tasks (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  phase text,
  title text not null,
  description text,
  priority text,
  estimate_hours numeric,
  dependencies jsonb not null default '[]'::jsonb,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  status text not null default 'todo'
);

create table if not exists generated_files (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  path text not null,
  code text not null,
  language text,
  version integer not null default 1,
  generated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists build_runs (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  status text not null,
  command text,
  stdout text,
  stderr text,
  exit_code integer,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists project_versions (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  label text,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists export_artifacts (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  type text not null,
  storage_ref text,
  created_at timestamptz not null default now()
);

create table if not exists activity_events (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  actor text not null default 'system',
  type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_project_idx on activity_events (project_id, created_at desc);

insert into organizations (id, name, plan)
values ('org-cosy-demo', 'COSY Demo Workspace', 'studio')
on conflict (id) do nothing;

insert into projects (
  id, organization_id, name, source_type, status, target_stack, scope,
  readiness_score, risk_level, is_demo, idea_brief
) values (
  'demo-iluminat',
  'org-cosy-demo',
  'ILUMINAT Agency Site',
  'blueprint_zip',
  'blueprint_ready',
  'next_ts_tailwind',
  'frontend_rebuild',
  62,
  'elevated',
  true,
  null
) on conflict (id) do nothing;

insert into source_imports (
  id, project_id, filename, source_url, checksum, validation_status, import_metadata
) values (
  'imp-demo-iluminat',
  'demo-iluminat',
  'iluminat-blueprint.zip',
  'https://example.com/iluminat',
  'demo-hash-iluminat',
  'valid',
  '{"files":["blueprint.json","manifest.json","index.html"],"demo":true}'::jsonb
) on conflict (id) do nothing;

insert into blueprints (id, project_id, version, data, content_hash)
values (
  'bp-demo-iluminat',
  'demo-iluminat',
  1,
  '{
    "version": "1.0",
    "sourceUrl": "https://example.com/iluminat",
    "finalUrl": "https://example.com/iluminat",
    "capturedAt": "2026-08-29T10:00:00.000Z",
    "limitations": ["Public frontend only", "No private API contracts"],
    "warnings": ["Elementor globals inferred from CSS variables", "Plugin list is HTML evidence, not wp-admin"],
    "techSignals": [{"name": "WordPress", "confidence": 0.96}, {"name": "Elementor", "confidence": 0.91}, {"name": "Astra Child", "confidence": 0.74}],
    "designTokens": {"colors": {"accent": "#D8A84B", "canvas": "#08090A", "text": "#F6F4EF"}, "fonts": {"body": "Inter"}},
    "forms": [{"name": "Contact", "fields": 5, "action": "/contact"}],
    "wordpress": {"core": "6.4.3", "theme": "Astra Child", "pluginsActive": 23, "templates": 42, "customFields": 57},
    "pages": [{"path": "/", "title": "Home"}, {"path": "/work", "title": "Work"}, {"path": "/contact", "title": "Contact"}]
  }'::jsonb,
  'demo-hash-iluminat'
) on conflict (id) do nothing;

insert into evidence_items (id, project_id, category, label, value, confidence, source_reference, state) values
  ('ev-demo-1', 'demo-iluminat', 'platform', 'WordPress core', '6.4.3', 0.96, 'html:generator,rest-root', 'detected'),
  ('ev-demo-2', 'demo-iluminat', 'theme', 'Theme', 'Astra Child', 0.74, 'html:body-class', 'inferred'),
  ('ev-demo-3', 'demo-iluminat', 'plugins', 'Active plugins (HTML evidence)', '23', 0.61, 'html:plugin-assets', 'inferred'),
  ('ev-demo-4', 'demo-iluminat', 'elementor', 'Elementor', 'present', 0.91, 'html:data-elementor', 'detected'),
  ('ev-demo-5', 'demo-iluminat', 'forms', 'Public forms', '1 contact form', 0.88, 'html:form', 'detected'),
  ('ev-demo-6', 'demo-iluminat', 'tokens', 'Accent color', '#D8A84B', 0.8, 'css:--e-global-color-primary', 'detected'),
  ('ev-demo-7', 'demo-iluminat', 'limitation', 'Private APIs', 'Not captured', 1, 'policy', 'confirmed')
on conflict (id) do nothing;

insert into activity_events (id, project_id, actor, type, message, metadata)
values (
  'act-demo-1',
  'demo-iluminat',
  'system',
  'seed',
  'Demo project seeded with a labeled Blueprint snapshot.',
  '{"demo":true}'::jsonb
) on conflict (id) do nothing;
