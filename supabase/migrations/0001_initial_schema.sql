-- =====================================================================
-- PHARMA VIRTUAL LAB — initial schema
-- PostgreSQL / Supabase. Migration 0001.
--
-- Design notes
--  * Every educational object is versioned so that historical student
--    attempts are never silently rewritten when content changes.
--  * Student-sensitive tables carry Row Level Security (0002).
--  * Derived metrics (totals, percentages) are NOT stored; they are
--    computed from the underlying records.
--  * Credits are a ledger, never a running balance.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

create type user_role as enum ('STUDENT', 'FACULTY', 'ADMIN');

create type content_status as enum ('DRAFT', 'IN_REVIEW', 'VERIFIED', 'PUBLISHED', 'ARCHIVED');

create type attempt_status as enum ('STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');

create type mastery_status as enum ('NEEDS_REVIEW', 'DEVELOPING', 'UNDERSTOOD', 'MASTERED');

create type verification_status as enum (
  'IP_OFFICIAL', 'IP_RELATED', 'HISTORICAL_IP',
  'OFFICIAL_GOVERNMENT', 'OFFICIAL_REGULATORY',
  'PEER_REVIEWED', 'ACADEMIC_REFERENCE',
  'NON_IP_EDUCATIONAL', 'EDUCATIONAL_SIMULATION', 'CONCEPTUAL_MODEL',
  'VERIFICATION_REQUIRED'
);

create type experiment_event_type as enum (
  'experiment_started',
  'apparatus_selected',
  'material_selected',
  'procedure_step_completed',
  'observation_recorded',
  'calculation_submitted',
  'result_submitted',
  'experiment_completed',
  'experiment_abandoned'
);

create type learning_event_type as enum (
  'topic_viewed',
  'subject_viewed',
  'experiment_started',
  'experiment_completed',
  'viva_completed',
  'concept_reviewed',
  'simulation_completed',
  'clinical_case_completed',
  'medication_review_completed',
  'counselling_completed',
  'hospital_simulation_completed',
  'resource_viewed'
);

create type credit_event_type as enum (
  'experiment_completed',
  'viva_completed',
  'simulation_completed',
  'clinical_case_completed',
  'concept_reviewed'
);

-- Competency dimensions stay separate: a student may be strong in
-- calculation and weak in interpretation, and that must remain visible.
create type competency_dimension as enum (
  'procedure',
  'observation',
  'calculation',
  'interpretation',
  'conceptual_understanding',
  'viva'
);

-- ---------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------

create table roles (
  id          text primary key check (id in ('STUDENT','FACULTY','ADMIN')),
  description text not null default ''
);

insert into roles (id, description) values
  ('STUDENT', 'Learner enrolled in the Pharm.D programme'),
  ('FACULTY', 'Teaching staff with access to assigned students'),
  ('ADMIN',   'Platform administrator');

-- ---------------------------------------------------------------------
-- Profiles — one row per authenticated user
-- ---------------------------------------------------------------------

create table profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  pharmd_year  smallint check (pharmd_year between 1 and 6),
  avatar_url   text,
  role         user_role not null default 'STUDENT',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index profiles_user_id_idx on profiles (user_id);
create index profiles_role_idx    on profiles (role);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Content: curriculum hierarchy
-- ---------------------------------------------------------------------

create table subjects (
  id           text primary key,
  title        text not null,
  year_number  smallint not null check (year_number between 1 and 6),
  focus        text,
  content_status content_status not null default 'PUBLISHED',
  version      integer not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index subjects_year_idx        on subjects (year_number);
create index subjects_content_status_idx on subjects (content_status);

create table topics (
  id             text primary key,
  subject_id     text not null references subjects (id) on delete cascade,
  title          text not null,
  position       integer not null default 0,
  content_status content_status not null default 'DRAFT',
  version        integer not null default 1,
  created_at     timestamptz not null default now()
);

create index topics_subject_idx   on topics (subject_id);
create index topics_status_idx    on topics (content_status);

-- ---------------------------------------------------------------------
-- Content: experiments, steps, simulations
-- ---------------------------------------------------------------------

create table experiments (
  id             text primary key,
  slug           text not null unique,
  title          text not null,
  subject_id     text references subjects (id) on delete set null,
  experiment_type text not null,
  category       text not null default 'EXPERIMENT'
                 check (category in ('EXPERIMENT','SIMULATION')),
  objective      text not null default '',
  scientific_concept text not null default '',
  content_status content_status not null default 'DRAFT',
  version        integer not null default 1,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index experiments_subject_idx on experiments (subject_id);
create index experiments_status_idx  on experiments (content_status);
create index experiments_slug_idx    on experiments (slug);

create table experiment_steps (
  id            text primary key,
  experiment_id text not null references experiments (id) on delete cascade,
  position      integer not null,
  title         text not null,
  instruction   text not null default '',
  phase         text not null default 'perform'
                check (phase in ('prepare','perform')),
  content_status content_status not null default 'DRAFT',
  version       integer not null default 1
);

create index experiment_steps_experiment_idx on experiment_steps (experiment_id);
create unique index experiment_steps_position_uq
  on experiment_steps (experiment_id, position);

create table simulations (
  id             text primary key,
  slug           text not null unique,
  title          text not null,
  subject_id     text references subjects (id) on delete set null,
  simulation_type text not null,
  objective      text not null default '',
  content_status content_status not null default 'DRAFT',
  version        integer not null default 1,
  created_at     timestamptz not null default now()
);

create index simulations_status_idx on simulations (content_status);

-- ---------------------------------------------------------------------
-- Content: references and pharmacopoeial evidence
-- ---------------------------------------------------------------------

create table references (
  id             text primary key,
  title          text not null,
  source_type    text not null,
  publisher      text,
  edition        text,
  year           smallint,
  url            text,
  description    text not null default '',
  status         verification_status not null default 'VERIFICATION_REQUIRED',
  relationship   text not null default 'EDUCATIONAL_SUMMARY',
  verified       boolean not null default false,
  verified_at    timestamptz,
  verified_by    uuid references profiles (user_id) on delete set null,
  content_status content_status not null default 'PUBLISHED',
  version        integer not null default 1,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- A URL may only be present when the reference is verified.
  constraint references_url_requires_verification check (
    url is null or verified = true
  )
);

create index references_status_idx on references (status);

create table experiment_references (
  experiment_id text not null references experiments (id) on delete cascade,
  reference_id  text not null references references (id) on delete cascade,
  primary key (experiment_id, reference_id)
);

create table subject_references (
  subject_id  text not null references subjects (id) on delete cascade,
  reference_id text not null references references (id) on delete cascade,
  primary key (subject_id, reference_id)
);

-- ---------------------------------------------------------------------
-- Content: viva questions
-- ---------------------------------------------------------------------

create table viva_questions (
  id             text primary key,
  experiment_id  text not null references experiments (id) on delete cascade,
  concept_id     text not null,
  question_type  text not null,
  question_text  text not null,
  options        jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  explanation    text not null default '',
  difficulty     text not null default 'FOUNDATION'
                 check (difficulty in ('FOUNDATION','UNDERSTANDING','APPLICATION','ANALYSIS')),
  reference_id   text references references (id) on delete set null,
  version        integer not null default 1,
  verification_status verification_status not null default 'VERIFICATION_REQUIRED',
  content_status content_status not null default 'DRAFT',
  created_at     timestamptz not null default now()
);

create index viva_questions_experiment_idx on viva_questions (experiment_id);
create index viva_questions_status_idx     on viva_questions (content_status);

-- ---------------------------------------------------------------------
-- Content: clinical cases
-- ---------------------------------------------------------------------

create table clinical_cases (
  id             text primary key,
  slug           text not null unique,
  title          text not null,
  subject_id     text references subjects (id) on delete set null,
  objective      text not null default '',
  case_data      jsonb not null default '{}'::jsonb,
  content_status content_status not null default 'DRAFT',
  version        integer not null default 1,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Learning: experiment attempts
-- ---------------------------------------------------------------------

create table experiment_attempts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  experiment_id      text not null references experiments (id),
  experiment_version integer not null,
  attempt_number     integer not null,
  status             attempt_status not null default 'STARTED',
  started_at         timestamptz not null default now(),
  completed_at       timestamptz,

  constraint experiment_attempts_no_negative_attempt check (attempt_number >= 1),
  -- completed_at only makes sense once the attempt is completed
  constraint experiment_attempts_completion check (
    (status = 'COMPLETED') = (completed_at is not null)
  )
);

create unique index experiment_attempts_user_experiment_number_uq
  on experiment_attempts (user_id, experiment_id, attempt_number);

create index experiment_attempts_user_idx        on experiment_attempts (user_id);
create index experiment_attempts_experiment_idx on experiment_attempts (experiment_id);
create index experiment_attempts_status_idx     on experiment_attempts (status);

create table experiment_events (
  id          uuid primary key default gen_random_uuid(),
  attempt_id  uuid not null references experiment_attempts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  event_type  experiment_event_type not null,
  step_id     text references experiment_steps (id) on delete set null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index experiment_events_attempt_idx  on experiment_events (attempt_id);
create index experiment_events_user_idx     on experiment_events (user_id);
create index experiment_events_created_idx on experiment_events (created_at);

-- ---------------------------------------------------------------------
-- Learning: observations and calculation results
-- ---------------------------------------------------------------------

create table experiment_observations (
  id             uuid primary key default gen_random_uuid(),
  attempt_id     uuid not null references experiment_attempts (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  step_id        text references experiment_steps (id) on delete set null,
  observation_key text not null,
  observed_value numeric,
  unit           text,
  interpretation text,
  recorded_at    timestamptz not null default now()
);

create index experiment_observations_attempt_idx on experiment_observations (attempt_id);
create index experiment_observations_user_idx    on experiment_observations (user_id);

create table calculation_results (
  id                  uuid primary key default gen_random_uuid(),
  attempt_id          uuid not null references experiment_attempts (id) on delete cascade,
  user_id             uuid not null references auth.users (id) on delete cascade,
  calculation_key     text not null,
  student_input       numeric,
  expected_value      numeric,
  unit                text,
  tolerance           numeric,
  correct             boolean not null,
  calculation_version integer not null default 1,
  created_at          timestamptz not null default now()
);

create index calculation_results_attempt_idx on calculation_results (attempt_id);
create index calculation_results_user_idx    on calculation_results (user_id);

create table experiment_results (
  id           uuid primary key default gen_random_uuid(),
  attempt_id   uuid not null unique references experiment_attempts (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  experiment_id text not null references experiments (id),
  summary      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index experiment_results_user_idx on experiment_results (user_id);

-- ---------------------------------------------------------------------
-- Learning: viva attempts and answers
-- ---------------------------------------------------------------------

create table viva_attempts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  experiment_id      text not null references experiments (id),
  assessment_version integer not null,
  started_at         timestamptz not null default now(),
  completed_at       timestamptz,
  score              numeric check (score >= 0 and score <= 100),
  correct_count      integer not null default 0 check (correct_count >= 0),
  incorrect_count    integer not null default 0 check (incorrect_count >= 0),

  constraint viva_attempts_completion check (
    (completed_at is null) or (score is not null)
  )
);

create index viva_attempts_user_idx        on viva_attempts (user_id);
create index viva_attempts_experiment_idx on viva_attempts (experiment_id);

create table viva_answers (
  id          uuid primary key default gen_random_uuid(),
  attempt_id  uuid not null references viva_attempts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  question_id text not null references viva_questions (id),
  answer      text not null,
  correct     boolean not null,
  attempts    integer not null default 1 check (attempts >= 1),
  answered_at timestamptz not null default now()
);

create index viva_answers_attempt_idx  on viva_answers (attempt_id);
create index viva_answers_user_idx     on viva_answers (user_id);
create index viva_answers_question_idx on viva_answers (question_id);

-- ---------------------------------------------------------------------
-- Learning: simulation and clinical case attempts
-- ---------------------------------------------------------------------

create table simulation_attempts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  simulation_id   text not null references simulations (id),
  simulation_version integer not null,
  status          attempt_status not null default 'STARTED',
  decisions       jsonb not null default '[]'::jsonb,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index simulation_attempts_user_idx       on simulation_attempts (user_id);
create index simulation_attempts_simulation_idx on simulation_attempts (simulation_id);

create table clinical_case_attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  clinical_case_id text not null references clinical_cases (id),
  case_version   integer not null,
  status         attempt_status not null default 'STARTED',
  decisions      jsonb not null default '[]'::jsonb,
  started_at     timestamptz not null default now(),
  completed_at   timestamptz
);

create index clinical_case_attempts_user_idx on clinical_case_attempts (user_id);

-- ---------------------------------------------------------------------
-- Learning: mastery and competency evidence
-- ---------------------------------------------------------------------

-- Mastery is evidence-based and multi-signal. It is never derived from a
-- single score, and never from page visits or time spent.
create table mastery_records (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  concept_id      text not null,
  status          mastery_status not null default 'NEEDS_REVIEW',
  attempts        integer not null default 0 check (attempts >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  evidence_count  integer not null default 0 check (evidence_count >= 0),
  last_updated    timestamptz not null default now(),
  unique (user_id, concept_id)
);

create index mastery_records_user_idx   on mastery_records (user_id);
create index mastery_records_status_idx on mastery_records (status);

create table competency_evidence (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  concept_id  text not null,
  dimension   competency_dimension not null,
  correct     boolean not null,
  source_type text not null,
  source_id   text,
  created_at  timestamptz not null default now()
);

create index competency_evidence_user_idx    on competency_evidence (user_id);
create index competency_evidence_concept_idx on competency_evidence (concept_id);
create index competency_evidence_dimension_idx on competency_evidence (dimension);

-- ---------------------------------------------------------------------
-- Learning events
-- ---------------------------------------------------------------------

create table learning_events (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  event_type    learning_event_type not null,
  subject_id    text references subjects (id) on delete set null,
  topic_id      text references topics (id) on delete set null,
  experiment_id text references experiments (id) on delete set null,
  simulation_id text references simulations (id) on delete set null,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index learning_events_user_idx    on learning_events (user_id);
create index learning_events_created_idx on learning_events (created_at);
create index learning_events_type_idx    on learning_events (event_type);

-- ---------------------------------------------------------------------
-- Credits ledger
--
-- A ledger, never a running balance. The balance is SUM(amount).
-- The unique constraint makes credit award idempotent per learning event,
-- which is the primary anti-abuse control.
-- ---------------------------------------------------------------------

create table credits_ledger (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  event_type  credit_event_type not null,
  amount      integer not null check (amount > 0),
  reference_type text not null,
  reference_id text not null,
  description text not null default '',
  created_at  timestamptz not null default now(),

  -- A student cannot be credited twice for the same completed activity.
  unique (user_id, event_type, reference_type, reference_id)
);

create index credits_ledger_user_idx   on credits_ledger (user_id);
create index credits_ledger_created_idx on credits_ledger (created_at);

-- ---------------------------------------------------------------------
-- Content versioning
-- ---------------------------------------------------------------------

create table content_versions (
  id             uuid primary key default gen_random_uuid(),
  entity_type    text not null,
  entity_id      text not null,
  version        integer not null,
  changed_by     uuid references profiles (user_id) on delete set null,
  change_summary text not null default '',
  snapshot       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  unique (entity_type, entity_id, version)
);

create index content_versions_entity_idx on content_versions (entity_type, entity_id);

-- ---------------------------------------------------------------------
-- Audit log — administrative actions only
--
-- Never logs passwords or authentication credentials.
-- ---------------------------------------------------------------------

create table audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references profiles (user_id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   text,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index audit_logs_actor_idx  on audit_logs (actor_id);
create index audit_logs_created_idx on audit_logs (created_at);
create index audit_logs_action_idx on audit_logs (action);

-- ---------------------------------------------------------------------
-- Mastery thresholds are configuration, not hard-coded constants.
-- ---------------------------------------------------------------------

create table mastery_thresholds (
  id                text primary key default 'default',
  needs_review_max  numeric not null default 0.499,
  developing_max    numeric not null default 0.699,
  understood_max    numeric not null default 0.899,
  mastered_min      numeric not null default 0.90,
  min_evidence      integer not null default 3,
  min_attempts      integer not null default 2,
  updated_at        timestamptz not null default now()
);

insert into mastery_thresholds (id) values ('default');
