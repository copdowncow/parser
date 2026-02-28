create table if not exists jobs (
  id uuid primary key,
  title text not null,
  description text not null,
  source text not null,
  url text not null unique,
  technologies jsonb not null,
  budget numeric,
  language text,
  published_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists analysis (
  job_id uuid primary key references jobs(id) on delete cascade,
  project_type text not null,
  difficulty text not null,
  competition_level text not null,
  urgency_score int not null,
  relevance_score int not null,
  opportunity_score int not null,
  opportunity_breakdown jsonb not null,
  analyzed_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key,
  skills jsonb not null,
  preferred_stack jsonb not null,
  min_budget numeric,
  notification_settings jsonb not null,
  created_at timestamptz not null default now()
);
