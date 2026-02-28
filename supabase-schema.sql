-- Supabase Postgres schema for the multi-stage interview platform
-- This file can be run in Supabase SQL editor or as a migration.

-- Enable UUIDs if not already enabled
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================
-- Enums
-- =========================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'job_publish_state') then
    create type job_publish_state as enum ('draft', 'published', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'job_stage_type') then
    create type job_stage_type as enum ('behavioral', 'coding', 'case', 'leadership');
  end if;
  if not exists (select 1 from pg_type where typname = 'ai_usage_policy') then
    create type ai_usage_policy as enum ('allowed', 'not_allowed', 'limited');
  end if;
  if not exists (select 1 from pg_type where typname = 'proctoring_policy') then
    create type proctoring_policy as enum ('relaxed', 'moderate', 'strict', 'exam');
  end if;
  if not exists (select 1 from pg_type where typname = 'question_source') then
    create type question_source as enum ('employer_only', 'hybrid', 'ai_only');
  end if;
  if not exists (select 1 from pg_type where typname = 'distribution_channel') then
    create type distribution_channel as enum ('linkedin', 'seek', 'aegishire_public');
  end if;
  if not exists (select 1 from pg_type where typname = 'distribution_status') then
    create type distribution_status as enum ('draft', 'queued', 'posted', 'updated', 'closed', 'error');
  end if;
  if not exists (select 1 from pg_type where typname = 'focus_event_type') then
    create type focus_event_type as enum ('focus_lost', 'focus_gained', 'visibility_hidden', 'visibility_visible');
  end if;
  if not exists (select 1 from pg_type where typname = 'interview_session_status') then
    create type interview_session_status as enum ('active', 'completed', 'abandoned', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'employer_role') then
    create type employer_role as enum ('admin', 'recruiter', 'hiring_manager');
  end if;
  if not exists (select 1 from pg_type where typname = 'tool_type') then
    create type tool_type as enum ('scratchpad', 'reference_summarizer', 'code_helper', 'prompt_coach');
  end if;
  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type application_status as enum (
      'invited', 'applied', 'screening', 'in_interview', 'completed', 'offered', 'rejected', 'withdrawn'
    );
  end if;
end $$;

-- =========================
-- Core employer + job schema
-- =========================

create table if not exists public.employer_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  company_name text not null,
  role employer_role not null default 'admin',
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: add new columns to existing table without breaking
alter table public.employer_users add column if not exists full_name text;
alter table public.employer_users add column if not exists avatar_url text;
alter table public.employer_users add column if not exists phone text;
alter table public.employer_users add column if not exists updated_at timestamptz default now();

create table if not exists public.job_profiles (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employer_users (id) on delete cascade,
  title text not null,
  company_name text not null,
  location text,
  description text not null,
  seniority text not null,
  category text,
  must_have_skills text[] default '{}'::text[],
  pipeline_config jsonb,
  publish_state job_publish_state not null default 'draft',
  public_slug text unique,
  rubric_json jsonb,
  stage_plan_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_profiles add column if not exists category text;

create index if not exists job_profiles_employer_id_idx
  on public.job_profiles (employer_id);

create table if not exists public.job_stages (
  id uuid primary key default gen_random_uuid(),
  job_profile_id uuid not null references public.job_profiles (id) on delete cascade,
  index integer not null,
  type job_stage_type not null,
  duration_minutes integer,
  ai_usage_policy ai_usage_policy not null default 'allowed',
  proctoring_policy proctoring_policy not null default 'relaxed',
  competencies text[],
  stage_weights jsonb,
  interviewer_voice_id text,
  question_source question_source not null default 'employer_only',
  created_at timestamptz not null default now(),
  unique (job_profile_id, index)
);

create index if not exists job_stages_job_profile_id_idx
  on public.job_stages (job_profile_id);

create table if not exists public.stage_question_bank (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employer_users (id) on delete cascade,
  job_stage_id uuid references public.job_stages (id) on delete set null,
  job_profile_id uuid references public.job_profiles (id) on delete set null,
  question_text text not null,
  category text,
  difficulty text,
  mandatory boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stage_question_bank_employer_idx
  on public.stage_question_bank (employer_id);

create index if not exists stage_question_bank_job_stage_idx
  on public.stage_question_bank (job_stage_id);

create table if not exists public.job_distribution_status (
  id uuid primary key default gen_random_uuid(),
  job_profile_id uuid not null references public.job_profiles (id) on delete cascade,
  channel distribution_channel not null,
  status distribution_status not null default 'draft',
  external_job_id text,
  last_payload jsonb,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_profile_id, channel)
);

create index if not exists job_distribution_status_job_profile_idx
  on public.job_distribution_status (job_profile_id);

create table if not exists public.public_job_views (
  id uuid primary key default gen_random_uuid(),
  job_profile_id uuid not null references public.job_profiles (id) on delete cascade,
  public_id text not null unique,
  last_viewed_at timestamptz,
  view_count integer default 0,
  analytics jsonb,
  created_at timestamptz not null default now()
);

create index if not exists public_job_views_job_profile_idx
  on public.public_job_views (job_profile_id);

-- =========================
-- Candidate user profile (one row per person)
-- =========================

create table if not exists public.candidate_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  phone text,
  profile_summary text,
  resume_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candidate_users_email_idx on public.candidate_users (email);

-- =========================
-- Job applications: links candidate to job with status and stage
-- (invited, applied, in interview, selected, rejected, etc.)
-- =========================

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  candidate_user_id uuid not null references public.candidate_users (id) on delete cascade,
  job_profile_id uuid not null references public.job_profiles (id) on delete cascade,
  status application_status not null default 'applied',
  current_stage_index integer,
  invited_at timestamptz,
  applied_at timestamptz,
  rejected_at timestamptz,
  offered_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_user_id, job_profile_id)
);

create index if not exists job_applications_candidate_user_id_idx
  on public.job_applications (candidate_user_id);
create index if not exists job_applications_job_profile_id_idx
  on public.job_applications (job_profile_id);
create index if not exists job_applications_status_idx
  on public.job_applications (status);

-- =========================
-- Legacy jobs table (for candidates.job_id; app also has job_profiles)
-- =========================

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company_name text not null,
  location text,
  description text not null,
  seniority text not null,
  must_have_skills text[] default '{}'::text[],
  stages jsonb,
  created_at timestamptz not null default now()
);

-- =========================
-- Candidate + interview side
-- =========================

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  job_profile_id uuid references public.job_profiles (id),
  name text not null,
  email text not null,
  education text,
  experience_summary text,
  resume_text text,
  status text not null default 'applied',
  fit_score numeric,
  fit_justification text,
  matched_skills text[],
  missing_skills text[],
  stage_results jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Add job_profile_id if table already existed without it
alter table public.candidates
  add column if not exists job_profile_id uuid references public.job_profiles (id);
-- Link legacy candidate row to candidate_users when migrating
alter table public.candidates
  add column if not exists candidate_user_id uuid references public.candidate_users (id);

create table if not exists public.focus_events (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates (id) on delete set null,
  job_profile_id uuid references public.job_profiles (id) on delete set null,
  stage_id uuid references public.job_stages (id) on delete set null,
  event_type focus_event_type not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_ms bigint,
  policy proctoring_policy not null,
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists focus_events_candidate_idx
  on public.focus_events (candidate_id);

create index if not exists focus_events_job_profile_idx
  on public.focus_events (job_profile_id);

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  job_profile_id uuid not null references public.job_profiles (id) on delete cascade,
  application_id uuid references public.job_applications (id) on delete set null,
  current_stage_index integer,
  current_question_index integer,
  stage_statuses jsonb,
  answers jsonb,
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  status interview_session_status not null default 'active'
);

alter table public.interview_sessions
  add column if not exists application_id uuid references public.job_applications (id) on delete set null;

create index if not exists interview_sessions_candidate_idx
  on public.interview_sessions (candidate_id);

create index if not exists interview_sessions_job_profile_idx
  on public.interview_sessions (job_profile_id);

-- =========================
-- Tools & scoring
-- =========================

create table if not exists public.tool_usage_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions (id) on delete cascade,
  stage_id uuid references public.job_stages (id) on delete set null,
  tool_type tool_type not null,
  prompt text not null,
  response_excerpt text,
  full_response_ref text,
  validation_note text,
  created_at timestamptz not null default now()
);

create index if not exists tool_usage_logs_session_idx
  on public.tool_usage_logs (session_id);

create table if not exists public.stage_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions (id) on delete cascade,
  stage_id uuid not null references public.job_stages (id) on delete cascade,
  overall_score numeric,
  confidence numeric,
  competency_scores jsonb,
  flags jsonb,
  created_at timestamptz not null default now()
);

create index if not exists stage_scores_session_idx
  on public.stage_scores (session_id);

create index if not exists stage_scores_stage_idx
  on public.stage_scores (stage_id);

create table if not exists public.question_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions (id) on delete cascade,
  stage_id uuid not null references public.job_stages (id) on delete cascade,
  question_id uuid,
  question_index integer,
  score numeric,
  competency_scores jsonb,
  flags jsonb,
  created_at timestamptz not null default now()
);

create index if not exists question_scores_session_idx
  on public.question_scores (session_id);

create index if not exists question_scores_stage_idx
  on public.question_scores (stage_id);

-- =========================
-- Views: per-job application stats (counts by status, stage, etc.)
-- =========================

create or replace view public.job_application_stats as
select
  jp.id as job_profile_id,
  jp.employer_id,
  jp.title,
  jp.company_name,
  jp.category,
  jp.publish_state,
  count(ja.id) as total_applications,
  count(ja.id) filter (where ja.status = 'invited') as num_invited,
  count(ja.id) filter (where ja.status = 'applied') as num_applied,
  count(ja.id) filter (where ja.status = 'screening') as num_screening,
  count(ja.id) filter (where ja.status = 'in_interview') as num_in_interview,
  count(ja.id) filter (where ja.status = 'completed') as num_completed,
  count(ja.id) filter (where ja.status = 'offered') as num_offered,
  count(ja.id) filter (where ja.status = 'rejected') as num_rejected,
  count(ja.id) filter (where ja.status = 'withdrawn') as num_withdrawn,
  count(ja.id) filter (where ja.current_stage_index = 0) as num_at_stage_0,
  count(ja.id) filter (where ja.current_stage_index = 1) as num_at_stage_1,
  count(ja.id) filter (where ja.current_stage_index = 2) as num_at_stage_2,
  count(ja.id) filter (where ja.current_stage_index = 3) as num_at_stage_3,
  count(ja.id) filter (where ja.current_stage_index >= 0) as num_in_pipeline
from public.job_profiles jp
left join public.job_applications ja on ja.job_profile_id = jp.id
group by jp.id, jp.employer_id, jp.title, jp.company_name, jp.category, jp.publish_state;

-- =========================
-- View: candidate's applications across all jobs (for candidate dashboard)
-- =========================

create or replace view public.candidate_applications_summary as
select
  cu.id as candidate_user_id,
  cu.email,
  cu.full_name,
  ja.id as application_id,
  ja.job_profile_id,
  ja.status as application_status,
  ja.current_stage_index,
  ja.invited_at,
  ja.applied_at,
  ja.rejected_at,
  ja.offered_at,
  ja.withdrawn_at,
  ja.created_at as application_created_at,
  jp.title as job_title,
  jp.company_name as job_company_name,
  jp.category as job_category,
  jp.seniority as job_seniority,
  jp.publish_state as job_publish_state
from public.candidate_users cu
join public.job_applications ja on ja.candidate_user_id = cu.id
join public.job_profiles jp on jp.id = ja.job_profile_id;

-- =========================
-- View: employer's jobs with application counts (for employer dashboard)
-- =========================

create or replace view public.employer_jobs_summary as
select
  eu.id as employer_id,
  eu.email as employer_email,
  eu.company_name,
  eu.full_name as employer_full_name,
  jp.id as job_profile_id,
  jp.title,
  jp.category,
  jp.publish_state,
  jp.created_at as job_created_at,
  coalesce(stats.total_applications, 0) as total_applications,
  coalesce(stats.num_rejected, 0) as num_rejected,
  coalesce(stats.num_offered, 0) as num_offered,
  coalesce(stats.num_in_interview, 0) as num_in_interview,
  coalesce(stats.num_applied, 0) as num_applied
from public.employer_users eu
join public.job_profiles jp on jp.employer_id = eu.id
left join public.job_application_stats stats on stats.job_profile_id = jp.id;

