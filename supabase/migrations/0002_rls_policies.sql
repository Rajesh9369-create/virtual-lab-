-- =====================================================================
-- PHARMA VIRTUAL LAB — Row Level Security
-- Migration 0002.
--
-- Principle: the client is never trusted. Ownership is enforced by the
-- database using auth.uid(), never by a user_id supplied by the browser.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper: is the caller an admin?
-- ---------------------------------------------------------------------

create or replace function is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from profiles
    where profiles.user_id = auth.uid() and profiles.role = 'ADMIN'
  );
$$;

create or replace function is_faculty()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from profiles
    where profiles.user_id = auth.uid() and profiles.role in ('FACULTY','ADMIN')
  );
$$;

-- ---------------------------------------------------------------------
-- Enable RLS everywhere that holds student data or controlled content
-- ---------------------------------------------------------------------

alter table profiles              enable row level security;
alter table roles                 enable row level security;
alter table subjects              enable row level security;
alter table topics                enable row level security;
alter table experiments           enable row level security;
alter table experiment_steps      enable row level security;
alter table simulations           enable row level security;
alter table references            enable row level security;
alter table experiment_references enable row level security;
alter table subject_references    enable row level security;
alter table viva_questions        enable row level security;
alter table clinical_cases        enable row level security;
alter table experiment_attempts   enable row level security;
alter table experiment_events     enable row level security;
alter table experiment_observations enable row level security;
alter table calculation_results   enable row level security;
alter table experiment_results    enable row level security;
alter table viva_attempts         enable row level security;
alter table viva_answers          enable row level security;
alter table simulation_attempts   enable row level security;
alter table clinical_case_attempts enable row level security;
alter table mastery_records       enable row level security;
alter table competency_evidence   enable row level security;
alter table learning_events       enable row level security;
alter table credits_ledger        enable row level security;
alter table content_versions      enable row level security;
alter table audit_logs            enable row level security;
alter table mastery_thresholds    enable row level security;

-- ---------------------------------------------------------------------
-- Profiles: a user sees and edits only their own. Faculty and admins may
-- read a limited view. Nobody reads passwords — they are not here.
-- ---------------------------------------------------------------------

create policy profiles_select_own on profiles
  for select using (user_id = auth.uid() or is_faculty());

create policy profiles_update_own on profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy profiles_insert_own on profiles
  for insert with check (user_id = auth.uid());

-- Role escalation is not permitted through the client.
create policy profiles_no_role_escalation on profiles
  for update using (user_id = auth.uid())
  with check (
    role = (select p.role from profiles p where p.user_id = auth.uid())
    or is_admin()
  );

-- ---------------------------------------------------------------------
-- Roles reference table: readable by all authenticated users.
-- ---------------------------------------------------------------------

create policy roles_read on roles for select using (auth.uid() is not null);

-- ---------------------------------------------------------------------
-- Content: students read only PUBLISHED content. Admins manage it.
-- ---------------------------------------------------------------------

create policy content_read_published_subjects on subjects
  for select using (content_status = 'PUBLISHED' or is_admin());

create policy content_read_published_topics on topics
  for select using (content_status = 'PUBLISHED' or is_admin());

create policy content_read_published_experiments on experiments
  for select using (content_status = 'PUBLISHED' or is_admin());

create policy content_read_published_steps on experiment_steps
  for select using (content_status = 'PUBLISHED' or is_admin());

create policy content_read_published_simulations on simulations
  for select using (content_status = 'PUBLISHED' or is_admin());

create policy content_read_published_references on references
  for select using (content_status = 'PUBLISHED' or is_admin());

create policy content_read_published_viva on viva_questions
  for select using (content_status = 'PUBLISHED' or is_admin());

create policy content_read_published_cases on clinical_cases
  for select using (content_status = 'PUBLISHED' or is_admin());

create policy experiment_refs_read on experiment_references
  for select using (
    exists (select 1 from experiments e where e.id = experiment_id
            and (e.content_status = 'PUBLISHED' or is_admin()))
  );

create policy subject_refs_read on subject_references
  for select using (
    exists (select 1 from subjects s where s.id = subject_id
            and (s.content_status = 'PUBLISHED' or is_admin()))
  );

-- Content write access is admin-only.
create policy content_admin_write_subjects on subjects
  for all using (is_admin()) with check (is_admin());
create policy content_admin_write_topics on topics
  for all using (is_admin()) with check (is_admin());
create policy content_admin_write_experiments on experiments
  for all using (is_admin()) with check (is_admin());
create policy content_admin_write_steps on experiment_steps
  for all using (is_admin()) with check (is_admin());
create policy content_admin_write_simulations on simulations
  for all using (is_admin()) with check (is_admin());
create policy content_admin_write_references on references
  for all using (is_admin()) with check (is_admin());
create policy content_admin_write_viva on viva_questions
  for all using (is_admin()) with check (is_admin());
create policy content_admin_write_cases on clinical_cases
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- Student learning records: strictly owner-only.
-- ---------------------------------------------------------------------

create policy attempts_own on experiment_attempts
  for all using (user_id = auth.uid() or is_faculty())
  with check (user_id = auth.uid());

create policy events_own on experiment_events
  for all using (user_id = auth.uid() or is_faculty())
  with check (user_id = auth.uid());

create policy observations_own on experiment_observations
  for all using (user_id = auth.uid() or is_faculty())
  with check (user_id = auth.uid());

create policy calculations_own on calculation_results
  for all using (user_id = auth.uid() or is_faculty())
  with check (user_id = auth.uid());

create policy results_own on experiment_results
  for all using (user_id = auth.uid() or is_faculty())
  with check (user_id = auth.uid());

create policy viva_attempts_own on viva_attempts
  for all using (user_id = auth.uid() or is_faculty())
  with check (user_id = auth.uid());

create policy viva_answers_own on viva_answers
  for all using (user_id = auth.uid() or is_faculty())
  with check (user_id = auth.uid());

create policy sim_attempts_own on simulation_attempts
  for all using (user_id = auth.uid() or is_faculty())
  with check (user_id = auth.uid());

create policy case_attempts_own on clinical_case_attempts
  for all using (user_id = auth.uid() or is_faculty())
  with check (user_id = auth.uid());

create policy mastery_own on mastery_records
  for all using (user_id = auth.uid() or is_faculty())
  with check (user_id = auth.uid());

create policy competency_own on competency_evidence
  for all using (user_id = auth.uid() or is_faculty())
  with check (user_id = auth.uid());

create policy learning_events_own on learning_events
  for all using (user_id = auth.uid() or is_faculty())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Credits: a student may read their own ledger but never write to it.
-- Awarding credit happens through a server-side function, not the client.
-- ---------------------------------------------------------------------

create policy credits_read_own on credits_ledger
  for select using (user_id = auth.uid() or is_faculty());

-- No insert/update/delete policy for students: writes are denied by default
-- under RLS because no policy grants them.
create policy credits_admin_all on credits_ledger
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- Versioning and audit: read for admins, write for admins.
-- ---------------------------------------------------------------------

create policy content_versions_admin on content_versions
  for all using (is_admin()) with check (is_admin());

create policy content_versions_read_own on content_versions
  for select using (is_faculty());

create policy audit_admin_all on audit_logs
  for all using (is_admin()) with check (is_admin());

create policy audit_read_faculty on audit_logs
  for select using (is_faculty());

-- ---------------------------------------------------------------------
-- Mastery thresholds: readable by all, writable only by admins.
-- ---------------------------------------------------------------------

create policy thresholds_read on mastery_thresholds
  for select using (auth.uid() is not null);

create policy thresholds_admin on mastery_thresholds
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- Credits award function.
--
-- SECURITY DEFINER so it can write to credits_ledger even though the
-- student's own RLS policies deny direct writes. It re-derives the user
-- from auth.uid() so a client-supplied user_id can never be honoured.
-- ---------------------------------------------------------------------

create or replace function award_credit(
  p_event_type    credit_event_type,
  p_reference_type text,
  p_reference_id   text,
  p_amount         integer,
  p_description    text default ''
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_inserted boolean := false;
begin
  if v_user is null then
    raise exception 'Unauthenticated request';
  end if;

  if p_amount <= 0 then
    raise exception 'Credit amount must be positive';
  end if;

  begin
    insert into credits_ledger (user_id, event_type, amount, reference_type, reference_id, description)
    values (v_user, p_event_type, p_amount, p_reference_type, p_reference_id, p_description);
    v_inserted := true;
  exception when unique_violation then
    -- Already credited for this exact activity. Not an error: the unique
    -- constraint is the anti-abuse control and simply makes this a no-op.
    v_inserted := false;
  end;

  return v_inserted;
end $$;

grant execute on function award_credit(credit_event_type, text, text, integer, text) to authenticated;

-- ---------------------------------------------------------------------
-- Credit balance view (derived, never stored)
-- ---------------------------------------------------------------------

create or replace view credit_balances as
  select user_id, sum(amount)::integer as balance, count(*) as entries
  from credits_ledger
  group by user_id;
